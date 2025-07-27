import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';
import { getChatResponse } from '../services/aiChat';

const GeminiTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const result = await getChatResponse(message);
      setResponse(result);
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Gemini API Test
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter a test message..."
        sx={{ mb: 2 }}
      />
      <Button 
        variant="contained" 
        onClick={testAPI} 
        disabled={loading || !message.trim()}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test API'}
      </Button>
      {response && (
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="body2">
            <strong>Response:</strong>
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {response}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default GeminiTest;