
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeIngredients = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Act as CulinaScan, a premium sustainable cooking assistant. 
    Analyze the provided image and:
    1. Identify all edible ingredients.
    2. Generate exactly two gourmet-style waste-reducing recipes. 
    3. For each recipe include:
       - title, emoji, ingredientsUsed, instructions.
       - prepTime (e.g. "15 mins").
       - difficulty ("Easy", "Medium", or "Hard").
       - calories (estimated total calories per serving).
    4. Provide one storage tip for longevity.
    5. Calculate sustainability impact metrics (co2SavedKg, score, reasoning).
    
    Return the data in strict JSON format.
  `;

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

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
            items: { type: Type.STRING }
          },
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                emoji: { type: Type.STRING },
                prepTime: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                calories: { type: Type.INTEGER }
              },
              required: ["title", "ingredientsUsed", "instructions", "emoji", "prepTime", "difficulty", "calories"]
            }
          },
          storageTip: { type: Type.STRING },
          impact: {
            type: Type.OBJECT,
            properties: {
              co2SavedKg: { type: Type.NUMBER },
              score: { type: Type.INTEGER },
              reasoning: { type: Type.STRING }
            },
            required: ["co2SavedKg", "score", "reasoning"]
          }
        },
        required: ["identifiedIngredients", "recipes", "storageTip", "impact"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as AnalysisResult;
};
