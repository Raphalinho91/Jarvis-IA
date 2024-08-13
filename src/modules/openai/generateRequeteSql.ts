import { logger } from "../../utils/logger";
import openai from "./openai";

interface Message {
  role: string;
  content: string;
}

async function generateRequeteSql(messages: Message[]): Promise<string> {
  try {
    messages.push({
      role: "system",
      content: `You have access to this database, which includes a "Logement" table. Note that the name of the "Logement" table is case-sensitive and must be used exactly as it is written with quotation marks ("Logement"). The "Logement" table has the following attributes:
        - city (varchar)
        - size (numeric, in square meters)
        - price (numeric, in euros)
        - number of bedrooms (numeric)
        - number of bathrooms (numeric)
        - description (varchar, optional)
        - type (varchar, Appartment or House)
        You only need to generate the SQL query, without any further explanation or response from the user message.`,
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

export default generateRequeteSql;
