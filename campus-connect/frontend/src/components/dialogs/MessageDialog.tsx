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
  const [messages, setMessages] = useState<any[]>([]);
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
      socket.on('receive_message', (newMessage: any) => {
        if (newMessage.sender._id === recipientId || newMessage.recipient === recipientId) {
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
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
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSend = async () => {
    try {
      const response = await axios.post('http://localhost:5002/api/messages', {
        recipientId,
        content: message
      });

      socket?.emit('send_message', {
        recipientId,
        message: response.data
      });

      setMessages(prev => [...prev, response.data]);
      setMessage('');
      scrollToBottom();
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {recipientName}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ height: '400px', overflowY: 'auto', mb: 2 }}>
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
                  bgcolor: msg.sender._id === user?._id ? 'primary.main' : 'grey.100',
                  color: msg.sender._id === user?._id ? 'white' : 'inherit',
                  borderRadius: 2,
                  p: 2
                }}
              >
                <Typography variant="body1">{msg.content}</Typography>
                <Typography variant="caption" color={msg.sender._id === user?._id ? 'inherit' : 'textSecondary'}>
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
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
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          variant="contained"
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageDialog;
