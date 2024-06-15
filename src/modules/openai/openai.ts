const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getChatGptResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are ChatGPT, a large language model trained by OpenAI.",
        },
        { role: "user", content: prompt },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export default getChatGptResponse;
