import { logger } from "../../utils/logger";
import openai from "./openai";

interface Message {
  role: string;
  content: string;
}

async function getChatGptResponse(messages: Message[]): Promise<string> {
  try {
    messages.push({
      role: "system",
      content: `Does the message have anything to do with real estate or houses? 
      If so, then you have access to this database, which includes a "House" table,
      note that the table name "House" is case-sensitive and must be used exactly as 
      it is written with quotes ("House"), for generating only SQL queries without 
      other explanation or response. The table "House" has the following attributes:
        - city (varchar)
        - size (numeric, in square meters)
        - price (numeric, in euros)
        - numberOfBedrooms (numeric)
        - numberOfBathrooms (numeric)
        - description (varchar, optional)
      If not, answer the messages naturally.`,
    });
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

export default getChatGptResponse;
