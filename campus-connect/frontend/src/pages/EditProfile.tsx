import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import AvatarUpload from '../components/profile/AvatarUpload';
import axios from 'axios';

const EditProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    department: '',
    yearOfGraduation: '',
    skills: [] as string[],
    linkedin: '',
    github: '',
    experiences: [] as any[],
    avatar: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    if (user?._id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!user?._id) {
        throw new Error('User not authenticated');
      }

      const response = await axios.get(`http://localhost:5002/api/profile/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        const { user: userData, ...profileData } = response.data;
        setProfile({
          name: userData?.name || '',
          bio: userData?.bio || '',
          department: profileData?.department || '',
          yearOfGraduation: profileData?.yearOfGraduation || '',
          skills: Array.isArray(userData?.skills) 
            ? userData.skills.map((skill: any) => 
                typeof skill === 'object' ? skill.name : skill
              )
            : [],
          linkedin: userData?.linkedin || '',
          github: userData?.github || '',
          experiences: profileData?.experiences || [],
          avatar: userData?.avatar || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification('Error loading profile', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put('http://localhost:5002/api/profile', {
        ...profile,
        userId: user?._id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      showNotification('Profile updated successfully!', 'success');
      await fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showNotification(
        error.response?.data?.message || 'Error updating profile',
        'error'
      );
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

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setProfile(prev => ({
      ...prev,
      avatar: newAvatarUrl
    }));
    showNotification('Avatar updated successfully!', 'success');
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    
    switch (user?.role) {
      case 'student':
        // Current year to next 6 years
        for (let i = 0; i <= 6; i++) {
          years.push(currentYear + i);
        }
        break;
      case 'alumni':
      case 'faculty':
        // Past 50 years to current year
        for (let i = 50; i >= 0; i--) {
          years.push(currentYear - i);
        }
        break;
      default:
        break;
    }
    
    return years;
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

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
          <Typography variant="h4" sx={{ color: '#585E6C', fontWeight: 700, mb: 4 }}>
            Edit Profile
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <AvatarUpload
                currentAvatar={profile.avatar}
                size={120}
                onAvatarUpdate={handleAvatarUpdate}
                editable={true}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
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
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                value={profile.bio}
                onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={profile.department}
                onChange={e => setProfile(prev => ({ ...prev, department: e.target.value }))}
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
              />
            </Grid>

            {user?.role !== 'club' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Year of Graduation</InputLabel>
                  <Select
                    value={profile.yearOfGraduation}
                    onChange={e => setProfile(prev => ({
                      ...prev,
                      yearOfGraduation: e.target.value
                    }))}
                    label="Year of Graduation"
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
                  >
                    {getAvailableYears().map(year => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600, mb: 2 }}>
                Skills
              </Typography>
              <Box sx={{ mb: 2 }}>
                {profile.skills.map((skill: string, index: number) => (
                  <Chip
                    key={`${skill}-${index}`}
                    label={skill}
                    onDelete={() => setProfile(prev => ({
                      ...prev,
                      skills: prev.skills.filter(s => s !== skill)
                    }))}
                    sx={{ 
                      m: 0.5,
                      bgcolor: '#585E6C',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#474D59'
                      },
                      '& .MuiChip-deleteIcon': {
                        color: 'white',
                        '&:hover': { color: '#E74C3C' }
                      }
                    }}
                  />
                ))}
              </Box>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  label="Add Skill"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px'
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  sx={{
                    borderRadius: '30px',
                    px: 3,
                    background: '#585E6C',
                    textTransform: 'none',
                    '&:hover': {
                      background: '#474D59',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(88,94,108,0.25)',
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={profile.linkedin}
                onChange={e => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GitHub Profile"
                value={profile.github}
                onChange={e => setProfile(prev => ({ ...prev, github: e.target.value }))}
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
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                borderRadius: '30px',
                px: 4,
                py: 1.5,
                background: '#585E6C',
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  background: '#474D59',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(88,94,108,0.25)',
                }
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={notification.type}
          sx={{
            borderRadius: '12px',
            border: '1px solid',
            borderColor: notification.type === 'success' ? '#1ABC9C' : '#E74C3C'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProfile;