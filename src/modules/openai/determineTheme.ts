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
      content: `Does this message have anything to do with real estate? with houses? is it a question about real estate or houses in general? If yes, answer only "true" if no, answer only "false".`,
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
