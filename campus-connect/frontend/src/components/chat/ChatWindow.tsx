import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, Divider, Menu, MenuItem, Fade } from '@mui/material';
import { Send as SendIcon, MoreVert as MoreVertIcon, Delete as DeleteIcon, Reply as ReplyIcon, VideoCall } from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import axios from '../../config/axios';
import UserAvatar from '../common/UserAvatar';
import MeetingDialog from './MeetingDialog';
import MeetingMessage from './MeetingMessage';

interface Message {
  _id: string;
  sender: { _id: string; name: string; avatar?: string };
  content: string;
  createdAt: string;
  read: boolean;
}

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  currentUserId: string;
  onMessageSent?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  currentUserId,
  onMessageSent
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  useEffect(() => {
    fetchMessages();
  }, [recipientId]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message: Message) => {
        console.log('Received new message:', message);
        if (
          (message.sender._id === recipientId && message.recipient === currentUserId) ||
          (message.sender._id === currentUserId && message.recipient === recipientId)
        ) {
          setMessages(prev => {
            const exists = prev.some(m => m._id === message._id);
            if (!exists) {
              return [...prev, message];
            }
            return prev;
          });
        }
      };

      const handleMessageDeleted = (data: { messageId: string }) => {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      };

      socket.on('new_message', handleNewMessage);
      socket.on('message_deleted', handleMessageDeleted);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('message_deleted', handleMessageDeleted);
      };
    }
  }, [socket, recipientId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for recipient:', recipientId);
      const response = await axios.get(`/messages/${recipientId}`);
      console.log('Messages response:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Initialize with empty array if no messages exist
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      console.log('Sending message to:', recipientId);
      const response = await axios.post('/messages', {
        recipientId,
        content: newMessage.trim()
      });

      console.log('Message sent response:', response.data);

      // Add message to local state immediately
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');

      // Emit socket event for real-time delivery
      if (socket) {
        socket.emit('send_message', {
          recipientId,
          message: response.data
        });
      }
      
      // Trigger conversation list reorder
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMessageMenu = (event: React.MouseEvent<HTMLElement>, message: Message) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedMessage(null);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      await axios.delete(`/messages/${selectedMessage._id}`);
      setMessages(prev => prev.filter(msg => msg._id !== selectedMessage._id));
      
      if (socket) {
        socket.emit('message_deleted', {
          messageId: selectedMessage._id,
          recipientId
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
    
    handleCloseMenu();
  };

  const handleSendMeetingLink = async (meetingLink: string, message: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.post('/messages', {
        recipientId,
        content: message
      });

      setMessages(prev => [...prev, response.data]);

      if (socket) {
        socket.emit('send_message', {
          recipientId,
          message: response.data
        });
      }
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending meeting link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#fafafa'
    }}>
      {/* Instagram-style Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'white',
        borderBottom: '1px solid #dbdbdb',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <UserAvatar 
          avatar={recipientAvatar}
          name={recipientName}
          size={32}
          sx={{ 
            border: '2px solid #e91e63'
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px' }}>
            {recipientName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#8e8e8e', fontSize: '12px' }}>
            Active now
          </Typography>
        </Box>
        <IconButton
          onClick={() => setMeetingDialogOpen(true)}
          sx={{
            color: '#4285f4',
            '&:hover': {
              bgcolor: 'rgba(66, 133, 244, 0.1)'
            }
          }}
        >
          <VideoCall />
        </IconButton>
      </Box>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        p: 1,
        display: 'flex', 
        flexDirection: 'column',
        gap: 0.5,
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#dbdbdb',
          borderRadius: '3px'
        }
      }}>
        {messages.map((message, index) => {
          const isOwn = message.sender._id === currentUserId;
          const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender._id !== message.sender._id);
          const hasMeetLink = /https:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/g.test(message.content);
          
          return (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                mb: 0.5,
                px: 1
              }}
            >
              {!isOwn && (
                <UserAvatar 
                  avatar={recipientAvatar}
                  name={recipientName}
                  size={20}
                  sx={{ 
                    mr: 1,
                    visibility: showAvatar ? 'visible' : 'hidden'
                  }}
                />
              )}
              
              <Box
                sx={{
                  position: 'relative',
                  maxWidth: '70%',
                  '&:hover .message-menu': {
                    opacity: 1
                  }
                }}
              >
                {hasMeetLink ? (
                  <MeetingMessage
                    content={message.content}
                    isOwn={isOwn}
                    timestamp={new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  />
                ) : (
                  <>
                    <Box
                      sx={{
                        p: '8px 12px',
                        borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        bgcolor: isOwn ? '#0084ff' : 'white',
                        color: isOwn ? 'white' : '#262626',
                        border: isOwn ? 'none' : '1px solid #efefef',
                        fontSize: '14px',
                        lineHeight: 1.4,
                        wordBreak: 'break-word'
                      }}
                    >
                      {message.content}
                    </Box>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        textAlign: isOwn ? 'right' : 'left',
                        color: '#8e8e8e',
                        fontSize: '11px',
                        mt: 0.5,
                        mx: 1
                      }}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </>
                )}
                
                {/* Message options */}
                {isOwn && (
                  <IconButton
                    className="message-menu"
                    size="small"
                    onClick={(e) => handleMessageMenu(e, message)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      bgcolor: 'white',
                      border: '1px solid #dbdbdb',
                      width: 24,
                      height: 24,
                      '&:hover': {
                        bgcolor: '#f5f5f5'
                      }
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Instagram-style Message Input */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'white',
        borderTop: '1px solid #dbdbdb'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          bgcolor: '#f0f0f0',
          borderRadius: '20px',
          px: 2,
          py: 1
        }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '14px',
                '& .MuiInputBase-input': {
                  padding: '8px 0'
                }
              }
            }}
          />
          <IconButton 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || loading}
            sx={{
              color: newMessage.trim() ? '#0084ff' : '#8e8e8e',
              p: 0.5
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Message Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: 120
          }
        }}
      >
        <MenuItem onClick={handleDeleteMessage} sx={{ color: '#ed4956', fontSize: '14px' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>

      <MeetingDialog
        open={meetingDialogOpen}
        onClose={() => setMeetingDialogOpen(false)}
        recipientName={recipientName}
        onSendMeetingLink={handleSendMeetingLink}
      />
    </Box>
  );
};

export default ChatWindow;