import { ChatOpenAI } from "@langchain/openai";

export function isLLMConfigured(): boolean {
  // Check if OpenAI API key is set
  return typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.trim() !== "";
}

export function getLLM() {
  if (isLLMConfigured()) {
    return new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o",
      temperature: 0.2,
    });
  }
  
  // Return null or simulated LLM configuration
  return null;
}
