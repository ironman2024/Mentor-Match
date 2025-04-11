import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY;

export class AIService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }
}

export default new AIService();
