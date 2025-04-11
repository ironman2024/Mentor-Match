import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  Divider
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  recipient: string;
  createdAt: string;
  read: boolean;
}

interface MessageDialogProps {
  open: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  onMessageSent?: () => void;
}

const MessageDialog: React.FC<MessageDialogProps> = ({
  open,
  onClose,
  recipientId,
  recipientName,
  onMessageSent
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open, recipientId]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (newMessage: Message) => {
        if (newMessage.sender._id === recipientId || newMessage.recipient === recipientId) {
          setMessages(prev => {
            const updatedMessages = [...prev, newMessage].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return updatedMessages;
          });
        }
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, recipientId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5002/api/messages/${recipientId}`);
      const sortedMessages = response.data.sort((a: Message, b: Message) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const response = await axios.post<Message>('http://localhost:5002/api/messages', {
        recipientId,
        content: message.trim()
      });

      socket?.emit('send_message', {
        recipientId,
        message: response.data
      });

      setMessages(prev => [...prev, response.data].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
      setMessage('');
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          border: '1px solid #B5BBC9',
          boxShadow: '0 4px 20px rgba(88,94,108,0.1)',
          background: 'white',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center" px={1}>
          <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600 }}>
            {recipientName}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#B5BBC9' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{
          height: '400px',
          overflowY: 'auto',
          px: 3,
          display: 'flex',
          flexDirection: 'column-reverse', // This makes content start from bottom
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#B5BBC9',
            borderRadius: '3px'
          }
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg) => (
              <Box
                key={msg._id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender._id === user?._id ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    bgcolor: msg.sender._id === user?._id ? '#585E6C' : '#F8F9FB',
                    color: msg.sender._id === user?._id ? 'white' : '#585E6C',
                    borderRadius: '16px',
                    p: 2,
                    boxShadow: '0 2px 8px rgba(88,94,108,0.1)'
                  }}
                >
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#F8F9FB', borderTop: '1px solid #B5BBC9' }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (message.trim()) handleSend();
            }
          }}
          multiline
          maxRows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: 'white',
              '&:hover fieldset': {
                borderColor: '#585E6C',
              }
            }
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          variant="contained"
          endIcon={<SendIcon />}
          sx={{
            ml: 2,
            px: 3,
            py: 1,
            borderRadius: '30px',
            background: '#585E6C',
            textTransform: 'none',
            '&:hover': {
              background: '#474D59',
            }
          }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageDialog;



