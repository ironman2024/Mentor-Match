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
  CircularProgress,
  ThemeProvider,
  createTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import socket from '../config/socket';

// Custom theme based on the color guidelines
const theme = createTheme({
  palette: {
    primary: {
      main: '#2D3E50', // Navy Blue - trust, knowledge
      light: '#3E5771',
      dark: '#1A2530',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E74C3C', // Coral Red - accent color
      light: '#F5675A',
      dark: '#C0392B',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA', // Light Gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3E50', // Navy Blue
      secondary: '#596273', // Slate Gray
    },
    success: {
      main: '#1ABC9C', // Teal - growth and learning
    },
    info: {
      main: '#3498DB',
    },
    warning: {
      main: '#F39C12',
    },
    error: {
      main: '#E74C3C',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2D3E50',
    },
    h6: {
      fontWeight: 600,
      color: '#2D3E50',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 8,
          boxShadow: '0 4px 10px rgba(231, 76, 60, 0.25)',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

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
      requiredSkills: [] as string[],
      prerequisites: [] as string[],
      complexity: 'beginner',
      domain: [] as string[],
      estimatedDuration: 0,
      techStack: [] as string[]
    },
    projectType: 'software'
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillInput, setSkillInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [prerequisiteInput, setPrerequisiteInput] = useState('');

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
      setNewProject({ 
        title: '', 
        description: '', 
        skills: [], 
        projectType: 'software',
        technicalDetails: {
          requiredSkills: [],
          prerequisites: [],
          complexity: 'beginner',
          domain: [],
          estimatedDuration: 0,
          techStack: []
        }
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner':
        return '#1ABC9C'; // Teal
      case 'intermediate':
        return '#3498DB'; // Blue
      case 'advanced':
        return '#E74C3C'; // Coral
      default:
        return '#596273'; // Slate Gray
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setNewProject(prev => ({
        ...prev,
        technicalDetails: {
          ...prev.technicalDetails,
          requiredSkills: [...prev.technicalDetails.requiredSkills, skillInput.trim()]
        }
      }));
      setSkillInput('');
    }
  };

  const handleAddTechStack = () => {
    if (techStackInput.trim()) {
      setNewProject(prev => ({
        ...prev,
        technicalDetails: {
          ...prev.technicalDetails,
          techStack: [...prev.technicalDetails.techStack, techStackInput.trim()]
        }
      }));
      setTechStackInput('');
    }
  };

  const handleAddPrerequisite = () => {
    if (prerequisiteInput.trim()) {
      setNewProject(prev => ({
        ...prev,
        technicalDetails: {
          ...prev.technicalDetails,
          prerequisites: [...prev.technicalDetails.prerequisites, prerequisiteInput.trim()]
        }
      }));
      setPrerequisiteInput('');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: '#F5F7FA', p: 3, minHeight: '100vh' }}>
        <Box sx={{ 
          backgroundColor: '#FCF3E7', 
          borderRadius: 3, 
          p: 3, 
          mb: 4,
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center"
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse available projects or create your own
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
            sx={{ 
              py: 1.2, 
              px: 3, 
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            Create Project
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects by title, description or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ 
            mb: 4,
            backgroundColor: 'white',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: alpha('#596273', 0.2),
              },
              '&:hover fieldset': {
                borderColor: alpha('#2D3E50', 0.5),
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2D3E50',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <>
            {filteredProjects.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6, 
                backgroundColor: 'white', 
                borderRadius: 3,
                border: '1px dashed #CCCCCC'
              }}>
                <FolderIcon sx={{ fontSize: 60, color: alpha('#596273', 0.3), mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No projects found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {search ? 'Try adjusting your search terms' : 'Create your first project to get started'}
                </Typography>
                {!search && (
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreate(true)}
                    sx={{ mt: 3 }}
                  >
                    Create Project
                  </Button>
                )}
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredProjects.map((project) => (
                  <Grid item xs={12} md={6} lg={4} key={project.id || project._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          mb: 1 
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {project.title}
                          </Typography>
                          <Chip
                            label={project.status}
                            color={getStatusColor(project.status) as any}
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          color: 'text.secondary'
                        }}>
                          <Chip 
                            label={project.projectType} 
                            variant="outlined"
                            size="small"
                            sx={{ mr: 1, textTransform: 'capitalize' }}
                          />
                          {project.technicalDetails?.complexity && (
                            <Chip 
                              label={project.technicalDetails.complexity} 
                              size="small"
                              sx={{ 
                                backgroundColor: alpha(getComplexityColor(project.technicalDetails.complexity), 0.1),
                                color: getComplexityColor(project.technicalDetails.complexity),
                                fontWeight: 500,
                                textTransform: 'capitalize'
                              }}
                            />
                          )}
                        </Box>
                        
                        <Typography color="text.secondary" sx={{ mb: 2, fontSize: '0.95rem', height: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {project.description}
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}>
                          Skills
                        </Typography>
                        <Box mb={2} sx={{ minHeight: '60px' }}>
                          {project.skills?.map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              sx={{ 
                                mr: 0.5, 
                                mb: 0.5,
                                backgroundColor: alpha('#2D3E50', 0.08),
                                color: 'text.primary'
                              }}
                            />
                          ))}
                          {(!project.skills || project.skills.length === 0) && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              No skills specified
                            </Typography>
                          )}
                        </Box>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mt: 2,
                            pt: 2,
                            borderTop: '1px solid',
                            borderColor: alpha('#000', 0.08)
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2">
                              {project.team?.length || 0} member{project.team?.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                          {project.technicalDetails?.estimatedDuration && (
                            <Typography variant="body2" color="text.secondary">
                              {project.technicalDetails.estimatedDuration} week{project.technicalDetails.estimatedDuration !== 1 ? 's' : ''}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        <Dialog 
          open={openCreate} 
          onClose={() => setOpenCreate(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#FCF3E7',
            borderRadius: '12px 12px 0 0',
            py: 2.5,
            px: 3
          }}>
            <Typography variant="h5" fontWeight={600}>Create New Project</Typography>
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 3 }}>
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={4}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Technical Details */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                  Technical Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Project Type</InputLabel>
                  <Select
                    value={newProject.projectType}
                    onChange={(e) => setNewProject(prev => ({ ...prev, projectType: e.target.value }))}
                    label="Project Type"
                    required
                  >
                    <MenuItem value="software">Software</MenuItem>
                    <MenuItem value="hardware">Hardware</MenuItem>
                    <MenuItem value="hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Complexity Level</InputLabel>
                  <Select
                    value={newProject.technicalDetails.complexity}
                    onChange={(e) => setNewProject(prev => ({ 
                      ...prev, 
                      technicalDetails: { 
                        ...prev.technicalDetails, 
                        complexity: e.target.value 
                      } 
                    }))}
                    label="Complexity Level"
                    required
                  >
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Skills */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button 
                    onClick={handleAddSkill} 
                    variant="contained" 
                    color="primary"
                    sx={{ minWidth: '100px' }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                  {newProject.technicalDetails.requiredSkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => {
                        const updatedSkills = [...newProject.technicalDetails.requiredSkills];
                        updatedSkills.splice(index, 1);
                        setNewProject(prev => ({
                          ...prev,
                          technicalDetails: {
                            ...prev.technicalDetails,
                            requiredSkills: updatedSkills
                          }
                        }));
                      }}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Prerequisites */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
                  Prerequisites
                </Typography>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    value={prerequisiteInput}
                    onChange={(e) => setPrerequisiteInput(e.target.value)}
                    placeholder="Add a prerequisite"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button 
                    onClick={handleAddPrerequisite} 
                    variant="contained" 
                    color="primary"
                    sx={{ minWidth: '100px' }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                  {newProject.technicalDetails.prerequisites.map((prerequisite, index) => (
                    <Chip
                      key={index}
                      label={prerequisite}
                      onDelete={() => {
                        const updatedPrerequisites = [...newProject.technicalDetails.prerequisites];
                        updatedPrerequisites.splice(index, 1);
                        setNewProject(prev => ({
                          ...prev,
                          technicalDetails: {
                            ...prev.technicalDetails,
                            prerequisites: updatedPrerequisites
                          }
                        }));
                      }}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Tech Stack */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
                  Tech Stack
                </Typography>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    placeholder="Add a technology"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button 
                    onClick={handleAddTechStack} 
                    variant="contained" 
                    color="primary"
                    sx={{ minWidth: '100px' }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                  {newProject.technicalDetails.techStack.map((tech, index) => (
                    <Chip
                      key={index}
                      label={tech}
                      onDelete={() => {
                        const updatedTechStack = [...newProject.technicalDetails.techStack];
                        updatedTechStack.splice(index, 1);
                        setNewProject(prev => ({
                          ...prev,
                          technicalDetails: {
                            ...prev.technicalDetails,
                            techStack: updatedTechStack
                          }
                        }));
                      }}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Duration */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Estimated Duration (weeks)"
                  value={newProject.technicalDetails.estimatedDuration}
                  onChange={(e) => setNewProject(prev => ({ 
                    ...prev, 
                    technicalDetails: { 
                      ...prev.technicalDetails, 
                      estimatedDuration: parseInt(e.target.value) || 0 
                    } 
                  }))}
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, backgroundColor: alpha('#F5F7FA', 0.5) }}>
            <Button 
              onClick={() => setOpenCreate(false)} 
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject} 
              variant="contained" 
              color="secondary" 
              sx={{ px: 4 }}
            >
              Create Project
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Projects;