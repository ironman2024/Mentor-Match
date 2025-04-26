import React, { createContext, useContext, useState } from 'react';
import { getChatResponse } from '../services/aiChat';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  sendMessage: (message: string) => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);

      const response = await getChatResponse(message);
      
      const aiMessage = {
        role: 'ai',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      setError(error.message || 'Failed to get AI response');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    error,
    setError,
    sendMessage
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};
