import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { VideoCall, Launch } from '@mui/icons-material';

interface MeetingMessageProps {
  content: string;
  isOwn: boolean;
  timestamp: string;
}

const MeetingMessage: React.FC<MeetingMessageProps> = ({ content, isOwn, timestamp }) => {
  // Extract Google Meet link from message
  const meetLinkRegex = /https:\/\/meet\.google\.com\/[a-zA-Z0-9-]+/g;
  const meetLink = content.match(meetLinkRegex)?.[0];
  
  if (!meetLink) {
    return null;
  }

  const handleJoinMeeting = () => {
    window.open(meetLink, '_blank');
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        bgcolor: isOwn ? '#4285f4' : 'white',
        color: isOwn ? 'white' : '#262626',
        border: isOwn ? 'none' : '1px solid #e0e0e0',
        maxWidth: '280px',
        position: 'relative'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <VideoCall sx={{ mr: 1, fontSize: 20, color: isOwn ? 'white' : '#4285f4' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '14px' }}>
          Video Meeting
        </Typography>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 2, fontSize: '13px', lineHeight: 1.4 }}>
        {content.replace(meetLink, '').trim()}
      </Typography>
      
      <Button
        variant={isOwn ? 'outlined' : 'contained'}
        size="small"
        startIcon={<Launch />}
        onClick={handleJoinMeeting}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '20px',
          fontSize: '12px',
          ...(isOwn ? {
            borderColor: 'white',
            color: 'white',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.8)',
              bgcolor: 'rgba(255,255,255,0.1)'
            }
          } : {
            bgcolor: '#4285f4',
            '&:hover': {
              bgcolor: '#3367d6'
            }
          })
        }}
      >
        Join Meeting
      </Button>
      
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block',
          textAlign: isOwn ? 'right' : 'left',
          color: isOwn ? 'rgba(255,255,255,0.8)' : '#8e8e8e',
          fontSize: '11px',
          mt: 1
        }}
      >
        {timestamp}
      </Typography>
    </Box>
  );
};

export default MeetingMessage;