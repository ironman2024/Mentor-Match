import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, IconButton,
  Alert, Chip
} from '@mui/material';
import { Close, VideoCall, ContentCopy, Launch } from '@mui/icons-material';

interface MeetingDialogProps {
  open: boolean;
  onClose: () => void;
  recipientName: string;
  onSendMeetingLink: (meetingLink: string, message: string) => void;
}

const MeetingDialog: React.FC<MeetingDialogProps> = ({
  open,
  onClose,
  recipientName,
  onSendMeetingLink
}) => {
  const [meetingLink, setMeetingLink] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const generateMeetLink = () => {
    // Open Google Meet to create a new meeting
    window.open('https://meet.google.com/new', '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openMeetingLink = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  const handleSendLink = () => {
    if (meetingLink && customMessage) {
      onSendMeetingLink(meetingLink, customMessage);
      onClose();
      setMeetingLink('');
      setCustomMessage('');
    }
  };

  const handleClose = () => {
    onClose();
    setMeetingLink('');
    setCustomMessage('');
    setCopied(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VideoCall sx={{ mr: 1, color: '#4285f4' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Start Video Meeting
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Create a Google Meet link or paste an existing one to start a video call with {recipientName}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<VideoCall />}
              onClick={generateMeetLink}
              sx={{
                borderColor: '#4285f4',
                color: '#4285f4',
                '&:hover': {
                  borderColor: '#3367d6',
                  bgcolor: 'rgba(66, 133, 244, 0.04)'
                },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px'
              }}
            >
              Create New Meeting
            </Button>
          </Box>
          
          <TextField
            fullWidth
            placeholder="Paste Google Meet link here (e.g., https://meet.google.com/abc-defg-hij)"
            value={meetingLink}
            onChange={(e) => {
              setMeetingLink(e.target.value);
              if (e.target.value) {
                setCustomMessage(`Hi ${recipientName}! Let's have a video call. Join me here: ${e.target.value}`);
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        </Box>

        {meetingLink && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Meeting Link:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  flex: 1, 
                  wordBreak: 'break-all',
                  color: '#4285f4',
                  fontFamily: 'monospace'
                }}
              >
                {meetingLink}
              </Typography>
              <IconButton 
                size="small" 
                onClick={copyToClipboard}
                sx={{ color: copied ? '#4caf50' : '#666' }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={openMeetingLink}
                sx={{ color: '#4285f4' }}
              >
                <Launch fontSize="small" />
              </IconButton>
            </Box>
            {copied && (
              <Chip 
                label="Copied!" 
                size="small" 
                sx={{ 
                  mt: 1, 
                  bgcolor: '#4caf50', 
                  color: 'white',
                  fontSize: '0.75rem'
                }} 
              />
            )}
          </Box>
        )}

        {meetingLink && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Message to send:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a custom message..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Box>
        )}

        <Alert 
          severity="info" 
          sx={{ 
            mt: 2,
            borderRadius: '8px',
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          The meeting link will be sent as a message. Both participants can join using this link.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            textTransform: 'none',
            color: '#666'
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSendLink}
          disabled={!meetingLink || !customMessage.trim()}
          sx={{
            background: '#4285f4',
            '&:hover': {
              background: '#3367d6'
            },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px'
          }}
        >
          Send Meeting Link
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeetingDialog;