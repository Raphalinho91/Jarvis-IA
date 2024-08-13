import { logger } from "../../utils/logger";
import openai from "./openai";

interface Message {
  role: string;
  content: string;
}

async function determineLanguage(messages: Message[]): Promise<string> {
  try {
    messages.push({
      role: "system",
      content: `What language is used in this message?  Answer me by giving me only the spoken language, that's all, I want it in format: ISO 639-1 standard.`,
    });

    logger.fatal({ messages });
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

export default determineLanguage;
