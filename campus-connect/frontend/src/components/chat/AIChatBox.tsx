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
import ReactMarkdown from 'react-markdown';

// Update interface to match message types
interface AIChatBoxProps {
  onSendMessage: (message: string) => void;
  messages: Array<{
    role: 'user' | 'ai';  // Changed from 'assistant' to 'ai'
    content: string;
    timestamp?: Date;
  }>;
  isLoading: boolean;
  error?: string;
}

const AIChatBox: React.FC<AIChatBoxProps> = ({ 
  onSendMessage, 
  messages, 
  isLoading,
  error 
}) => {
  const [input, setInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!input.trim()) {
      setLocalError('Please enter a message');
      return;
    }

    try {
      await onSendMessage(input);
      setInput('');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const formatMessageTime = (timestamp?: Date) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '\n\n**$1**\n')
      .replace(/(\d+\.)/g, '\n$1')
      .replace(/•/g, '\n•')
      .replace(/(\n\s*[•\-]\s*)(.*?)(?=\n|$)/g, '$1$2')
      .replace(/\n{3,}/g, '\n\n');
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
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: '#f8f9fa'
      }}>
        <Avatar sx={{ 
          bgcolor: 'primary.main',
          width: 32,
          height: 32
        }}>
          <AIIcon fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600}>
          AI Learning Assistant
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: '#f8f9fa',
        '&::-webkit-scrollbar': {
          width: 6,
          height: 6
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#E0E0E0',
          borderRadius: 3
        }
      }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 1,
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {message.role === 'ai' && (
              <Avatar sx={{ 
                bgcolor: 'primary.main',
                width: 32,
                height: 32
              }}>
                <AIIcon fontSize="small" />
              </Avatar>
            )}
            <Box>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: message.role === 'ai' ? '1px solid #e0e0e0' : 'none'
                }}
              >
                {message.role === 'user' ? (
                  <Typography>{message.content}</Typography>
                ) : (
                  <Box sx={{ 
                    typography: 'body1',
                    '& p': { mt: 1.5, mb: 1.5, lineHeight: 1.6 },
                    '& strong': {
                      color: 'primary.main',
                      display: 'block',
                      fontSize: '1.1rem',
                      mt: 2,
                      mb: 1
                    },
                    '& ul, & ol': { pl: 2, my: 1 },
                    '& li': { mb: 1, pl: 1 },
                    '& li:last-child': { mb: 0 },
                    '& code': {
                      bgcolor: 'rgba(0,0,0,0.04)',
                      p: 0.5,
                      borderRadius: 1,
                      fontFamily: 'monospace'
                    }
                  }}>
                    <ReactMarkdown>
                      {formatMessage(message.content)}
                    </ReactMarkdown>
                  </Box>
                )}
              </Paper>
              {message.timestamp && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 0.5,
                    display: 'block',
                    color: 'text.secondary',
                    textAlign: message.role === 'user' ? 'right' : 'left'
                  }}
                >
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {localError && (
          <Alert 
            severity="error" 
            onClose={() => setLocalError(null)}
            sx={{ 
              mb: 2,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            {localError}
          </Alert>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
          bgcolor: 'white'
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about farming or agriculture..."
          disabled={isLoading}
          error={!!localError}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#f8f9fa',
              '&:hover': {
                bgcolor: '#f3f4f6'
              }
            }
          }}
        />
        <IconButton 
          type="submit" 
          disabled={isLoading || !input.trim()}
          sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark'
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
