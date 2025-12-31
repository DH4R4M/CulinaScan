
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeIngredients = async (base64Image: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY is missing. Please ensure it is set in your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Act as CulinaScan, a world-class sustainable cooking assistant. 
    Analyze the provided image of food ingredients and perform these tasks:
    1. Identify all edible ingredients visible in the photo.
    2. Generate exactly two distinct recipes that use ONLY the identified ingredients plus basic pantry staples (salt, oil, pepper, water). 
    3. Provide one highly effective sustainability tip for storing these items to maximize shelf life.
    
    Return the data in strict JSON format.
  `;

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { text: prompt },
          imagePart 
        ] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identifiedIngredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of identified edible ingredients."
            },
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  emoji: { type: Type.STRING, description: "A relevant emoji for the dish." }
                },
                required: ["title", "ingredientsUsed", "instructions", "emoji"]
              }
            },
            storageTip: { type: Type.STRING }
          },
          required: ["identifiedIngredients", "recipes", "storageTip"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("The AI model returned an empty response.");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("403")) {
      throw new Error("API Key permission denied. Ensure your Gemini API key is active and has billing enabled if required.");
    }
    throw error;
  }
};
