import React, { useState } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import AIChatBox from '../components/chat/AIChatBox';
import { getChatResponse } from '../services/aiChat';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (message: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Add user message
      const userMessage = { role: 'user' as const, content: message, timestamp: new Date() };
      setMessages(prev => [...prev, userMessage]);

      // Get Gemini response
      const response = await getChatResponse(message);
      
      // Add AI response
      const aiMessage = { role: 'ai' as const, content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error('AI Chat error:', err);
      setError((err as Error).message || 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '90vh' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI Learning Assistant
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          Ask questions about programming, get help with concepts, or discuss project ideas
        </Typography>
      </Paper>
      
      <AIChatBox 
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        error={error}
      />
    </Box>
  );
};

export default AIChat;
