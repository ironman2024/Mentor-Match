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
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile: React.FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = user?._id === userId || !userId;

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
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);

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
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // TODO: Implement API call to save profile changes
    setIsEditing(false);
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
                  {profile.email}
                </Typography>
              </Box>
            </Grid>

            {/* Profile Details */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={3}
                value={profile.bio}
                disabled={!isEditing}
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
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={profile.department}
                    disabled={!isEditing}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Year of Graduation"
                    value={profile.yearOfGraduation}
                    disabled={!isEditing}
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
                    onDelete={isEditing ? () => handleRemoveSkill(skill) : undefined}
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
              {isEditing && (
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
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={profile.linkedin}
                    disabled={!isEditing}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="GitHub"
                    value={profile.github}
                    disabled={!isEditing}
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
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Profile;