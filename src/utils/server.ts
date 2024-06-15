import fastify, { FastifyInstance, FastifyLoggerOptions } from "fastify";
import { logger } from "./logger";
import { registerRoutes } from "../modules/whatsappRoutes";

export async function buildServer(): Promise<FastifyInstance> {
  const app: FastifyInstance = fastify({
    logger: logger as FastifyLoggerOptions,
  });

  // Register routes
  await registerRoutes(app);

  return app;
}
