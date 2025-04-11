import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Paper,
  Divider,
  Badge,
  CircularProgress,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Send as SendIcon, VideoCall as VideoCallIcon } from '@mui/icons-material';
import emptyChat from './../images/Chatting-rafiki.svg'; // Add this import

const EmptyStateIllustration = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="60" width="120" height="80" rx="8" stroke="#B5BBC9" strokeWidth="2"/>
    <path d="M40 80L100 120L160 80" stroke="#B5BBC9" strokeWidth="2"/>
    <circle cx="100" cy="100" r="40" stroke="#B5BBC9" strokeWidth="2" strokeDasharray="4 4"/>
  </svg>
);

const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [mentorshipContext, setMentorshipContext] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add separate polling for active chat
  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // Poll messages every 2 seconds
      const messageInterval = setInterval(fetchMessages, 2000);
      return () => clearInterval(messageInterval);
    }
  }, [selectedChat]);

  // Update conversation polling to 3 seconds
  useEffect(() => {
    fetchConversations();
    const conversationInterval = setInterval(fetchConversations, 3000);
    return () => clearInterval(conversationInterval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      // Add mentorship context if it exists
      const getMentorshipContext = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5002/api/mentorship/session/${selectedChat.mentorshipId}`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }
          );
          setMentorshipContext(response.data);
        } catch (error) {
          console.error('Error fetching mentorship context:', error);
        }
      };

      if (selectedChat.type === 'mentorship') {
        getMentorshipContext();
      }
      fetchMessages();
    }
  }, [selectedChat]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/messages/conversations');
      // Sort conversations by latest message timestamp
      const sortedConversations = response.data.sort((a: any, b: any) =>
        new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      );
      setConversations(sortedConversations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5002/api/messages/${selectedChat.otherUser._id}`);
      // Sort messages by timestamp
      const sortedMessages = response.data.sort((a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const response = await axios.post('http://localhost:5002/api/messages', {
        recipientId: selectedChat.otherUser._id,
        content: message
      });

      // Update messages with correct ordering
      setMessages(prev => [...prev, response.data].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
      setMessage('');
      scrollToBottom();
     
      // Update conversations list
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMessageSent = () => {
    fetchConversations();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVideoCall = () => {
    const meetingURL = "https://meet.google.com/new";
    window.open(meetingURL, "_blank");
  };

  const renderMessageContent = (content: string) => {
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    
    const parts = content.split(urlPattern);
    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        return (
          <Link
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'inherit',
              textDecorationColor: 'inherit',
              wordBreak: 'break-all'
            }}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      gap: 2,
      height: 'calc(100vh - 100px)',
      mx: -3,
      mt: -3,
    }}>
      {/* Conversations List */}
      <Paper elevation={0} sx={{
        width: '350px',
        borderRadius: '16px',
        border: '1px solid #B5BBC9',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #B5BBC9' }}>
          <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600 }}>
            Messages
          </Typography>
        </Box>
       
        <List sx={{
          overflowY: 'auto',
          flexGrow: 1,
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#B5BBC9',
            borderRadius: '3px'
          }
        }}>
          {conversations.length === 0 ? (
            <ListItem sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ mb: 3 }}>
                <EmptyStateIllustration />
              </Box>
              <ListItemText
                sx={{ textAlign: 'center' }}
                primary={
                  <Typography sx={{ color: '#585E6C', fontWeight: 500 }}>
                    No messages yet
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color: '#B5BBC9', mt: 1 }}>
                    Start a conversation from the user's profile or using the message button
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            conversations.map((conv: any) => (
              <ListItem
                button
                key={conv._id}
                selected={selectedChat?._id === conv._id}
                onClick={() => setSelectedChat(conv)}
                sx={{
                  borderLeft: selectedChat?._id === conv._id ? '4px solid #585E6C' : 'none',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(88,94,108,0.08)',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(88,94,108,0.05)',
                  }
                }}
              >
                <ListItemAvatar>
                  <Badge
                    color="primary"
                    badgeContent={conv.unreadCount}
                    invisible={conv.unreadCount === 0}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#585E6C'
                      }
                    }}
                  >
                    <Avatar
                      src={conv.otherUser?.avatar}
                      sx={{
                        bgcolor: '#585E6C',
                        width: 48,
                        height: 48
                      }}
                    >
                      {conv.otherUser?.name[0]}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{
                      color: '#585E6C',
                      fontWeight: conv.unreadCount > 0 ? 600 : 500
                    }}>
                      {conv.otherUser?.name}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#B5BBC9',
                        fontWeight: conv.unreadCount > 0 ? 500 : 400
                      }}
                    >
                      {conv.lastMessage.content}
                    </Typography>
                  }
                />
                <Typography variant="caption" sx={{ color: '#B5BBC9', ml: 2 }}>
                  {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                </Typography>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Chat Area */}
      <Paper elevation={0} sx={{
        flexGrow: 1,
        borderRadius: '16px',
        border: '1px solid #B5BBC9',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: selectedChat ? 1 : 0.5,
        transition: 'opacity 0.3s ease'
      }}>
        {selectedChat ? (
          <>
            <Box sx={{
              p: 2,
              borderBottom: '1px solid #B5BBC9',
              background: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600 }}>
                  {selectedChat.otherUser?.name}
                </Typography>
                {selectedChat?.type === 'mentorship' && mentorshipContext && (
                  <Typography variant="caption" sx={{ color: '#B5BBC9' }}>
                    Mentorship Session: {mentorshipContext.topic}
                  </Typography>
                )}
              </Box>
              <Tooltip title="Start video call">
                <IconButton
                  onClick={handleVideoCall}
                  sx={{
                    color: '#585E6C',
                    '&:hover': {
                      bgcolor: 'rgba(88,94,108,0.08)',
                    }
                  }}
                >
                  <VideoCallIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: '#F8F9FB',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#B5BBC9',
                borderRadius: '3px'
              }
            }}>
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
                    <Typography variant="body1">
                      {renderMessageContent(msg.content)}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={{
              p: 2,
              borderTop: '1px solid #B5BBC9',
              background: 'white',
              display: 'flex',
              gap: 2
            }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
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
                  borderRadius: '30px',
                  px: 3,
                  background: '#585E6C',
                  '&:hover': {
                    background: '#474D59',
                  }
                }}
              >
                Send
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}>
            <img 
              src={emptyChat} 
              alt="No chat selected"
              style={{
                width: '200px',
                height: 'auto',
                marginBottom: '16px'
              }}
            />
            <Typography sx={{ color: '#B5BBC9' }}>
              Select a conversation to start chatting
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Inbox;



