import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';

import { MentorshipService } from '../../services/MentorshipService';

interface ScheduleSessionProps {
  mentorId: string;
  availability: any;
  onClose: () => void;
  onScheduled: () => void;
}

const ScheduleSession: React.FC<ScheduleSessionProps> = ({
  mentorId,
  availability,
  onClose,
  onScheduled
}) => {
  const [sessionData, setSessionData] = useState({
    scheduledDate: '',
    duration: 30,
    meetingType: 'online',
    agenda: '',
    meetingLink: '',
  });

  const handleSchedule = async () => {
    try {
      await MentorshipService.scheduleSession({
        mentorId,
        ...sessionData
      });
      onScheduled();
      onClose();
    } catch (error) {
      console.error('Error scheduling session:', error);
    }
  };

  return (
    <>
      <DialogTitle>Schedule Mentorship Session</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            type="datetime-local"
            label="Session Date & Time"
            value={sessionData.scheduledDate}
            onChange={(e) => setSessionData(prev => ({
              ...prev,
              scheduledDate: e.target.value
            }))}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth>
            <InputLabel>Duration</InputLabel>
            <Select
              value={sessionData.duration}
              label="Duration"
              onChange={(e) => setSessionData(prev => ({
                ...prev,
                duration: Number(e.target.value)
              }))}
            >
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={60}>1 hour</MenuItem>
              <MenuItem value={90}>1.5 hours</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Session Agenda"
            value={sessionData.agenda}
            onChange={(e) => setSessionData(prev => ({
              ...prev,
              agenda: e.target.value
            }))}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSchedule} variant="contained">
          Schedule Session
        </Button>
      </DialogActions>
    </>
  );
};

export default ScheduleSession;
