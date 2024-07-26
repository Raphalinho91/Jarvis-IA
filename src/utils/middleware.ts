import { FastifyReply, FastifyRequest } from "fastify";
import { logger } from "./logger";

const validateHostname = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // logger.info(request.headers)
  const allowedHostname = process.env.HOSTNAME;
  const requestHostname = request.headers.host;

  if (requestHostname !== allowedHostname) {
    reply.status(403).send({ error: "Forbidden: Invalid Hostname" });
  }
};

export default validateHostname;
