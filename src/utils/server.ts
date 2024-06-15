import fastify, { FastifyInstance, FastifyLoggerOptions } from "fastify";
import { logger } from "./logger";
import { registerRoutes } from "../modules/whatsapp/whatsappRoutes";
import fastifyStatic from "@fastify/static";
import path from "path";

export async function buildServer(): Promise<FastifyInstance> {
  const app: FastifyInstance = fastify({
    logger: logger as FastifyLoggerOptions,
  });

  // Servir des fichiers statiques
  app.register(fastifyStatic, {
    root: path.join(__dirname, "../public"),
    prefix: "/public/",
  });

  // Register routes
  await registerRoutes(app);

  return app;
}
