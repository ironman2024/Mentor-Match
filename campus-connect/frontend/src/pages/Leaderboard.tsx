import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Rating,
  IconButton
} from '@mui/material';
import { Message as MessageIcon, Star as StarIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Leaderboard: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/users/mentors');
      setMentors(response.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const startChat = async (mentorId: string) => {
    try {
      const response = await axios.post('http://localhost:5002/api/chats', {
        participants: [mentorId]
      });
      navigate(`/inbox`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mentor Leaderboard
      </Typography>

      <Paper>
        <List>
          {mentors.map((mentor, index) => (
            <ListItem
              key={mentor._id}
              divider
              secondaryAction={
                user?.role === 'student' && (
                  <IconButton onClick={() => startChat(mentor._id)}>
                    <MessageIcon />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: index < 3 ? 'primary.main' : 'default',
                    width: 56,
                    height: 56
                  }}
                >
                  {index + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {mentor.name}
                    <Chip
                      size="small"
                      label={mentor.role}
                      color={mentor.role === 'faculty' ? 'primary' : 'secondary'}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Rating value={mentor.rating} readOnly size="small" />
                    <Typography variant="body2" color="textSecondary">
                      {mentor.expertise.join(', ')}
                    </Typography>
                  </Box>
                }
              />
              <Box textAlign="right">
                <Typography variant="h6">{mentor.reputation} pts</Typography>
                <Typography variant="caption" color="textSecondary">
                  {mentor.menteeCount} mentees
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Leaderboard;
