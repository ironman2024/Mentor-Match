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

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

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
                  onClick={() => setSelectedUser(conv.otherUser)}
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
