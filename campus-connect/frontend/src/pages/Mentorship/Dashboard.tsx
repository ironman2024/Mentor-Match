import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const MentorshipDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:5002/api/mentorship/stats'),
        axios.get('http://localhost:5002/api/mentorship/requests')
      ]);
      setStats(statsRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mentorship Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Overview</Typography>
            {stats && (
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Total Sessions"
                    secondary={stats.totalSessions}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Completed Sessions"
                    secondary={stats.completedSessions}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Active Students"
                    secondary={stats.activeStudents?.length || 0}
                  />
                </ListItem>
              </List>
            )}
          </Paper>
        </Grid>

        {/* Pending Requests */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pending Requests
            </Typography>
            <List>
              {requests.map((request: any) => (
                <ListItem key={request._id}>
                  <ListItemAvatar>
                    <Avatar src={request.mentee.avatar}>
                      {request.mentee.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={request.mentee.name}
                    secondary={request.topic}
                  />
                  <Box>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleRequestAction(request._id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRequestAction(request._id, 'rejected')}
                    >
                      Decline
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MentorshipDashboard;
