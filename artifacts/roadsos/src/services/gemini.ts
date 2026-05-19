import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function askGemini(prompt: string): Promise<string> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return "Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.";
  }
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to get advice. Please try again.";
  }
}

export async function getEmergencyAdvice(situation: string, location?: string): Promise<string> {
  const prompt = `You are an emergency response assistant. Someone is in this emergency situation: "${situation}". ${location ? `Location: ${location}.` : ""} Provide immediate, concise, life-saving advice in 3-5 bullet points. Be direct and actionable. Start with the most critical action.`;
  return askGemini(prompt);
}
