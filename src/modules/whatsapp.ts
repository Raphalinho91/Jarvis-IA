import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import { logger } from "../utils/logger";

interface SendMessageRequest {
  to: string;
  message: string;
}

interface WebhookQuery {
  "hub.mode": string;
  "hub.verify_token": string;
  "hub.challenge": string;
}

interface WebhookBody {
  object: string;
  entry: Array<{
    changes: Array<{
      value: {
        messages: Array<{
          from: string; // Add the "from" field to capture the phone number
          text: {
            body: string;
          };
        }>;
      };
    }>;
  }>;
}

async function whatsappRoutes(app: FastifyInstance): Promise<void> {
  // Route to send a custom message to WhatsApp
  app.post('/sendMessage', async (request: FastifyRequest<{ Body: SendMessageRequest }>, reply: FastifyReply) => {
    const { to, message } = request.body;
    const resData = {
      status: false,
      answer: "",
    };

    try {
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
            body: message,
          },
        },
      };

      const response = await axios(options);
      resData.status = true;
      resData.answer = response.data;
      return reply.status(200).send(resData);
    } catch (error) {
      logger.error("Error during request:", error);
      resData.status = false;
      if (error instanceof Error) {
        resData.answer = error.message;
      } else {
        resData.answer = String(error);
      }
      return reply.status(500).send(resData);
    }
  });

  // Webhook verification endpoint
  app.get('/webhook', async (request: FastifyRequest<{ Querystring: WebhookQuery }>, reply: FastifyReply) => {
    const mode = request.query["hub.mode"];
    const token = request.query["hub.verify_token"];
    const challenge = request.query["hub.challenge"];

    if (mode && token) {
      if (mode === "subscribe" && token === process.env.MYTOKEN) {
        reply.status(200).send(challenge);
      } else {
        reply.status(403).send();
      }
    } else {
      reply.status(400).send();
    }
  });

  // Webhook endpoint for receiving messages
  app.post('/webhook', async (request: FastifyRequest<{ Body: WebhookBody }>, reply: FastifyReply) => {
    const bodyParam = request.body;

    logger.info(JSON.stringify(bodyParam, null, 2));

    if (bodyParam.object) {
      console.log("inside body param");
      if (
        bodyParam.entry &&
        bodyParam.entry[0].changes &&
        bodyParam.entry[0].changes[0].value.messages &&
        bodyParam.entry[0].changes[0].value.messages[0]
      ) {
        const msgBody = bodyParam.entry[0].changes[0].value.messages[0].text.body;
        const fromNumber = bodyParam.entry[0].changes[0].value.messages[0].from;

        logger.info("Received message: " + msgBody);
        logger.info("From number: " + fromNumber);

        reply.status(200).send({
          status: true,
          response: `Le message que vous venez d'envoyer est : ${msgBody}`,
          from: fromNumber,
        });
      } else {
        reply.status(404).send();
      }
    } else {
      reply.status(404).send();
    }
  });
}

export default whatsappRoutes;
