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
  request: {
    _id: string;
    mentee: {
      name: string;
      avatar?: string;
      department?: string;
      skills?: string[];
    };
    topic: string;
    message: string;
    createdAt: string;
  } | null;
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          border: '1px solid #B5BBC9',
          boxShadow: '0 4px 20px rgba(88,94,108,0.1)',
          background: 'white',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        color: '#585E6C',
        fontWeight: 600
      }}>
        Mentorship Request Details
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar 
              src={request.mentee?.avatar} 
              sx={{ 
                width: 56, 
                height: 56, 
                mr: 2,
                bgcolor: '#585E6C'
              }}
            >
              {request.mentee?.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600 }}>
                {request.mentee?.name}
              </Typography>
              <Typography sx={{ color: '#B5BBC9' }}>
                {request.mentee?.department || 'Department not specified'}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2, borderColor: '#B5BBC9' }} />

          <Typography variant="subtitle1" gutterBottom sx={{ color: '#585E6C', fontWeight: 600 }}>
            Topic
          </Typography>
          <Typography paragraph sx={{ mb: 2, color: '#585E6C' }}>
            {request.topic}
          </Typography>

          <Typography variant="subtitle1" gutterBottom sx={{ color: '#585E6C', fontWeight: 600 }}>
            Message
          </Typography>
          <Typography 
            paragraph 
            sx={{ 
              mb: 2,
              p: 2,
              bgcolor: '#F8F9FB',
              borderRadius: '12px',
              color: '#585E6C',
              border: '1px solid #B5BBC9',
              whiteSpace: 'pre-wrap'  // Preserve line breaks
            }}
          >
            {request?.details?.studentMessage || request?.message || 'No message provided'}
          </Typography>

          {request.mentee?.skills?.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#585E6C', fontWeight: 600 }}>
                Student Skills
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {request.mentee.skills.map((skill: string, index: number) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    size="small"
                    sx={{
                      bgcolor: '#F8F9FB',
                      color: '#585E6C',
                      border: '1px solid #B5BBC9',
                      '&:hover': {
                        bgcolor: '#585E6C',
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            color: '#B5BBC9',
            '&:hover': { bgcolor: 'rgba(88,94,108,0.05)' }
          }}
        >
          Close
        </Button>
        <Button 
          onClick={() => onReject(request._id)} 
          variant="outlined"
          sx={{
            borderColor: '#E74C3C',
            color: '#E74C3C',
            '&:hover': {
              borderColor: '#d44133',
              bgcolor: 'rgba(231,76,60,0.05)'
            }
          }}
        >
          Decline
        </Button>
        <Button 
          onClick={() => onAccept(request._id)} 
          variant="contained"
          sx={{
            bgcolor: '#585E6C',
            color: 'white',
            '&:hover': {
              bgcolor: '#474D59',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(88,94,108,0.25)',
            }
          }}
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MentorshipRequestPreviewDialog;
