import { GoogleGenerativeAI } from "@google/generative-ai";

// Always use the Gemini API key for Gemini

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('No Gemini API key found in environment variables');
  throw new Error('Gemini API key is required');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const getChatResponse = async (message: string): Promise<string> => {
  if (!message.trim()) {
    return '';
  }
  try {
    console.log('API Key available:', !!API_KEY);
    console.log('Sending message to Gemini AI:', message.slice(0, 100) + '...');

    const prompt = `${message}\n\nPlease provide a helpful and informative response.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    if (!text || text.trim().length === 0) {
      return 'I received an empty response. Please try rephrasing your question.';
    }

    console.log('Received Gemini AI response:', text.slice(0, 100) + '...');
    return text.trim();

  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText
    });
    
    if (error.status === 404) {
      return 'The AI service is currently unavailable. Please check your API configuration.';
    } else if (error.status === 403) {
      return 'API access denied. Please check your API key.';
    } else {
      return `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again later.`;
    }
  }
};
