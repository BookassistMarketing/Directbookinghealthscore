import { GoogleGenAI } from "@google/genai";

// Initialize the SDK with your API Key
// Vite uses import.meta.env to access variables from your .env file
const genAI = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY 
});

export const getGeminiResponse = async (prompt: string) => {
  try {
    // Use the gemini-1.5-flash model (fast and free)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while thinking.";
  }
};
