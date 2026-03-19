import { GoogleGenAI } from "@google/genai";

// Initialize the SDK with your API Key
// In this environment, the key is provided via process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export const getGeminiResponse = async (prompt: string) => {
  try {
    // Use the gemini-3-flash-preview model
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while thinking.";
  }
};
