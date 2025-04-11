import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MentorDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/mentorship/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Fetched requests:', response.data);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showNotification('Error fetching requests', 'error');
    }
  };

  useEffect(() => {
    if (user?.role === 'faculty') {
      fetchRequests();
    }
  }, [user]);

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5002/api/mentorship/request/${requestId}/status`,
        { status: action },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );

      showNotification(`Request ${action} successfully`, 'success');
      fetchRequests();

      if (action === 'accepted') {
        navigate('/inbox');
      }
    } catch (error) {
      console.error('Error handling request:', error);
      showNotification(`Failed to ${action} request`, 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ open: true, message, type });
  };

  if (user?.role !== 'faculty') {
    return (
      <Box p={3}>
        <Typography>Only faculty members can access this dashboard.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Mentorship Requests
      </Typography>

      <Paper elevation={2}>
        {requests.length === 0 ? (
          <Box p={3}>
            <Typography>No pending mentorship requests</Typography>
          </Box>
        ) : (
          <List>
            {requests.map((request) => (
              <ListItem
                key={request._id}
                sx={{
                  mb: 2,
                  borderBottom: '1px solid #eee',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={request.mentee?.avatar}>
                    {request.mentee?.name?.[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={request.mentee?.name}
                  secondary={
                    <>
                      <Typography variant="body2">
                        Department: {request.mentee?.department}
                      </Typography>
                      <Typography variant="body2">
                        Topic: {request.topic}
                      </Typography>
                      <Typography variant="caption">
                        Requested on: {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRequestAction(request._id, 'accepted')}
                    sx={{ mr: 1 }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRequestAction(request._id, 'rejected')}
                  >
                    Decline
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MentorDashboard;
