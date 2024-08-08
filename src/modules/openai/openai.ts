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
    messages.push({
      role: "system",
      content:
        "Please determine if the user's message can be transcribed into an SQL query. If yes, provide the SQL query.",
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
