import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import { logger } from "../../utils/logger";
import getChatGptResponse from "../openai/openai";
import {
  deleteUserConversationFromDatabase,
  getProfileIdByPhoneNumber,
  saveProfileToDatabase,
  saveUserConversationToDatabase,
} from "./whatsappServices";

interface WebhookQuery {
  "hub.mode": string;
  "hub.verify_token": string;
  "hub.challenge": string;
}

interface Message {
  from: string;
  text: {
    body: string;
  };
}

interface Contact {
  profile: {
    name: string;
  };
  wa_id: string;
}

interface ChangeValue {
  messages: Message[];
  contacts: Contact[];
}

interface WebhookBody {
  object: string;
  entry: Array<{
    changes: Array<{
      value: ChangeValue;
    }>;
  }>;
}

interface Headers {
  "true-client-ip"?: string;
  host?: string;
  "user-agent"?: string;
  "cf-connecting-ip"?: string;
  "x-forwarded-for"?: string;
}

const userConversations: {
  [key: string]: Array<{ role: string; content: string }>;
} = {};

async function verifyWebhook(
  request: FastifyRequest<{ Querystring: WebhookQuery }>,
  reply: FastifyReply
) {
  const {
    "hub.mode": mode,
    "hub.verify_token": token,
    "hub.challenge": challenge,
  } = request.query;

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.MYTOKEN) {
      return reply.status(200).send(challenge);
    } else {
      return reply.status(403).send();
    }
  } else {
    return reply.status(400).send();
  }
}

async function handleIncomingMessage(
  changeValue: ChangeValue,
  headers: Headers
) {
  const message = changeValue.messages[0];
  const contact = changeValue.contacts[0];
  const addressIp = headers["true-client-ip"] ?? "Unknown IP";
  const { body: msgBody } = message.text;
  const { from: fromNumber } = message;
  const { name: profileName } = contact.profile;
  const { wa_id: profilePhoneNumber } = contact;

  try {
    await saveProfileToDatabase(profileName, profilePhoneNumber, addressIp);

    if (msgBody.trim().toLowerCase() === "supprime la conversation") {
      return await handleDeleteConversation(fromNumber, profilePhoneNumber, profileName);
    }

    if (!userConversations[fromNumber]) {
      initializeUserConversation(fromNumber);
    }

    userConversations[fromNumber].push({ role: profileName, content: msgBody });

    await checkConversationLengthAndSummarize(fromNumber, profileName, msgBody);

    const chatGptResponse = await getChatGptResponse(userConversations[fromNumber]);

    userConversations[fromNumber].push({
      role: "assistant",
      content: chatGptResponse,
    });

    const profileId = await getProfileIdByPhoneNumber(profilePhoneNumber);
    if (profileId === null) {
      throw new Error(`Profile ID not found for phone number: ${profilePhoneNumber}`);
    }

    await saveUserConversationToDatabase(
      profileId,
      profilePhoneNumber,
      userConversations[fromNumber],
      profileName
    );

    await sendMessageToWhatsApp(fromNumber, chatGptResponse);

    return {
      status: true,
      response: chatGptResponse,
      from: fromNumber,
      profileName: profileName,
      profilePhoneNumber: profilePhoneNumber,
    };
  } catch (error) {
    handleError("Error processing incoming message:", error);
  }
}

async function handleDeleteConversation(fromNumber: string, profilePhoneNumber: string, profileName: string) {
  await deleteUserConversationFromDatabase(profilePhoneNumber);
  initializeUserConversation(fromNumber);

  const deletionResponse = "La conversation a été supprimée.";
  userConversations[fromNumber].push({
    role: "assistant",
    content: deletionResponse,
  });

  await sendMessageToWhatsApp(fromNumber, deletionResponse);

  return {
    status: true,
    response: deletionResponse,
    from: fromNumber,
    profileName: profileName,
    profilePhoneNumber: profilePhoneNumber,
  };
}

function initializeUserConversation(fromNumber: string) {
  userConversations[fromNumber] = [
    {
      role: "system",
      content: "You are ChatGPT, a large language model trained by OpenAI.",
    },
  ];
}

async function checkConversationLengthAndSummarize(fromNumber: string, profileName: string, msgBody: string) {
  let conversationLength = userConversations[fromNumber]
    .map((msg) => msg.content)
    .join(" ").length;

  if (conversationLength > 2000) {
    const summaryRequest = [
      ...userConversations[fromNumber],
      {
        role: "system",
        content: "La conversation ci-dessus est trop longue. Résumez-la en une seule phrase.",
      },
    ];

    const summaryResponse = await getChatGptResponse(summaryRequest);

    userConversations[fromNumber] = [
      {
        role: "system",
        content: "You are ChatGPT, a large language model trained by OpenAI.",
      },
      {
        role: "system",
        content: `Résumé de la conversation précédente : ${summaryResponse}`,
      },
      { role: profileName, content: msgBody },
    ];
  }
}

async function sendMessageToWhatsApp(to: string, body: string) {
  const options = {
    method: "POST",
    url: "https://graph.facebook.com/v19.0/264460340081018/messages",
    headers: {
      Authorization: `Bearer ${process.env.SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    data: {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: body,
      },
    },
  };

  try {
    const response = await axios(options);
    console.info("Message sent successfully:", response.data);
  } catch (error) {
    handleError("Error sending message:", error);
  }
}

function handleError(logMessage: string, error: unknown) {
  if (error instanceof Error) {
    logger.error(logMessage, error.message);
    throw new Error(`Failed to process incoming message: ${error.message}`);
  } else {
    logger.error(logMessage, error);
    throw new Error("Failed to process incoming message due to an unknown error.");
  }
}

async function handleWebhook(
  request: FastifyRequest<{ Body: WebhookBody }>,
  reply: FastifyReply
) {
  try {
    const headers = request.headers as Headers;
    const bodyParam = request.body;
    logger.info(bodyParam.object);
    logger.info(bodyParam.entry?.[0]?.changes?.[0]?.value?.messages?.[0]);

    if (bodyParam.object && bodyParam.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const changeValue = bodyParam.entry[0].changes[0].value;
      const response = await handleIncomingMessage(changeValue, headers);
      reply.status(200).send(response);
    } else {
      reply.status(404).send();
    }
  } catch (error) {
    handleError("Error handling webhook:", error);
    reply.status(500).send({ error: `Error handling webhook: ${error}` });
  }
}


async function whatsappRoutes(app: FastifyInstance): Promise<void> {
  app.get("/webhook", verifyWebhook);
  app.post("/webhook", handleWebhook);
}

export default whatsappRoutes;
