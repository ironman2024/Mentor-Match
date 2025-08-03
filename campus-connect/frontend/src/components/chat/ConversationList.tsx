import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box
} from '@mui/material';
import { useSocket } from '../../contexts/SocketContext';
import axios from '../../config/axios';
import UserAvatar from '../common/UserAvatar';

interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    sender: string;
  };
  unreadCount: number;
}

interface ConversationListProps {
  onSelectConversation: (userId: string, userName: string, userAvatar?: string) => void;
  selectedUserId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedUserId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const socket = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message: any) => {
        // Update conversations immediately and reorder
        setConversations(prev => {
          const otherUserId = message.sender._id === message.recipient ? message.recipient : message.sender._id;
          
          // Find existing conversation
          const existingIndex = prev.findIndex(conv => conv.otherUser._id === otherUserId);
          
          if (existingIndex !== -1) {
            // Move existing conversation to top with updated message
            const updatedConversations = [...prev];
            const conversation = { ...updatedConversations[existingIndex] };
            conversation.lastMessage = {
              content: message.content,
              createdAt: message.createdAt,
              sender: message.sender._id
            };
            
            // Remove from current position and add to beginning
            updatedConversations.splice(existingIndex, 1);
            return [conversation, ...updatedConversations];
          }
          
          return prev;
        });
        
        // Also fetch fresh data to ensure consistency
        fetchConversations();
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket]);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      const response = await axios.get('/messages/conversations');
      console.log('Conversations response:', response.data);
      
      // Sort conversations by most recent message
      const sortedConversations = response.data.sort((a: any, b: any) => {
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
      });
      
      setConversations(sortedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Box sx={{ height: '100%', bgcolor: 'white' }}>
      {conversations.map((conversation, index) => (
        <Box
          key={conversation._id}
          onClick={() => onSelectConversation(
            conversation.otherUser._id,
            conversation.otherUser.name,
            conversation.otherUser.avatar
          )}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            bgcolor: selectedUserId === conversation.otherUser._id ? '#f0f8ff' : 'transparent',
            borderBottom: '1px solid #efefef',
            '&:hover': {
              bgcolor: '#f5f5f5'
            },
            transition: 'background-color 0.2s'
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <UserAvatar 
              user={conversation.otherUser}
              size={56}
              sx={{ 
                border: conversation.unreadCount > 0 ? '3px solid #0084ff' : '2px solid #dbdbdb'
              }}
            />
            {conversation.unreadCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  bgcolor: '#ff3040',
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Box>
            )}
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                  fontSize: '14px',
                  color: '#262626',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '140px'
                }}
              >
                {conversation.otherUser.name}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#8e8e8e',
                  fontSize: '12px',
                  flexShrink: 0
                }}
              >
                {formatTime(conversation.lastMessage.createdAt)}
              </Typography>
            </Box>
            
            <Typography
              variant="body2"
              sx={{
                color: conversation.unreadCount > 0 ? '#262626' : '#8e8e8e',
                fontWeight: conversation.unreadCount > 0 ? 500 : 400,
                fontSize: '13px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {conversation.lastMessage.content}
            </Typography>
          </Box>
        </Box>
      ))}
      
      {conversations.length === 0 && (
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="h6" sx={{ color: '#8e8e8e', fontSize: '16px' }}>
            Your Messages
          </Typography>
          <Typography variant="body2" sx={{ color: '#8e8e8e', fontSize: '14px' }}>
            Send private messages to mentors and mentees
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ConversationList;