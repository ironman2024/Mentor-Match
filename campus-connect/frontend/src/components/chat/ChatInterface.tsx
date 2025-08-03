import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';

const ChatInterface: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [refreshConversations, setRefreshConversations] = useState(0);
  const { user } = useAuth();

  const handleSelectConversation = (userId: string, userName: string, userAvatar?: string) => {
    setSelectedUser({ id: userId, name: userName, avatar: userAvatar });
  };
  
  const handleMessageSent = () => {
    // Trigger conversation list refresh
    setRefreshConversations(prev => prev + 1);
  };

  return (
    <Box sx={{ 
      height: '70vh', 
      display: 'flex',
      border: '1px solid #dbdbdb',
      borderRadius: '12px',
      overflow: 'hidden',
      bgcolor: 'white'
    }}>
      {/* Conversations List */}
      <Box sx={{ 
        width: '350px',
        borderRight: '1px solid #dbdbdb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #dbdbdb',
          bgcolor: 'white'
        }}>
          <Typography variant="h6" sx={{ 
            fontSize: '16px',
            fontWeight: 600,
            color: '#262626'
          }}>
            Messages
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedUserId={selectedUser?.id}
            key={refreshConversations}
          />
        </Box>
      </Box>

      {/* Chat Window */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUser && user ? (
          <ChatWindow
            recipientId={selectedUser.id}
            recipientName={selectedUser.name}
            recipientAvatar={selectedUser.avatar}
            currentUserId={user._id}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 3,
              bgcolor: '#fafafa'
            }}
          >
            <Box sx={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              border: '3px solid #262626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: '40px' }}>💬</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ 
                color: '#262626',
                fontSize: '22px',
                fontWeight: 300,
                mb: 1
              }}>
                Your Messages
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#8e8e8e',
                fontSize: '14px'
              }}>
                Send private messages to mentors and mentees
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatInterface;