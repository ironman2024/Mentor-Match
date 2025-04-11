import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'internship',
    deadline: '',
    requirements: '',
    contactInfo: ''
  });

  const canPost = user?.role === 'faculty' || user?.role === 'alumni';

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/opportunities');
      setOpportunities(response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5002/api/opportunities', formData);
      setOpenDialog(false);
      fetchOpportunities();
    } catch (error) {
      console.error('Error posting opportunity:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Opportunities</Typography>
        {canPost && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Post Opportunity
          </Button>
        )}
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        {opportunities.map((opp) => (
          <Card key={opp._id}>
            <CardContent>
              <Typography variant="h6">{opp.title}</Typography>
              <Typography color="textSecondary" gutterBottom>
                Posted by {opp.author.name} • {opp.type}
              </Typography>
              <Typography paragraph>{opp.description}</Typography>
              <Typography variant="body2">
                Deadline: {new Date(opp.deadline).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Post New Opportunity</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <MenuItem value="internship">Internship</MenuItem>
                <MenuItem value="project">Project</MenuItem>
                <MenuItem value="hackathon">Hackathon</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Deadline"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Post</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Opportunities;
