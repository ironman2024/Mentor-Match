import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CardMedia,
  CardActions,
  Button,
  IconButton as MuiIconButton,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  SmartToy as AIIcon,
  ArrowUpward as ArrowUpIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Bookmark as BookmarkIcon,
  Timeline as TimelineIcon,
  InsertPhoto as PhotoIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getChatResponse } from '../services/aiChat';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [aiMessage, setAiMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [openAiChat, setOpenAiChat] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/posts/feed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    // TODO: Implement post creation
  };

  const handleAiChat = async (message: string) => {
    try {
      setIsAiLoading(true);
      // Add user message
      const userMessage = { role: 'user' as const, content: message };
      setMessages(prev => [...prev, userMessage]);
      
      // Get AI response
      const response = await getChatResponse(message);
      
      // Add AI response
      const aiMessage = { role: 'assistant' as const, content: response };
      setMessages(prev => [...prev, aiMessage]);
      setAiMessage(response);
    } catch (error) {
      console.error('Error chatting with AI:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      handleAiChat(currentMessage);
      setCurrentMessage('');
    }
  };

  const stats = [
    {
      title: 'Active Projects',
      value: '5',
      icon: <AssignmentIcon />,
      change: '+2',
      color: '#0A66C2', // LinkedIn blue
      progress: 75
    },
    {
      title: 'Mentorship Hours',
      value: '24',
      icon: <GroupIcon />,
      change: '+5',
      color: '#07B53B', // Success green
      progress: 60
    },
    {
      title: 'Events Attended',
      value: '8',
      icon: <EventIcon />,
      change: '+1',
      color: '#A02EF9', // Purple
      progress: 40
    },
    {
      title: 'AI Assistant',
      value: isAiLoading ? 'Loading...' : (aiMessage ? 'Chat Active' : 'Chat'),
      icon: <AIIcon />,
      color: '#E16745', // Orange
      progress: 100,
      onClick: () => setOpenAiChat(true)
    }
  ];

  // Add loading state component
  const LoadingStats = () => (
    <Grid container spacing={2}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="text" sx={{ mt: 2 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mt: 1 }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const recentActivities = [
    {
      type: 'project',
      title: 'Started new project: AI Study Group',
      time: '2 hours ago',
      icon: <AssignmentIcon />,
      color: '#4CAF50'
    },
    {
      type: 'mentorship',
      title: 'Completed mentorship session with Dr. Smith',
      time: '1 day ago',
      icon: <SchoolIcon />,
      color: '#2196F3'
    },
    {
      type: 'achievement',
      title: 'Earned "Team Player" badge',
      time: '2 days ago',
      icon: <StarIcon />,
      color: '#FFD700'
    }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#f3f2ef', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Profile Summary Card - Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
            <Box sx={{ 
              height: 60, 
              bgcolor: 'primary.main',
              background: 'linear-gradient(135deg, #585E6C 0%, #2C3E50 100%)'
            }} />
            <Box sx={{ p: 2, pb: 3, textAlign: 'center', position: 'relative' }}>
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 72,
                  height: 72,
                  border: '4px solid white',
                  mx: 'auto',
                  mt: '-36px',
                  mb: 1
                }}
              />
              <Typography variant="h6" fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {user?.role}
              </Typography>

              {/* Add Profile Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  to="/profile"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    borderColor: '#585E6C',
                    color: '#585E6C',
                    '&:hover': {
                      borderColor: '#585E6C',
                      backgroundColor: 'rgba(88,94,108,0.08)'
                    }
                  }}
                >
                  View Profile
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  component={Link}
                  to="/profile/edit"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: '#585E6C',
                    '&:hover': {
                      bgcolor: '#474D59'
                    }
                  }}
                >
                  Edit Profile
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ px: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">Profile views</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">27</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Post impressions</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">149</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Stats Card */}
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              p: 3,
              mb: 2,
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            {loading ? (
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={12} key={item}>
                    <Skeleton 
                      variant="rectangular" 
                      height={140} 
                      sx={{ 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.8)'
                      }} 
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {stats.map((stat) => (
                  <Grid item xs={12} key={stat.title}>
                    <Card
                      onClick={stat.onClick}
                      sx={{
                        cursor: stat.onClick ? 'pointer' : 'default',
                        borderRadius: 3,
                        p: 2.5,
                        backgroundColor: 'white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 25px ${stat.color}25`,
                          borderColor: `${stat.color}50`,
                          '& .stat-icon': {
                            transform: 'scale(1.1)',
                            backgroundColor: stat.color,
                            color: 'white'
                          }
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          className="stat-icon"
                          sx={{
                            bgcolor: `${stat.color}15`,
                            color: stat.color,
                            width: 52,
                            height: 52,
                            transition: 'all 0.3s ease',
                            boxShadow: `0 4px 12px ${stat.color}30`
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                        {stat.change && (
                          <Chip
                            icon={<ArrowUpIcon sx={{ fontSize: '1rem' }} />}
                            label={stat.change}
                            size="small"
                            sx={{
                              ml: 'auto',
                              height: 26,
                              backgroundColor: `${stat.color}08`,
                              color: stat.color,
                              border: `1px solid ${stat.color}30`,
                              '& .MuiChip-icon': { 
                                color: stat.color,
                                marginLeft: '4px'
                              },
                              '& .MuiChip-label': {
                                px: 1,
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }
                            }}
                          />
                        )}
                      </Box>
                      
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '2.5rem',
                          color: stat.color,
                          lineHeight: 1,
                          mb: 1
                        }}
                      >
                        {stat.value}
                      </Typography>

                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500,
                          mb: 2
                        }}
                      >
                        {stat.title}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={stat.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: `${stat.color}15`,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundColor: stat.color,
                          }
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={6}>
          {/* Create Post Card */}
          <Paper sx={{ borderRadius: 2, p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Avatar src={user?.avatar} sx={{ width: 48, height: 48 }} />
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCreatePost}
                sx={{
                  borderRadius: 5,
                  justifyContent: 'flex-start',
                  px: 3,
                  color: 'text.secondary',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'divider'
                  }
                }}
              >
                Start a post
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button startIcon={<PhotoIcon color="primary" />} sx={{ flex: 1 }}>Photo</Button>
              <Button startIcon={<VideoIcon color="success" />} sx={{ flex: 1 }}>Video</Button>
              <Button startIcon={<ArticleIcon color="warning" />} sx={{ flex: 1 }}>Article</Button>
            </Box>
          </Paper>

          {/* Posts Feed */}
          <Box sx={{ mb: 3 }}>
            {posts.map((post) => (
              <Paper key={post._id} sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={post.author?.avatar}
                      sx={{ width: 48, height: 48, mr: 2 }}
                    >
                      {post.author?.name?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {post.author?.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        {new Date(post.createdAt).toLocaleDateString()} • <Box component="span" sx={{ mx: 0.5 }}>•</Box> <TimelineIcon sx={{ fontSize: 14, mr: 0.5 }} /> Public
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <BookmarkIcon />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {post.content}
                  </Typography>

                  {post.image && (
                    <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                      <img 
                        src={`http://localhost:5002${post.image}`}
                        alt="Post"
                        style={{ width: '100%', maxHeight: 500, objectFit: 'cover' }}
                      />
                    </Box>
                  )}

                  {post.skills?.length > 0 && (
                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {post.skills.map((skill: string) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{ 
                            borderRadius: 1,
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                    <Button
                      startIcon={<ThumbUpIcon />}
                      sx={{ flex: 1, color: 'text.secondary' }}
                    >
                      Like • {post.likes?.length || 0}
                    </Button>
                    <Button
                      startIcon={<CommentIcon />}
                      sx={{ flex: 1, color: 'text.secondary' }}
                    >
                      Comment • {post.comments?.length || 0}
                    </Button>
                    <Button
                      startIcon={<ShareIcon />}
                      sx={{ flex: 1, color: 'text.secondary' }}
                    >
                      Share
                    </Button>
                  </Box>
                </CardContent>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Network
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: activity.color }}>
                        {activity.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.time}
                      primaryTypographyProps={{
                        fontWeight: 500
                      }}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          <Paper sx={{ borderRadius: 2, p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Learning Progress
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 3
              }}
            >
              <Box position="relative" display="inline-flex" mb={2}>
                <CircularProgress
                  variant="determinate"
                  value={75}
                  size={120}
                  thickness={4}
                  sx={{ color: '#4CAF50' }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" color="textPrimary">
                    75%
                  </Typography>
                </Box>
              </Box>
              <Typography color="textSecondary">
                Great progress this week!
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Add AI Chat Dialog */}
      <Dialog 
        open={openAiChat} 
        onClose={() => setOpenAiChat(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>AI Assistant</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            height: '400px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2
          }}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? '#1976d2' : '#f5f5f5',
                  color: msg.role === 'user' ? 'white' : 'black',
                  p: 2,
                  borderRadius: 2,
                  maxWidth: '80%'
                }}
              >
                <Typography>{msg.content}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <TextField
            fullWidth
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isAiLoading}
          />
          <Button 
            onClick={handleSendMessage}
            variant="contained"
            disabled={!currentMessage.trim() || isAiLoading}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
      
    </Box>
  );
};

export default Dashboard;