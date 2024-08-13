import { logger } from "../../utils/logger";
import openai from "./openai";

interface Message {
  role: string;
  content: string;
}

async function generateSimpleMessage(messages: Message[]): Promise<string> {
  try {
    logger.info({ messages });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    logger.info(response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    logger.error("Error:", error);
    throw error;
  }
}

export default generateSimpleMessage;
