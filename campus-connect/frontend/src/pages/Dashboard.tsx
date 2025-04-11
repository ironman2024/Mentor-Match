import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <ProfileCard user={user} />
        </Grid>

        {/* Post Creation and Feed */}
        <Grid item xs={12} md={8}>
          <PostCreator
            value={newPost}
            onChange={setNewPost}
            onSubmit={handleCreatePost}
            onCertificateClick={() => setIsPostingCertificate(true)}
          />
          <PostFeed posts={posts} />
        </Grid>

        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  {stat.icon}
                  <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Typography color="textSecondary">{stat.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>{activity.title[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.time}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button variant="outlined" startIcon={<AssignmentIcon />}>
                Create New Project
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<GroupIcon />}
                onClick={() => navigate('/mentorship')}
              >
                Find Mentor
              </Button>
              <Button variant="outlined" startIcon={<EventIcon />}>
                Browse Events
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Certificate Upload Dialog */}
      <CertificateUploadDialog
        open={isPostingCertificate}
        onClose={() => setIsPostingCertificate(false)}
        onSubmit={handleCertificateUpload}
      />
    </Box>
  );
};

export default Dashboard;
