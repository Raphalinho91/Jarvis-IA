import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import whatsappRoutes from "./whatsapp";
import validateHostname from "../../utils/middleware";

// Route racine
async function rootRouteHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const resData = {
      status: true,
      message: "Hello Everyone From Code 180. This API is working......",
    };
    reply.status(200).send(resData);
  } catch (error) {
    reply.status(500).send({ error: "Failed to process root route" });
  }
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Register the hostname validation middleware
  app.addHook("preHandler", validateHostname);

  // Enregistrer les routes WhatsApp
  try {
    app.register(whatsappRoutes, { prefix: "/whatsapp" });
  } catch (error) {
    app.log.error("Failed to register WhatsApp routes:", error);
  }

  // Enregistrer la route racine
  app.get("/", rootRouteHandler);

  // Routes pour Privacy Policy et Terms of Service
  app.get("/privacy-policy", async (request, reply) => {
    return reply.sendFile("privacy-policy.html");
  });

  app.get("/terms-of-service", async (request, reply) => {
    return reply.sendFile("terms-of-service.html");
  });
}

export default registerRoutes;
