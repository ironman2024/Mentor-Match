import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Stack
} from '@mui/material';
import {
  Event as EventIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ProfileCard from '../components/profile/ProfileCard';
import PostCreator from '../components/posts/PostCreator';
import PostFeed from '../components/posts/PostFeed';
import CertificateUploadDialog from '../components/dialogs/CertificateUploadDialog';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isPostingCertificate, setIsPostingCertificate] = useState(false);
  const navigate = useNavigate();

  const handleCreatePost = async (image?: File) => {
    try {
      const formData = new FormData();
      formData.append('content', newPost);
      formData.append('type', 'general');
      
      if (image) {
        formData.append('image', image);
        console.log('Appending image:', image); // Debug log
      }
  
      const response = await axios.post('http://localhost:5002/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Post creation response:', response.data);
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (error: any) {
      console.error('Error creating post:', error.response?.data || error);
    }
  };

  const handleCertificateUpload = async (certificateData: any) => {
    try {
      const formData = new FormData();
      formData.append('file', certificateData.file);
      formData.append('title', certificateData.title);
      formData.append('issuer', certificateData.issuer);
      formData.append('issueDate', certificateData.issueDate);
      formData.append('description', certificateData.description);
      if (certificateData.verificationUrl) {
        formData.append('verificationUrl', certificateData.verificationUrl);
      }

      const response = await axios.post('/api/posts/certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPosts([response.data, ...posts]);
      setIsPostingCertificate(false);
    } catch (error) {
      console.error('Error uploading certificate:', error);
      // TODO: Add error notification
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/posts/feed');
      console.log('Fetched posts:', response.data); // Debug log
      setPosts(response.data);
    } catch (error: any) {
      console.error('Error fetching posts:', error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const stats = [
    { title: 'Projects', value: '5', icon: <AssignmentIcon color="primary" /> },
    { title: 'Mentorship Sessions', value: '12', icon: <GroupIcon color="primary" /> },
    { title: 'Events Attended', value: '8', icon: <EventIcon color="primary" /> },
    { title: 'Reputation Points', value: '350', icon: <StarIcon color="primary" /> }
  ];

  const recentActivities = [
    { title: 'Joined Project: AI Study Group', time: '2 days ago' },
    { title: 'Completed Mentorship Session', time: '4 days ago' },
    { title: 'Earned Badge: Team Player', time: '1 week ago' }
  ];

  return (
    <Box sx={{ 
      background: '#F8F9FB',
      minHeight: '100vh',
      mx: -3,
      mt: -3,
      px: { xs: 1, md: 2 },
      py: { xs: 1, md: 2 },
    }}>
      <Grid container spacing={1.5}>
        {/* Left Column */}
        <Grid item xs={12} md={3}>
          <Box sx={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #B5BBC9',
            overflow: 'hidden',
          }}>
            <ProfileCard user={user} />
          </Box>
        </Grid>

        {/* Middle Column - Posts */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1.5}>
            <Paper elevation={0} sx={{
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid #B5BBC9',
              background: 'white',
            }}>
              <PostCreator
                value={newPost}
                onChange={setNewPost}
                onSubmit={handleCreatePost}
                onCertificateClick={() => setIsPostingCertificate(true)}
              />
            </Paper>
            <Box sx={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #B5BBC9',
              overflow: 'hidden',
            }}>
              <PostFeed posts={posts} />
            </Box>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={3}>
          <Stack spacing={1.5}>
            {/* Stats */}
            <Paper elevation={0} sx={{ 
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid #B5BBC9',
              background: 'white',
            }}>
              <Typography variant="h6" sx={{ 
                color: '#585E6C',
                fontWeight: 600,
                mb: 2
              }}>
                Stats Overview
              </Typography>
              <Grid container spacing={2}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Box sx={{
                      textAlign: 'center',
                      py: 2,
                      px: 1,
                      borderRadius: '16px',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      }
                    }}>
                      {React.cloneElement(stat.icon, { 
                        sx: { color: '#585E6C', fontSize: '2rem', mb: 1 } 
                      })}
                      <Typography variant="h4" sx={{ 
                        color: '#585E6C',
                        fontWeight: 700,
                        fontSize: '1.5rem'
                      }}>
                        {stat.value}
                      </Typography>
                      <Typography sx={{ 
                        color: '#B5BBC9',
                        fontSize: '0.875rem'
                      }}>
                        {stat.title}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Recent Activities */}
            <Paper elevation={0} sx={{ 
              p: 1.5, 
              borderRadius: '12px',
              border: '1px solid #B5BBC9',
              background: 'white',
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#585E6C' }}>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#585E6C' }}>
                          {activity.title[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.time}
                        sx={{
                          '& .MuiListItemText-primary': { color: '#585E6C' },
                          '& .MuiListItemText-secondary': { color: '#B5BBC9' }
                        }}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && 
                      <Divider sx={{ borderColor: '#B5BBC9' }} />
                    }
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <CertificateUploadDialog
        open={isPostingCertificate}
        onClose={() => setIsPostingCertificate(false)}
        onSubmit={handleCertificateUpload}
      />
    </Box>
  );
};

export default Dashboard;