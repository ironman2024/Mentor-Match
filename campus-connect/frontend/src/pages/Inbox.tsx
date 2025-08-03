import React from 'react';
import { Box, Typography } from '@mui/material';
import ChatInterface from '../components/chat/ChatInterface';

const Inbox: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#585E6C', fontWeight: 600 }}>
        Messages
      </Typography>
      <ChatInterface />
    </Box>
  );
};

export default Inbox;