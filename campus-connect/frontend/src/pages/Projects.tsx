import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
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
  Autocomplete,
  CircularProgress
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
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    skills: [] as string[],
    technicalDetails: {
      requiredSkills: [],
      prerequisites: [],
      complexity: 'beginner',
      domain: [],
      estimatedDuration: 0,
      techStack: []
    }
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      enqueueSnackbar('Failed to load projects. Please try again later.', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5002/api/projects',
        newProject,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setProjects(prev => [response.data, ...prev]);
      setOpenCreate(false);
      setNewProject({ title: '', description: '', skills: [], technicalDetails: {
        requiredSkills: [],
        prerequisites: [],
        complexity: 'beginner',
        domain: [],
        estimatedDuration: 0,
        techStack: []
      }});
      enqueueSnackbar('Project created successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error creating project:', error);
      enqueueSnackbar('Failed to create project', { variant: 'error' });
    }
  };

  const filteredProjects = React.useMemo(() => {
    if (!projects?.length) return [];
    
    return projects.filter(project =>
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase()) ||
      project.skills?.some(skill => 
        skill.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [projects, search]);

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

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Grid item xs={12} md={6} key={project.id || project._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography color="textSecondary" paragraph>
                      {project.description}
                    </Typography>
                    <Box mb={2}>
                      {project.skills?.map((skill) => (
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
                          {project.team?.length || 0} member{project.team?.length !== 1 ? 's' : ''}
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
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center" color="textSecondary">
                {loading ? 'Loading projects...' : 'No projects found'}
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

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
