import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
  likes: number;
  comments: number;
  createdAt: string;
  image?: string;
}

interface PostFeedProps {
  posts: Post[];
}

const PostFeed: React.FC<PostFeedProps> = ({ posts }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {posts.map((post) => (
        <Card key={post._id || post.id}>
          <CardHeader
            avatar={
              <Avatar 
                src={post.author.avatar}
                onClick={() => handleAvatarClick(post.author._id)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s ease'
                  }
                }}
              >
                {post.author.name[0]}
              </Avatar>
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
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton size="small">
                  <LikeIcon />
                </IconButton>
                <Typography variant="body2">{post.likes}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton size="small">
                  <CommentIcon />
                </IconButton>
                <IconButton size="small">
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>
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
