import { migrate } from "drizzle-orm/node-postgres/migrator";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { buildServer } from "./utils/server";
import { db } from "./db";
import { FastifyInstance } from "fastify";
import { redactSensitiveInfo } from "./utils/redact";

async function gracefulShutdown({ app }: { app: FastifyInstance }) {
  await app.close();
}

async function main() {
  const app = await buildServer();

  app.listen({ port: env.PORT, host: env.HOST }, (err, address) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    logger.info(`Server listening at ${address}`);
  });

  await migrate(db, {
    migrationsFolder: "./migrations",
  });

  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

  logger.debug(redactSensitiveInfo(env), "using env");

  for (const signal of signals) {
    process.on(signal, () => {
      gracefulShutdown({ app });
    });
  }
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
