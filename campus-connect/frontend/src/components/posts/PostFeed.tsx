import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  TextField,
  Collapse
} from '@mui/material';
import {
  ThumbUp as LikeIcon,
  ThumbUpOutlined as LikeOutlinedIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserAvatar from '../common/UserAvatar';
import axios from '../../config/axios';

interface Post {
  id: string;
  _id?: string;
  author: {
    _id?: string;
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  likes: any[];
  comments: any[];
  createdAt: string;
  image?: string;
  isLiked?: boolean;
}

interface PostFeedProps {
  posts: Post[];
}

const PostFeed: React.FC<PostFeedProps> = ({ posts }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({});
  const [localPosts, setLocalPosts] = useState(posts);

  React.useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, post: Post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleViewProfile = () => {
    if (selectedPost?.author._id) {
      navigate(`/profile/${selectedPost.author._id}`);
    }
    handleMenuClose();
  };

  const handleAvatarClick = (authorId?: string) => {
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const handleLike = async (postId: string) => {
    const post = localPosts.find(p => p._id === postId || p.id === postId);
    if (!post) return;

    const isCurrentlyLiked = post.likes?.some(like => like.user === user?._id);
    
    // Client-side like simulation until backend endpoints are implemented
    setLocalPosts(prevPosts => 
      prevPosts.map(p => {
        if (p._id === postId || p.id === postId) {
          const updatedLikes = isCurrentlyLiked 
            ? p.likes.filter(like => like.user !== user?._id)
            : [...(p.likes || []), { user: user?._id, _id: Date.now().toString() }];
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );
  };

  const handleComment = async (postId: string) => {
    const commentText = commentTexts[postId];
    if (!commentText?.trim()) return;

    // Client-side comment simulation until backend endpoints are implemented
    const newComment = {
      _id: Date.now().toString(),
      content: commentText,
      author: {
        _id: user?._id,
        name: user?.name,
        avatar: user?.avatar
      },
      createdAt: new Date().toISOString()
    };

    // Update local state
    setLocalPosts(prevPosts => 
      prevPosts.map(p => {
        if (p._id === postId || p.id === postId) {
          return { 
            ...p, 
            comments: [...(p.comments || []), newComment] 
          };
        }
        return p;
      })
    );

    // Clear comment text
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentTexts(prev => ({ ...prev, [postId]: value }));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {localPosts.map((post) => (
        <Card key={post._id || post.id}>
          <CardHeader
            avatar={
              <UserAvatar 
                user={post.author}
                onClick={() => handleAvatarClick(post.author._id)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s ease'
                  }
                }}
              />
            }
            action={
              <IconButton 
                onClick={(e) => handleMenuOpen(e, post)}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
            }
            title={
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' }
                }}
                onClick={() => handleAvatarClick(post.author._id)}
              >
                {post.author.name}
              </Typography>
            }
            subheader={post.author.role}
          />
          <CardContent>
            <Typography variant="body1" paragraph>
              {post.content}
            </Typography>
            {post.image && (
              <Box mb={2}>
                <img 
                  src={`http://localhost:5002${post.image}`}
                  alt="Post content"
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                />
              </Box>
            )}
            {/* Engagement Stats */}
            {(post.likes?.length > 0 || post.comments?.length > 0) && (
              <Box sx={{ py: 1, px: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  {post.likes?.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                    </Typography>
                  )}
                  {post.comments?.length > 0 && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => toggleComments(post._id || post.id)}
                    >
                      {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 1 }}>
              <Button
                startIcon={
                  post.likes?.some(like => like.user === user?._id) ? 
                    <LikeIcon sx={{ color: '#0a66c2' }} /> : 
                    <LikeOutlinedIcon />
                }
                onClick={() => handleLike(post._id || post.id)}
                sx={{ 
                  flex: 1,
                  color: post.likes?.some(like => like.user === user?._id) ? '#0a66c2' : 'text.secondary',
                  fontWeight: post.likes?.some(like => like.user === user?._id) ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'rgba(10, 102, 194, 0.08)'
                  }
                }}
              >
                Like
              </Button>
              <Button
                startIcon={<CommentIcon />}
                onClick={() => toggleComments(post._id || post.id)}
                sx={{ 
                  flex: 1,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Comment
              </Button>
              <Button
                startIcon={<ShareIcon />}
                sx={{ 
                  flex: 1,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Share
              </Button>
            </Box>

            {/* Comments Section */}
            <Collapse in={expandedComments.has(post._id || post.id)}>
              <Divider />
              <Box sx={{ p: 2 }}>
                {/* Add Comment Input */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <UserAvatar user={user} size={32} />
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add a comment..."
                      value={commentTexts[post._id || post.id] || ''}
                      onChange={(e) => handleCommentChange(post._id || post.id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment(post._id || post.id);
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: '#f3f2ef'
                        }
                      }}
                      InputProps={{
                        endAdornment: commentTexts[post._id || post.id]?.trim() && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleComment(post._id || post.id)}
                            sx={{ color: '#0a66c2' }}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        )
                      }}
                    />
                  </Box>
                </Box>

                {/* Comments List */}
                {post.comments?.map((comment: any) => (
                  <Box key={comment._id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <UserAvatar 
                      user={comment.author} 
                      size={32}
                      onClick={() => handleAvatarClick(comment.author?._id)}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ 
                        backgroundColor: '#f3f2ef',
                        borderRadius: 2,
                        p: 1.5
                      }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => handleAvatarClick(comment.author?._id)}
                        >
                          {comment.author?.name}
                        </Typography>
                        <Typography variant="body2">
                          {comment.content}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5, mt: 0.5 }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PostFeed;
