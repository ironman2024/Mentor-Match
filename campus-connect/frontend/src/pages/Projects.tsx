import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
  team: string[];
  status: 'open' | 'in-progress' | 'completed';
}

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    skills: [] as string[],
  });

  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'AI Study Group Project',
      description: 'Building a machine learning model for student performance prediction',
      skills: ['Python', 'TensorFlow', 'Data Science'],
      team: ['John Doe', 'Jane Smith'],
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'Campus Connect Mobile App',
      description: 'Developing a mobile version of the Campus Connect platform',
      skills: ['React Native', 'TypeScript', 'Node.js'],
      team: ['Alice Johnson'],
      status: 'open'
    }
  ];

  const handleCreateProject = () => {
    // TODO: Implement project creation API call
    setOpenCreate(false);
    setNewProject({ title: '', description: '', skills: [] });
  };

  const filteredProjects = mockProjects.filter(project =>
    project.title.toLowerCase().includes(search.toLowerCase()) ||
    project.description.toLowerCase().includes(search.toLowerCase()) ||
    project.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          Create Project
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.title}
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {project.description}
                </Typography>
                <Box mb={2}>
                  {project.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {project.team.length} member{project.team.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Chip
                    label={project.status}
                    color={
                      project.status === 'completed' ? 'success' :
                      project.status === 'in-progress' ? 'primary' : 'default'
                    }
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Project Title"
            value={newProject.title}
            onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newProject.description}
            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Required Skills (comma-separated)"
            value={newProject.skills.join(', ')}
            onChange={(e) => setNewProject(prev => ({ 
              ...prev, 
              skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
