import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import AIChatBox from '../components/chat/AIChatBox';
import { useAI } from '../contexts/AIContext';

const AIChat: React.FC = () => {
  const { messages, sendMessage, isLoading } = useAI();

  return (
    <Box sx={{ p: 3, minHeight: '90vh' }}>
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
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default AIChat;
