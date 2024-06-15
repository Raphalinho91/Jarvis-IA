import pino from "pino";
import { LoggerOptions } from "pino";

const loggerOptions: LoggerOptions = {
  redact: ["DATABASE_CONNECTION"],
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
};

export const logger = pino(loggerOptions);
