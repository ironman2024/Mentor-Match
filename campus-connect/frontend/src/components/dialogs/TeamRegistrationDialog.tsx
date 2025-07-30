import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Snackbar
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

interface TeamMember {
  name: string;
  email: string;
  rollNumber: string;
}

interface TeamRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (registrationData: {
    teamName: string;
    leader: TeamMember;
    members: TeamMember[];
  }) => void;
  maxTeamSize: number;
  isTeamEvent: boolean;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const TeamRegistrationDialog: React.FC<TeamRegistrationDialogProps> = ({
  open,
  onClose,
  onSubmit,
  maxTeamSize,
  isTeamEvent,
  showNotification
}) => {
  const [registrationData, setRegistrationData] = useState({
    teamName: '',
    members: [] as TeamMember[]
  });

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    rollNumber: ''
  });

  const handleAddMember = () => {
    if (registrationData.members.length < maxTeamSize - 1) {
      setRegistrationData(prev => ({
        ...prev,
        members: [...prev.members, { ...newMember }]
      }));
      setNewMember({ name: '', email: '', rollNumber: '' });
    }
  };

  const handleRemoveMember = (index: number) => {
    setRegistrationData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const isValid = () => {
    const teamNameValid = !isTeamEvent || registrationData.teamName;
    return teamNameValid;
  };

  const handleSubmit = async () => {
    try {
      // Submit team name and members - backend will handle leader automatically
      const submitData = {
        teamName: registrationData.teamName,
        members: registrationData.members // Send member objects with name, email, rollNumber
      };
      await onSubmit(submitData);
      // Reset form after successful submission
      setRegistrationData({ teamName: '', members: [] });
      setNewMember({ name: '', email: '', rollNumber: '' });
    } catch (error) {
      console.error('Registration submission error:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isTeamEvent ? 'Team Registration' : 'Event Registration'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {isTeamEvent && (
            <TextField
              fullWidth
              label="Team Name"
              value={registrationData.teamName}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                teamName: e.target.value
              }))}
              margin="normal"
              required
            />
          )}

          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Team Leader (Auto-filled)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You will be automatically registered as the team leader
            </Typography>
          </Box>
        </Box>

        {isTeamEvent && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Team Members ({registrationData.members.length}/{maxTeamSize - 1})
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Add your team members below. You are automatically the team leader.
            </Typography>
            
            <List>
              {registrationData.members.map((member, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={member.name}
                    secondary={`${member.email} | ${member.rollNumber}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveMember(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {registrationData.members.length < maxTeamSize - 1 && (
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  label="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  size="small"
                />
                <TextField
                  label="Email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  size="small"
                />
                <TextField
                  label="Roll Number"
                  value={newMember.rollNumber}
                  onChange={(e) => setNewMember(prev => ({
                    ...prev,
                    rollNumber: e.target.value
                  }))}
                  size="small"
                />
                <IconButton
                  onClick={handleAddMember}
                  disabled={!newMember.name || !newMember.email || !newMember.rollNumber}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid()}
        >
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamRegistrationDialog;
