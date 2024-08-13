import { logger } from "../../utils/logger";
import openai from "./openai";

interface Message {
  role: string;
  content: string;
}

async function getChatGptResumeForDatabase(
  messages: Message[],
  language: string
): Promise<string> {
  try {
    messages.push({
      role: "system",
      content: `Please respond in ${language}. Interpret the results like a real estate analyst and summarize them for a customer.`,
    });

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

export default getChatGptResumeForDatabase;
