import { GoogleGenAI } from "@google/genai";
import { Book, StorySummary, BookIdea } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const gemini = {
  generateBookIdeas: async (input: { genres: string[], themes: string[] }): Promise<BookIdea[]> => {
    const prompt = `You are a visionary literary agent. Based on these genres: [${input.genres.join(', ')}] 
    and these themes: [${input.themes.join(', ')}], spark 3 unique, high-concept book ideas.
    Return ONLY a JSON array of objects with keys: "title", "premise", "genre", "themes", "targetAudience".
    The premises should be captivating and detailed.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '[]') as BookIdea[];
  },

  getStorySummary: async (book: Book): Promise<StorySummary> => {
    const prompt = `You are a sophisticated literary critic and storyteller. 
    Analyze the book titled "${book.title}" by ${book.authors.join(', ')}.
    Return a structural analysis in JSON format with the following keys:
    "summary": A beautiful, gripping 3-paragraph summary that focuses on the emotional core.
    "themes": A list of 4 deep philosophical themes explored in the book.
    "characterArcs": A list of the main character developments.
    "vibe": A descriptive string of the visual and emotional vibe.
    
    Description provided: ${book.description}
    
    Response MUST be valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    try {
      return JSON.parse(response.text || '{}') as StorySummary;
    } catch (e) {
      console.error("AI parse error", e);
      return {
        summary: "Unable to generate story profile at this time.",
        themes: [],
        characterArcs: [],
        vibe: "Unknown"
      };
    }
  },

  getRecommendations: async (library: Book[]): Promise<string[]> => {
    if (library.length === 0) return ["The Name of the Wind", "Dune", "Circe"];
    
    const favorites = library.slice(0, 10).map(b => b.title).join(', ');
    const prompt = `Based on these books in my library: ${favorites}. 
    Suggest 5 similar high-quality books. Return ONLY a JSON array of strings (book titles).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '[]') as string[];
  },

  lookupWord: async (word: string, context: string): Promise<string> => {
    const prompt = `Explain the word "${word}" in the context of this literary snippet: "${context}". 
    Provide a concise, scholarly definition and how it relates to the mood of the passage.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Definition unavailable.";
  }
};
