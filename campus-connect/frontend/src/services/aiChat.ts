import { GoogleGenerativeAI } from "@google/generative-ai";

// Always use the Gemini API key for Gemini
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('No Gemini API key found in environment variables');
  throw new Error('Gemini API key is required');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const getChatResponse = async (message: string): Promise<string> => {
  if (!message.trim()) {
    return '';
  }
  try {
    console.debug('Sending message to Gemini AI:', message.slice(0, 100) + '...');

    const prompt = `${message}\n\nPlease provide a helpful and informative response.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    if (!text || text.trim().length === 0) {
      return '';
    }

    console.debug('Received Gemini AI response:', text.slice(0, 100) + '...');
    return text.trim();

  } catch {
    return '';
  }
};
