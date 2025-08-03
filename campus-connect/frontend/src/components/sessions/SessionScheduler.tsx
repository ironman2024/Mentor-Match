import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, Typography, Paper } from '@mui/material';

interface SessionSchedulerProps {
  onSchedule: (sessionData: any) => void;
}

const SessionScheduler: React.FC<SessionSchedulerProps> = ({ onSchedule }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    type: 'workshop' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule(formData);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>Schedule Session</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Title"
          value={formData.title}
          onChange={handleChange('title')}
          required
        />
        <TextField
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          multiline
          rows={3}
          required
        />
        <TextField
          label="Date & Time"
          type="datetime-local"
          value={formData.date}
          onChange={handleChange('date')}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Location"
          value={formData.location}
          onChange={handleChange('location')}
          required
        />
        <TextField
          select
          label="Type"
          value={formData.type}
          onChange={handleChange('type')}
        >
          <MenuItem value="workshop">Workshop</MenuItem>
          <MenuItem value="seminar">Seminar</MenuItem>
          <MenuItem value="hackathon">Hackathon</MenuItem>
          <MenuItem value="competition">Competition</MenuItem>
        </TextField>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Schedule Session
        </Button>
      </Box>
    </Paper>
  );
};

export default SessionScheduler;