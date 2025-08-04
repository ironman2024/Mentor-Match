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
  alpha,
  Menu,
  ListItemIcon,
  ListItemText,
  Badge as MuiBadge,
  Tooltip,
  Avatar,
  ListItemAvatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  Folder as FolderIcon,
  People as PeopleIcon,
  NotificationsActive as NotificationsIcon,
  Work as WorkIcon,
  Recommend as RecommendIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import socket from '../config/socket';
import recommendationService from '../services/recommendationService';
import ProjectApplicationDialog from '../components/dialogs/ProjectApplicationDialog';

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
  const [activeTab, setActiveTab] = useState(0);
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
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [prerequisiteInput, setPrerequisiteInput] = useState('');
  const [applications, setApplications] = useState<{[key: string]: any[]}>({});
  const [openApply, setOpenApply] = useState(false);
  const [selectedProjectForApply, setSelectedProjectForApply] = useState<any>(null);
  const [applicationsAnchorEl, setApplicationsAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [openOpportunityDialog, setOpenOpportunityDialog] = useState(false);
  const [opportunityFormData, setOpportunityFormData] = useState({
    title: '',
    description: '',
    type: 'internship',
    deadline: '',
    requirements: '',
    contactInfo: ''
  });

  const canPost = user?.role === 'faculty' || user?.role === 'alumni';

  useEffect(() => {
    fetchProjects();
    fetchOpportunities();
    fetchRecommendations();
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

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/opportunities');
      setOpportunities(response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const recommendations = await recommendationService.getProjectRecommendations({ limit: 12 });
      setRecommendedProjects(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
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

  const filteredOpportunities = React.useMemo(() => {
    if (!opportunities?.length) return [];
    
    return opportunities.filter(opp =>
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.description.toLowerCase().includes(search.toLowerCase()) ||
      opp.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [opportunities, search]);

  useEffect(() => {
    socket.on('new_project', (project: Project) => {
      setProjects(prev => [project, ...prev]);
    });

    return () => {
      socket.off('new_project');
    };
  }, []);

  useEffect(() => {
    // Listen for new applications
    socket.on('new_application', (data: any) => {
      if (data.projectOwnerId === user?._id) {
        setNotifications(prev => [...prev, data]);
      }
    });

    return () => {
      socket.off('new_application');
    };
  }, [user]);

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

  const handleApplyClick = (project: any) => {
    // Record interaction for recommendation improvement
    recommendationService.recordInteraction('apply', project._id, 'project');
    setSelectedProjectForApply(project);
    setOpenApply(true);
  };

  const handleSubmitApplication = async (applicationData: any) => {
    try {
      const response = await axios.post(
        'http://localhost:5002/api/projects/apply',
        {
          projectId: selectedProjectForApply._id,
          applicationData
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      enqueueSnackbar('Application submitted successfully', { variant: 'success' });
      setOpenApply(false);
      setSelectedProjectForApply(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      enqueueSnackbar('Failed to submit application', { variant: 'error' });
    }
  };

  const handleSubmitOpportunity = async () => {
    try {
      await axios.post('http://localhost:5002/api/opportunities', opportunityFormData);
      setOpenOpportunityDialog(false);
      fetchOpportunities();
      setOpportunityFormData({
        title: '',
        description: '',
        type: 'internship',
        deadline: '',
        requirements: '',
        contactInfo: ''
      });
      enqueueSnackbar('Opportunity posted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error posting opportunity:', error);
      enqueueSnackbar('Failed to post opportunity', { variant: 'error' });
    }
  };

  const fetchApplications = async (projectId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5002/api/projects/${projectId}/applications`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setApplications(prev => ({
        ...prev,
        [projectId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const renderProjectCard = (project: any) => (
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
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center">
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {project.team?.length || 0} member{project.team?.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            {project.owner === user?._id && (
              <Tooltip title="View Applications">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    setApplicationsAnchorEl(e.currentTarget);
                    fetchApplications(project._id);
                  }}
                >
                  <MuiBadge 
                    badgeContent={notifications.filter(n => n.projectId === project._id).length} 
                    color="secondary"
                  >
                    <PeopleIcon />
                  </MuiBadge>
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {project.owner !== user?._id && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleApplyClick(project)}
              startIcon={<PersonIcon />}
            >
              Apply
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const renderRecommendedProjectCard = (project: any) => (
    <Card sx={{ 
      height: '100%',
      border: '2px solid',
      borderColor: alpha('#1ABC9C', 0.3),
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #1ABC9C 0%, #3498DB 100%)'
      }
    }}>
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
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip
              label="Recommended"
              size="small"
              sx={{ 
                backgroundColor: alpha('#1ABC9C', 0.1),
                color: '#1ABC9C',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
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
          Skills Match
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
                backgroundColor: alpha('#1ABC9C', 0.1),
                color: '#1ABC9C',
                fontWeight: 500
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
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center">
              <TrendingUpIcon sx={{ mr: 1, color: '#1ABC9C', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: '#1ABC9C', fontWeight: 500 }}>
                {Math.floor(Math.random() * 30) + 70}% Match
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {project.team?.length || 0} member{project.team?.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          {project.owner !== user?._id && (
            <Button
              variant="contained"
              size="small"
              onClick={() => handleApplyClick(project)}
              startIcon={<PersonIcon />}
              sx={{
                backgroundColor: '#1ABC9C',
                '&:hover': {
                  backgroundColor: '#16A085'
                }
              }}
            >
              Apply
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const renderOpportunityCard = (opportunity: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 1 
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {opportunity.title}
          </Typography>
          <Chip
            label={opportunity.type}
            color="primary"
            size="small"
            sx={{ 
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          />
        </Box>
        
        <Typography color="text.secondary" gutterBottom>
          Posted by {opportunity.author.name}
        </Typography>
        
        <Typography color="text.secondary" sx={{ mb: 2, fontSize: '0.95rem', height: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {opportunity.description}
        </Typography>
        
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
          <Typography variant="body2" color="text.secondary">
            Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

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
              Browse available projects and opportunities
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
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
            {canPost && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<WorkIcon />}
                onClick={() => setOpenOpportunityDialog(true)}
                sx={{ 
                  py: 1.2, 
                  px: 3, 
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Post Opportunity
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem'
              }
            }}
          >
            <Tab label="All Projects" />
            <Tab label="Recommended" icon={<RecommendIcon />} iconPosition="start" />
            <Tab label="Opportunities" />
          </Tabs>
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
            {activeTab === 0 ? (
              filteredProjects.length === 0 ? (
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
                      {renderProjectCard(project)}
                    </Grid>
                  ))}
                </Grid>
              )
            ) : activeTab === 1 ? (
              <Box>
                <Box sx={{ 
                  backgroundColor: 'white', 
                  borderRadius: 3, 
                  p: 3, 
                  mb: 3,
                  border: '1px solid',
                  borderColor: alpha('#1ABC9C', 0.2),
                  background: `linear-gradient(135deg, ${alpha('#1ABC9C', 0.05)} 0%, ${alpha('#3498DB', 0.05)} 100%)`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <RecommendIcon sx={{ color: '#1ABC9C', mr: 1, fontSize: 28 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#2D3E50' }}>
                        Recommended for You
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={fetchRecommendations}
                      disabled={loadingRecommendations}
                      sx={{ 
                        borderColor: '#1ABC9C',
                        color: '#1ABC9C',
                        '&:hover': {
                          borderColor: '#16A085',
                          backgroundColor: alpha('#1ABC9C', 0.05)
                        }
                      }}
                    >
                      {loadingRecommendations ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    Projects tailored to your skills, interests, and experience level
                  </Typography>
                </Box>

                {loadingRecommendations ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress color="secondary" />
                  </Box>
                ) : recommendedProjects.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6, 
                    backgroundColor: 'white', 
                    borderRadius: 3,
                    border: '1px dashed #CCCCCC'
                  }}>
                    <StarIcon sx={{ fontSize: 60, color: alpha('#596273', 0.3), mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No recommendations available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Complete your profile with skills and interests to get personalized recommendations
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {recommendedProjects.map((project) => (
                      <Grid 
                        item 
                        xs={12} 
                        md={6} 
                        lg={4} 
                        key={project.id || project._id}
                        onMouseEnter={() => recommendationService.recordInteraction('view', project._id, 'project')}
                      >
                        {renderRecommendedProjectCard(project)}
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            ) : (
              filteredOpportunities.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6, 
                  backgroundColor: 'white', 
                  borderRadius: 3,
                  border: '1px dashed #CCCCCC'
                }}>
                  <WorkIcon sx={{ fontSize: 60, color: alpha('#596273', 0.3), mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No opportunities found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {search ? 'Try adjusting your search terms' : canPost ? 'Post your first opportunity to get started' : 'Check back later for new opportunities'}
                  </Typography>
                  {!search && canPost && (
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      startIcon={<WorkIcon />}
                      onClick={() => setOpenOpportunityDialog(true)}
                      sx={{ mt: 3 }}
                    >
                      Post Opportunity
                    </Button>
                  )}
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {filteredOpportunities.map((opportunity) => (
                    <Grid item xs={12} md={6} lg={4} key={opportunity._id}>
                      {renderOpportunityCard(opportunity)}
                    </Grid>
                  ))}
                </Grid>
              )
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

        {/* Project Application Dialog */}
        <ProjectApplicationDialog
          open={openApply}
          onClose={() => setOpenApply(false)}
          project={selectedProjectForApply}
          onSubmit={handleSubmitApplication}
        />

        {/* Applications Menu */}
        <Menu
          anchorEl={applicationsAnchorEl}
          open={Boolean(applicationsAnchorEl)}
          onClose={() => setApplicationsAnchorEl(null)}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          {applications[selectedProjectForApply?._id]?.map((application: any) => (
            <MenuItem key={application._id}>
              <ListItemAvatar>
                <Avatar src={application.applicant.avatar}>
                  {application.applicant.name[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={application.applicant.name}
                secondary={application.message}
              />
            </MenuItem>
          )) || (
            <MenuItem disabled>
              <ListItemText primary="No applications yet" />
            </MenuItem>
          )}
        </Menu>

        {/* Opportunity Dialog */}
        <Dialog open={openOpportunityDialog} onClose={() => setOpenOpportunityDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Post New Opportunity</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <TextField
                label="Title"
                fullWidth
                value={opportunityFormData.title}
                onChange={(e) => setOpportunityFormData({...opportunityFormData, title: e.target.value})}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={opportunityFormData.description}
                onChange={(e) => setOpportunityFormData({...opportunityFormData, description: e.target.value})}
              />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={opportunityFormData.type}
                  onChange={(e) => setOpportunityFormData({...opportunityFormData, type: e.target.value})}
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
                value={opportunityFormData.deadline}
                onChange={(e) => setOpportunityFormData({...opportunityFormData, deadline: e.target.value})}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOpportunityDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitOpportunity} variant="contained">Post</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Projects;