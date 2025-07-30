import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Article as ArticleIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const Profile: React.FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = !userId || user?._id === userId;

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    department: '',
    yearOfGraduation: '',
    skills: [] as string[],
    linkedin: '',
    github: '',
    experiences: [] as any[],
    education: [] as any[],
    projects: [] as any[],
    posts: [] as any[]
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [editDialogs, setEditDialogs] = useState({
    experience: false,
    education: false,
    project: false
  });
  const [currentEdit, setCurrentEdit] = useState<any>(null);
  const [editType, setEditType] = useState<'add' | 'edit'>('add');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const id = userId || user?._id;
    if (id) {
      fetchUserProfile(id);
    }
  }, [userId, user?._id]);

  const formatSkills = (skills: any[]) => {
    if (!Array.isArray(skills)) return [];
    return skills.map(skill => typeof skill === 'object' ? skill.name : skill);
  };

  const fetchUserProfile = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5002/api/profile/user/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data) {
        const { user: userData, ...profileData } = response.data;
        setProfile({
          name: userData?.name || '',
          bio: userData?.bio || '',
          department: profileData?.department || '',
          yearOfGraduation: profileData?.yearOfGraduation || '',
          skills: formatSkills(userData?.skills || []),
          linkedin: userData?.linkedin || '',
          github: userData?.github || '',
          experiences: profileData?.experiences || [],
          education: profileData?.education || [],
          projects: profileData?.projects || [],
          posts: profileData?.posts || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5002/api/profile/update`, profile, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    }
  };

  const openEditDialog = (type: 'experience' | 'education' | 'project', item?: any) => {
    setEditType(item ? 'edit' : 'add');
    setCurrentEdit(item || getEmptyItem(type));
    setEditDialogs(prev => ({ ...prev, [type]: true }));
  };

  const getEmptyItem = (type: string) => {
    switch (type) {
      case 'experience':
        return { title: '', company: '', startDate: '', endDate: '', description: '', current: false };
      case 'education':
        return { degree: '', institution: '', startDate: '', endDate: '', description: '', current: false };
      case 'project':
        return { title: '', description: '', technologies: [], url: '', startDate: '', endDate: '' };
      default:
        return {};
    }
  };

  const handleSaveItem = async (type: 'experience' | 'education' | 'project') => {
    try {
      const updatedItems = editType === 'add' 
        ? [...profile[type], currentEdit]
        : profile[type].map((item: any, index: number) => 
            item._id === currentEdit._id ? currentEdit : item
          );
      
      const updatedProfile = { ...profile, [type]: updatedItems };
      setProfile(updatedProfile);
      
      await axios.put(`http://localhost:5002/api/profile/update`, updatedProfile, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      enqueueSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} ${editType === 'add' ? 'added' : 'updated'} successfully`, { variant: 'success' });
      setEditDialogs(prev => ({ ...prev, [type]: false }));
      setCurrentEdit(null);
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      enqueueSnackbar(`Failed to save ${type}`, { variant: 'error' });
    }
  };

  const handleDeleteItem = async (type: 'experience' | 'education' | 'project', itemId: string) => {
    try {
      const updatedItems = profile[type].filter((item: any) => item._id !== itemId);
      const updatedProfile = { ...profile, [type]: updatedItems };
      setProfile(updatedProfile);
      
      await axios.put(`http://localhost:5002/api/profile/update`, updatedProfile, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      enqueueSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`, { variant: 'success' });
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      enqueueSnackbar(`Failed to delete ${type}`, { variant: 'error' });
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ 
      background: '#F8F9FB',
      minHeight: 'calc(100vh - 64px)',
      margin: -3,
      padding: 4
    }}>
      <Box maxWidth="1200px" margin="0 auto">
        <Paper elevation={0} sx={{ 
          p: { xs: 3, sm: 4 },
          borderRadius: '24px',
          border: '1px solid #B5BBC9',
          boxShadow: '0 4px 20px rgba(88,94,108,0.1)',
          background: 'white',
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" sx={{ color: '#585E6C', fontWeight: 700 }}>
              Profile
            </Typography>
            {isOwnProfile && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate('/profile/edit')}
                sx={{
                  borderRadius: '30px',
                  px: 3,
                  py: 1.5,
                  background: '#585E6C',
                  textTransform: 'none',
                  '&:hover': {
                    background: '#474D59',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(88,94,108,0.25)',
                  }
                }}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 2,
                    border: '2px solid #E74C3C'
                  }}
                  src={user?.avatar}
                />
                <Typography variant="h5" sx={{ color: '#585E6C', fontWeight: 600 }}>
                  {profile.name}
                </Typography>
                <Typography sx={{ color: '#B5BBC9', mt: 1 }}>
                  {user?.email}
                </Typography>
                <Typography variant="body2" sx={{ color: '#596273', mt: 1 }}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Typography>
              </Box>
            </Grid>

            {/* Profile Details */}
            <Grid item xs={12} md={8}>
              {isOwnProfile && isEditing ? (
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={profile.bio}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#585E6C',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#B5BBC9',
                    }
                  }}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                />
              ) : (
                <Box sx={{ mb: 3, p: 2, border: '1px solid #E0E0E0', borderRadius: '12px', minHeight: '80px' }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Bio</Typography>
                  <Typography variant="body1">{profile.bio || 'No bio available'}</Typography>
                </Box>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {isOwnProfile && isEditing ? (
                    <TextField
                      fullWidth
                      label="Department"
                      value={profile.department}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#585E6C',
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#B5BBC9',
                        }
                      }}
                      onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                    />
                  ) : (
                    <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: '12px' }}>
                      <Typography variant="body2" color="textSecondary">Department</Typography>
                      <Typography variant="body1">{profile.department || 'Not specified'}</Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {isOwnProfile && isEditing ? (
                    <TextField
                      fullWidth
                      label="Year of Graduation"
                      value={profile.yearOfGraduation}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#585E6C',
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#B5BBC9',
                        }
                      }}
                      onChange={(e) => setProfile(prev => ({ ...prev, yearOfGraduation: e.target.value }))}
                    />
                  ) : (
                    <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: '12px' }}>
                      <Typography variant="body2" color="textSecondary">Year of Graduation</Typography>
                      <Typography variant="body1">{profile.yearOfGraduation || 'Not specified'}</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Grid>

            {/* Skills Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600, mb: 2 }}>
                Skills
              </Typography>
              <Box sx={{ mb: 2 }}>
                {profile.skills.map((skill: string) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={isOwnProfile && isEditing ? () => handleRemoveSkill(skill) : undefined}
                    sx={{ 
                      m: 0.5,
                      bgcolor: '#585E6C',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#474D59'
                      }
                    }}
                  />
                ))}
              </Box>
              {isOwnProfile && isEditing && (
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    label="Add Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddSkill}
                    variant="contained"
                  >
                    Add
                  </Button>
                </Box>
              )}
            </Grid>

            {/* Social Links */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600, mb: 2 }}>
                Professional Links
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {isOwnProfile && isEditing ? (
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      value={profile.linkedin}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#585E6C',
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#B5BBC9',
                        }
                      }}
                      onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                    />
                  ) : (
                    <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: '12px' }}>
                      <Typography variant="body2" color="textSecondary">LinkedIn</Typography>
                      {profile.linkedin ? (
                        <Button href={profile.linkedin} target="_blank" sx={{ p: 0, textTransform: 'none' }}>
                          {profile.linkedin}
                        </Button>
                      ) : (
                        <Typography variant="body1">Not provided</Typography>
                      )}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {isOwnProfile && isEditing ? (
                    <TextField
                      fullWidth
                      label="GitHub"
                      value={profile.github}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#585E6C',
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#B5BBC9',
                        }
                      }}
                      onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                    />
                  ) : (
                    <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: '12px' }}>
                      <Typography variant="body2" color="textSecondary">GitHub</Typography>
                      {profile.github ? (
                        <Button href={profile.github} target="_blank" sx={{ p: 0, textTransform: 'none' }}>
                          {profile.github}
                        </Button>
                      ) : (
                        <Typography variant="body1">Not provided</Typography>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Grid>

            {/* Experience Section */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid #B5BBC9', borderRadius: '16px' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ mr: 1 }} /> Experience
                    </Typography>
                    {isOwnProfile && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => openEditDialog('experience')}
                        variant="outlined"
                        size="small"
                      >
                        Add Experience
                      </Button>
                    )}
                  </Box>
                  {profile.experiences.map((exp: any, index: number) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: '8px' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>{exp.title}</Typography>
                          <Typography variant="body2" color="primary">{exp.company}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>{exp.description}</Typography>
                        </Box>
                        {isOwnProfile && (
                          <Box>
                            <IconButton size="small" onClick={() => openEditDialog('experience', exp)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteItem('experience', exp._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                  {profile.experiences.length === 0 && (
                    <Typography color="textSecondary">No experience added yet</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Education Section */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid #B5BBC9', borderRadius: '16px' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 1 }} /> Education
                    </Typography>
                    {isOwnProfile && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => openEditDialog('education')}
                        variant="outlined"
                        size="small"
                      >
                        Add Education
                      </Button>
                    )}
                  </Box>
                  {profile.education.map((edu: any, index: number) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: '8px' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>{edu.degree}</Typography>
                          <Typography variant="body2" color="primary">{edu.institution}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>{edu.description}</Typography>
                        </Box>
                        {isOwnProfile && (
                          <Box>
                            <IconButton size="small" onClick={() => openEditDialog('education', edu)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteItem('education', edu._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                  {profile.education.length === 0 && (
                    <Typography color="textSecondary">No education added yet</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Projects Section */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid #B5BBC9', borderRadius: '16px' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <CodeIcon sx={{ mr: 1 }} /> Projects
                    </Typography>
                    {isOwnProfile && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => openEditDialog('project')}
                        variant="outlined"
                        size="small"
                      >
                        Add Project
                      </Button>
                    )}
                  </Box>
                  {profile.projects.map((project: any, index: number) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: '8px' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>{project.title}</Typography>
                          <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>{project.description}</Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                            {project.technologies?.map((tech: string, techIndex: number) => (
                              <Chip key={techIndex} label={tech} size="small" sx={{ background: '#F0F0F0' }} />
                            ))}
                          </Box>
                          {project.url && (
                            <Button size="small" href={project.url} target="_blank" sx={{ color: '#585E6C' }}>
                              View Project
                            </Button>
                          )}
                        </Box>
                        {isOwnProfile && (
                          <Box>
                            <IconButton size="small" onClick={() => openEditDialog('project', project)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteItem('project', project._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                  {profile.projects.length === 0 && (
                    <Typography color="textSecondary">No projects added yet</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Posts Section */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid #B5BBC9', borderRadius: '16px' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600, display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ArticleIcon sx={{ mr: 1 }} /> Recent Posts
                  </Typography>
                  {profile.posts.map((post: any, index: number) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: '8px' }}>
                      <Typography variant="body1" fontWeight={600}>{post.title}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {post.content?.substring(0, 150)}...
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                  {profile.posts.length === 0 && (
                    <Typography color="textSecondary">No posts yet</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Edit Dialogs */}
      {['experience', 'education', 'project'].map((type) => (
        <Dialog
          key={type}
          open={editDialogs[type as keyof typeof editDialogs]}
          onClose={() => setEditDialogs(prev => ({ ...prev, [type]: false }))}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editType === 'add' ? 'Add' : 'Edit'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {type === 'experience' && (
                <>
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={currentEdit?.title || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ ...prev, title: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Company"
                    value={currentEdit?.company || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ ...prev, company: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={currentEdit?.startDate || ''}
                        onChange={(e) => setCurrentEdit(prev => ({ ...prev, startDate: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={currentEdit?.endDate || ''}
                        onChange={(e) => setCurrentEdit(prev => ({ ...prev, endDate: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        disabled={currentEdit?.current}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={currentEdit?.description || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ ...prev, description: e.target.value }))}
                  />
                </>
              )}
              {type === 'education' && (
                <>
                  <TextField
                    fullWidth
                    label="Degree"
                    value={currentEdit?.degree || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ ...prev, degree: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Institution"
                    value={currentEdit?.institution || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ ...prev, institution: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={currentEdit?.startDate || ''}
                        onChange={(e) => setCurrentEdit(prev => ({ ...prev, startDate: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={currentEdit?.endDate || ''}
                        onChange={(e) => setCurrentEdit(prev => ({ ...prev, endDate: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        disabled={currentEdit?.current}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={currentEdit?.description || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ ...prev, description: e.target.value }))}
                  />
                </>
              )}
              {type === 'project' && (
                <>
                  <TextField
                    fullWidth
                    label="Project Title"
                    value={currentEdit?.title || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ ...prev, title: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={currentEdit?.description || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ ...prev, description: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Technologies (comma separated)"
                    value={currentEdit?.technologies?.join(', ') || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ 
                      ...prev, 
                      technologies: e.target.value.split(',').map(t => t.trim()) 
                    }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Project URL"
                    value={currentEdit?.url || ''}
                    onChange={(e) => setCurrentEdit(prev => ({ ...prev, url: e.target.value }))}
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogs(prev => ({ ...prev, [type]: false }))}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleSaveItem(type as 'experience' | 'education' | 'project')}
              variant="contained"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      ))}
    </Box>
  );
};

export default Profile;