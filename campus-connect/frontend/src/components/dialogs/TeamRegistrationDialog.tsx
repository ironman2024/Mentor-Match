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
    leader: {
      name: '',
      email: '',
      rollNumber: ''
    },
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
    const leaderValid = registrationData.leader.name && 
                       registrationData.leader.email && 
                       registrationData.leader.rollNumber;
    const teamNameValid = !isTeamEvent || registrationData.teamName;
    return leaderValid && teamNameValid;
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(registrationData);
      showNotification('Team registered successfully!', 'success');
      onClose();
    } catch (error) {
      showNotification('Failed to register team. Please try again.', 'error');
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

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Team Leader Details
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Leader Name"
              value={registrationData.leader.name}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                leader: { ...prev.leader, name: e.target.value }
              }))}
              required
            />
            <TextField
              fullWidth
              label="Leader Email"
              type="email"
              value={registrationData.leader.email}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                leader: { ...prev.leader, email: e.target.value }
              }))}
              required
            />
            <TextField
              fullWidth
              label="Roll Number"
              value={registrationData.leader.rollNumber}
              onChange={(e) => setRegistrationData(prev => ({
                ...prev,
                leader: { ...prev.leader, rollNumber: e.target.value }
              }))}
              required
            />
          </Box>
        </Box>

        {isTeamEvent && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Team Members ({registrationData.members.length}/{maxTeamSize - 1})
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
