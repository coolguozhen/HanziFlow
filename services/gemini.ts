
import { GoogleGenAI, Type } from "@google/genai";
import { HanziInfo, SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const searchCharactersByPinyin = async (pinyin: string): Promise<SearchResult[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find common Chinese characters for the pinyin "${pinyin}". Return exactly 12 results in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  char: { type: Type.STRING },
                  pinyin: { type: Type.STRING },
                  brief: { type: Type.STRING }
                },
                required: ["char", "pinyin", "brief"]
              }
            }
          },
          required: ["results"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.results;
  } catch (error) {
    console.error("Error searching pinyin:", error);
    return [];
  }
};

export const getCharacterDetails = async (char: string): Promise<HanziInfo | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide detailed information for the Chinese character "${char}". Include its pinyin, radical, stroke count, English meaning, and 3 example phrases.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            character: { type: Type.STRING },
            pinyin: { type: Type.STRING },
            meaning: { type: Type.STRING },
            radical: { type: Type.STRING },
            strokes: { type: Type.NUMBER },
            examples: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["character", "pinyin", "meaning", "radical", "strokes", "examples"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching character details:", error);
    return null;
  }
};
