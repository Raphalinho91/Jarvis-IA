import { logger } from "../../utils/logger";
import openai from "./openai";

interface Message {
  role: string;
  content: string;
}

async function determineThemeOfMessage(messages: Message[]): Promise<string> {
  try {
    messages.push({
      role: "system",
      content: `Is this message related to real estate? to houses? to apartments? to housing? is it a question about real estate, houses, housing, apartments in general? If yes, answer only "true" if no, answer only "false".`,
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

export default determineThemeOfMessage;
