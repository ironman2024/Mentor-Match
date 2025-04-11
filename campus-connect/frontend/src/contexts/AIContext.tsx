import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
}

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Call Gemini API
      const response = await axios.post(
        `${GEMINI_API_ENDPOINT}?key=${API_KEY}`,
        {
          contents: [{
            parts: [{ text: message }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Extract AI response
      const aiResponse = response.data.candidates[0].content.parts[0].text;

      // Add AI response to messages
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err: any) {
      console.error('AI Chat error:', err);
      setError(err.response?.data?.error?.message || 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{ messages, setMessages, isLoading, setIsLoading, error }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};
