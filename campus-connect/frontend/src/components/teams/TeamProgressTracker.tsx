import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip
} from '@mui/material';
import { Add as AddIcon, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import TeamFormationService from '../../services/TeamFormationService';

interface Milestone {
  _id?: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}

interface TeamProgressTrackerProps {
  teamId: string;
  isLeader: boolean;
}

const TeamProgressTracker: React.FC<TeamProgressTrackerProps> = ({ teamId, isLeader }) => {
  const [progress, setProgress] = useState<{
    milestones: Milestone[];
    completionPercentage: number;
  }>({ milestones: [], completionPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    loadProgress();
  }, [teamId]);

  const loadProgress = async () => {
    try {
      const data = await TeamFormationService.getTeamProgress(teamId);
      setProgress(data);
    } catch (error) {
      console.error('Error loading team progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneToggle = async (milestoneIndex: number) => {
    if (!isLeader) return;

    const updatedMilestones = [...progress.milestones];
    updatedMilestones[milestoneIndex].completed = !updatedMilestones[milestoneIndex].completed;

    const completionPercentage = Math.round(
      (updatedMilestones.filter(m => m.completed).length / updatedMilestones.length) * 100
    );

    try {
      await TeamFormationService.updateTeamProgress(teamId, {
        milestones: updatedMilestones,
        completionPercentage
      });
      setProgress({ milestones: updatedMilestones, completionPercentage });
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) return;

    const milestone: Milestone = {
      title: newMilestone.title,
      description: newMilestone.description,
      completed: false,
      dueDate: newMilestone.dueDate || undefined
    };

    const updatedMilestones = [...progress.milestones, milestone];

    try {
      await TeamFormationService.updateTeamProgress(teamId, {
        milestones: updatedMilestones
      });
      setProgress(prev => ({ ...prev, milestones: updatedMilestones }));
      setNewMilestone({ title: '', description: '', dueDate: '' });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Team Progress</Typography>
        {isLeader && (
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setDialogOpen(true)}
          >
            Add Milestone
          </Button>
        )}
      </Box>

      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2">Overall Progress</Typography>
          <Typography variant="body2">{progress.completionPercentage}%</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress.completionPercentage} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Milestones ({progress.milestones.filter(m => m.completed).length}/{progress.milestones.length})
      </Typography>

      <List>
        {progress.milestones.map((milestone, index) => (
          <ListItem key={index} divider>
            <ListItemIcon>
              <Checkbox
                checked={milestone.completed}
                onChange={() => handleMilestoneToggle(index)}
                disabled={!isLeader}
                icon={<RadioButtonUnchecked />}
                checkedIcon={<CheckCircle color="success" />}
              />
            </ListItemIcon>
            <ListItemText
              primary={milestone.title}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {milestone.description}
                  </Typography>
                  {milestone.dueDate && (
                    <Chip
                      label={`Due: ${new Date(milestone.dueDate).toLocaleDateString()}`}
                      size="small"
                      color={new Date(milestone.dueDate) < new Date() && !milestone.completed ? 'error' : 'default'}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {progress.milestones.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          No milestones added yet. {isLeader ? 'Add your first milestone to track progress!' : 'Team leader will add milestones soon.'}
        </Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Milestone</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Milestone Title"
            fullWidth
            variant="outlined"
            value={newMilestone.title}
            onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newMilestone.description}
            onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newMilestone.dueDate}
            onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMilestone} variant="contained">Add Milestone</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TeamProgressTracker;