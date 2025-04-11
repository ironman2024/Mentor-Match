import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Divider
} from '@mui/material';
import { Send as SendIcon, SmartToy as AIIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp?: Date;
}

interface AIChatBoxProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
}

const AIChatBox: React.FC<AIChatBoxProps> = ({ 
  onSendMessage, 
  messages, 
  isLoading,
  error 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    await onSendMessage(input);
    setInput('');
  };

  const formatMessageTime = (timestamp?: Date) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: '#f3f2ef',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <AIIcon fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600}>AI Career Assistant</Typography>
      </Box>

      {/* Messages Area with LinkedIn-style bubbles */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: '#f9fafb',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#e0e0e0',
          borderRadius: '3px',
        }
      }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 1,
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            {message.role === 'ai' && (
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <AIIcon fontSize="small" />
              </Avatar>
            )}
            <Box>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: message.role === 'user' ? '#0a66c2' : 'white',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: message.role === 'ai' ? '1px solid #e0e0e0' : 'none'
                }}
              >
                <Typography>{message.content}</Typography>
              </Paper>
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 0.5, 
                  display: 'block',
                  color: 'text.secondary',
                  textAlign: message.role === 'user' ? 'right' : 'left'
                }}
              >
                {formatMessageTime(message.timestamp)}
              </Typography>
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area with LinkedIn-style design */}
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your career question..."
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#f3f2ef',
              '&:hover': {
                bgcolor: '#eef3f8'
              }
            }
          }}
        />
        <IconButton 
          type="submit" 
          disabled={isLoading || !input.trim()}
          sx={{ 
            bgcolor: '#0a66c2',
            color: 'white',
            '&:hover': {
              bgcolor: '#004182'
            },
            '&.Mui-disabled': {
              bgcolor: '#e0e0e0',
              color: '#939393'
            }
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default AIChatBox;
