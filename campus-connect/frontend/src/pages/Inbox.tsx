import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import MessageDialog from '../components/dialogs/MessageDialog';

const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [mentorshipContext, setMentorshipContext] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
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
    }
  }, [selectedChat]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/messages/conversations');
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const handleMessageSent = () => {
    fetchConversations();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Messages</Typography>

      <Paper>
        <List>
          {conversations.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No messages yet"
                secondary="Start a conversation from the user's profile or using the message button"
              />
            </ListItem>
          ) : (
            conversations.map((conv: any) => (
              <React.Fragment key={conv._id}>
                <ListItem
                  button
                  onClick={() => {
                    setSelectedUser(conv.otherUser);
                    setSelectedChat(conv);
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="primary"
                      badgeContent={conv.unreadCount}
                      invisible={conv.unreadCount === 0}
                    >
                      <Avatar src={conv.otherUser?.avatar}>
                        {conv.otherUser?.name[0]}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conv.otherUser?.name}
                    secondary={
                      <Typography
                        variant="body2"
                        color={conv.unreadCount > 0 ? 'primary' : 'textSecondary'}
                      >
                        {conv.lastMessage.content}
                      </Typography>
                    }
                  />
                  <Typography variant="caption" color="textSecondary">
                    {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                  </Typography>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {selectedChat?.type === 'mentorship' && mentorshipContext && (
        <Box p={2} bgcolor="background.paper" borderBottom={1} borderColor="divider">
          <Typography variant="subtitle2" color="primary">
            Mentorship Session: {mentorshipContext.topic}
          </Typography>
        </Box>
      )}

      {selectedUser && (
        <MessageDialog
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          recipientId={selectedUser._id}
          recipientName={selectedUser.name}
          onMessageSent={handleMessageSent}
        />
      )}
    </Box>
  );
};

export default Inbox;
