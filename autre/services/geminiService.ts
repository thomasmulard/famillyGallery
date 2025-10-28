
import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is configured in the environment
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

export async function sendMessageToGemini(prompt: string, isThinkingMode: boolean): Promise<string> {
  const modelName = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const config = isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: config,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Désolé, une erreur est survenue: ${error.message}`;
    }
    return "Désolé, une erreur inconnue est survenue.";
  }
}
