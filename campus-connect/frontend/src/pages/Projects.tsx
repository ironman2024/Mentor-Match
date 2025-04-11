import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import socket from '../config/socket';

interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
  team: string[];
  status: 'open' | 'in-progress' | 'completed';
  technicalDetails: {
    requiredSkills: string[];
    prerequisites: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced';
    domain: string[];
    estimatedDuration: number;
    techStack: string[];
  };
  projectType: 'software' | 'hardware' | 'hybrid';
  resourceLinks: {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'github' | 'other';
  }[];
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
      status: 'in-progress',
      technicalDetails: {
        requiredSkills: ['Python', 'TensorFlow'],
        prerequisites: ['Basic Python', 'Statistics'],
        complexity: 'intermediate',
        domain: ['Data Science'],
        estimatedDuration: 12,
        techStack: ['Python', 'TensorFlow']
      },
      projectType: 'software',
      resourceLinks: [
        { title: 'TensorFlow Documentation', url: 'https://www.tensorflow.org/', type: 'documentation' }
      ]
    },
    {
      id: '2',
      title: 'Campus Connect Mobile App',
      description: 'Developing a mobile version of the Campus Connect platform',
      skills: ['React Native', 'TypeScript', 'Node.js'],
      team: ['Alice Johnson'],
      status: 'open',
      technicalDetails: {
        requiredSkills: ['React Native', 'TypeScript'],
        prerequisites: ['JavaScript', 'React'],
        complexity: 'beginner',
        domain: ['Mobile Development'],
        estimatedDuration: 8,
        techStack: ['React Native', 'TypeScript', 'Node.js']
      },
      projectType: 'software',
      resourceLinks: [
        { title: 'React Native Documentation', url: 'https://reactnative.dev/', type: 'documentation' }
      ]
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

  useEffect(() => {
    socket.on('new_project', (project: Project) => {
      setProjects(prev => [project, ...prev]);
    });

    return () => {
      socket.off('new_project');
    };
  }, []);

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

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                margin="normal"
                multiline
                rows={4}
                required
              />
            </Grid>

            {/* Technical Details */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={newProject.projectType}
                  onChange={(e) => setNewProject(prev => ({ ...prev, projectType: e.target.value }))}
                  required
                >
                  <MenuItem value="software">Software</MenuItem>
                  <MenuItem value="hardware">Hardware</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Complexity Level</InputLabel>
                <Select
                  value={newProject.technicalDetails.complexity}
                  onChange={(e) => setNewProject(prev => ({ ...prev, technicalDetails: { ...prev.technicalDetails, complexity: e.target.value } }))}
                  required
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Skills and Prerequisites */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={[]}
                freeSolo
                renderInput={(params) => (
                  <TextField {...params} label="Required Skills" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={[]}
                freeSolo
                renderInput={(params) => (
                  <TextField {...params} label="Prerequisites" />
                )}
              />
            </Grid>

            {/* Tech Stack */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={[]}
                freeSolo
                renderInput={(params) => (
                  <TextField {...params} label="Tech Stack" />
                )}
              />
            </Grid>

            {/* Duration */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Duration (weeks)"
                value={newProject.technicalDetails.estimatedDuration}
                onChange={(e) => setNewProject(prev => ({ ...prev, technicalDetails: { ...prev.technicalDetails, estimatedDuration: parseInt(e.target.value) } }))}
                required
              />
            </Grid>
          </Grid>
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
