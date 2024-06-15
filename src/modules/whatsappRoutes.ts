import { FastifyInstance } from "fastify";
import whatsappRoutes from './whatsapp';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Register WhatsApp routes
  app.register(whatsappRoutes, { prefix: '/whatsapp' });

  // Root route
  app.get('/', (req, res) => {
    let resData = {
      status: true,
      message: "Hello Everyone From Code 180. This API is working......",
    };
    res.status(200).send(resData);
  });
}
