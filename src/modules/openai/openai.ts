import { logger } from "../../utils/logger";
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: string;
  content: string;
}

async function getChatGptResponse(messages: Message[]): Promise<string> {
  try {
    // Append system message to inform about the database and table structure
    messages.push({
      role: "system",
      content: `You have access to a database with a table named "House". The table "House" has the following attributes:
        - address (string)
        - size (number, in square feet)
        - price (number, in USD)
        - numberOfBedrooms (number)
        - numberOfBathrooms (number)
        - description (string, optional)
      Please determine if the user's message can be transcribed into an SQL query. If yes, provide the SQL query.`,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    logger.info(response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export default getChatGptResponse;
