import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import whatsappRoutes from "./whatsapp";

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
  // Enregistrer les routes WhatsApp
  try {
    app.register(whatsappRoutes, { prefix: "/whatsapp" });
  } catch (error) {
    app.log.error("Failed to register WhatsApp routes:", error);
  }

  // Enregistrer la route racine
  app.get("/", rootRouteHandler);
}

export default registerRoutes;
