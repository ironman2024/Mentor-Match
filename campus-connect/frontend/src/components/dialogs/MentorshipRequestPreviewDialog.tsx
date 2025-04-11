import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider
} from '@mui/material';

interface RequestPreviewProps {
  open: boolean;
  onClose: () => void;
  request: any;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const MentorshipRequestPreviewDialog: React.FC<RequestPreviewProps> = ({
  open,
  onClose,
  request,
  onAccept,
  onReject
}) => {
  if (!request) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Mentorship Request Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar 
              src={request.mentee?.avatar} 
              sx={{ width: 56, height: 56, mr: 2 }}
            >
              {request.mentee?.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">{request.mentee?.name}</Typography>
              <Typography color="textSecondary">
                {request.mentee?.department || 'Department not specified'}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Topic
          </Typography>
          <Typography paragraph sx={{ mb: 2 }}>
            {request.topic}
          </Typography>

          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Message
          </Typography>
          <Typography 
            paragraph 
            sx={{ 
              mb: 2,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1
            }}
          >
            {request.message || 'No message provided'}
          </Typography>

          {request.mentee?.skills?.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Student Skills
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {request.mentee.skills.map((skill: string, index: number) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button 
          onClick={() => onReject(request._id)} 
          color="error" 
          variant="outlined"
        >
          Decline
        </Button>
        <Button 
          onClick={() => onAccept(request._id)} 
          variant="contained" 
          color="primary"
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MentorshipRequestPreviewDialog;
