import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import { logger } from "../../utils/logger";
import getChatGptResponse from "../openai/openai";
import {
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
      reply.status(200).send(challenge);
    } else {
      reply.status(403).send();
    }
  } else {
    reply.status(400).send();
  }
}

async function handleIncomingMessage(changeValue: ChangeValue) {
  const message = changeValue.messages[0];
  const contact = changeValue.contacts[0];
  const { body: msgBody } = message.text;
  const { from: fromNumber } = message;
  const { name: profileName } = contact.profile;
  const { wa_id: profilePhoneNumber } = contact;

  logger.info(`Received message: ${msgBody}`);
  logger.info(`From number: ${fromNumber}`);
  logger.info(`Profile name: ${profileName}`);
  logger.info(`Profile phone number: ${profilePhoneNumber}`);

  await saveProfileToDatabase(profileName, profilePhoneNumber);

  if (!userConversations[fromNumber]) {
    userConversations[fromNumber] = [
      {
        role: "system",
        content: "You are ChatGPT, a large language model trained by OpenAI.",
      },
    ];
  }

  userConversations[fromNumber].push({ role: "user", content: msgBody });

  const chatGptResponse = await getChatGptResponse(
    userConversations[fromNumber]
  );

  userConversations[fromNumber].push({
    role: "assistant",
    content: chatGptResponse,
  });

  logger.info({ userConversations });

  const profileId = await getProfileIdByPhoneNumber(profilePhoneNumber);
  if (profileId === null) {
    throw new Error(
      `Profile ID not found for phone number: ${profilePhoneNumber}`
    );
  }

  await saveUserConversationToDatabase(
    profileId,
    profilePhoneNumber,
    userConversations[fromNumber],
    profileName
  );

  const options = {
    method: "POST",
    url: "https://graph.facebook.com/v19.0/264460340081018/messages",
    headers: {
      Authorization: `Bearer ${process.env.SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    data: {
      messaging_product: "whatsapp",
      to: fromNumber,
      type: "text",
      text: {
        body: chatGptResponse,
      },
    },
  };

  try {
    const response = await axios(options);
    console.info("Message sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending message:", error);
  }

  return {
    status: true,
    response: chatGptResponse,
    from: fromNumber,
    profileName: profileName,
    profilePhoneNumber: profilePhoneNumber,
  };
}

async function handleWebhook(
  request: FastifyRequest<{ Body: WebhookBody }>,
  reply: FastifyReply
) {
  const bodyParam = request.body;
  logger.info(bodyParam.object);
  logger.info(bodyParam.entry?.[0]?.changes?.[0]?.value?.messages?.[0]);

  if (
    bodyParam.object &&
    bodyParam.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  ) {
    const changeValue = bodyParam.entry[0].changes[0].value;
    const response = await handleIncomingMessage(changeValue);
    reply.status(200).send(response);
  } else {
    reply.status(404).send();
  }
}

async function whatsappRoutes(app: FastifyInstance): Promise<void> {
  app.get("/webhook", verifyWebhook);
  app.post("/webhook", handleWebhook);
}

export default whatsappRoutes;
