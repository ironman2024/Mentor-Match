import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import {
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon
} from '@mui/icons-material';

interface Post {
  id: string;
  author: {
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
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {posts.map((post) => (
        <Card key={post._id}>
          <CardHeader
            avatar={
              <Avatar src={post.author.avatar}>
                {post.author.name[0]}
              </Avatar>
            }
            title={post.author.name}
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
    </Box>
  );
};

export default PostFeed;
