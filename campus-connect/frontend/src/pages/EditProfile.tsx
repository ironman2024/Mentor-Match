import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Save as SaveIcon, Add as AddIcon, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
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
    if (!user?._id) {
      showNotification('Please log in to edit your profile', 'error');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user?._id) throw new Error('User not authenticated');

      const response = await axios.get(`http://localhost:5002/api/profile/user/${user._id}`);
      
      if (response.data) {
        const { user: userData, ...profileData } = response.data;
        setProfile({
          name: userData?.name || '',
          bio: userData?.bio || '',
          department: profileData?.department || '',
          yearOfGraduation: profileData?.yearOfGraduation || '',
          skills: userData?.skills || [],
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
      if (!user?._id) throw new Error('User not authenticated');

      const response = await axios.put('http://localhost:5002/api/profile', {
        ...profile,
        userId: user._id
      });

      if (response.data) {
        showNotification('Profile updated successfully!', 'success');
        await fetchProfile();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showNotification(error.response?.data?.message || 'Error updating profile', 'error');
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await axios.post(
          'http://localhost:5002/api/profile/avatar',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );

        if (response.data.url) {
          setProfile(prev => ({
            ...prev,
            avatar: response.data.url
          }));
          setNotification({
            open: true,
            message: 'Avatar uploaded successfully!',
            type: 'success'
          });
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setNotification({
          open: true,
          message: 'Error uploading avatar. Please try again.',
          type: 'error'
        });
      }
    }
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
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Edit Profile</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Box position="relative">
              <Avatar
                src={profile.avatar}
                sx={{ width: 120, height: 120 }}
              />
              <input
                accept="image/*"
                type="file"
                hidden
                id="avatar-upload"
                onChange={handleAvatarUpload}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={profile.name}
              onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
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
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Department"
              value={profile.department}
              onChange={e => setProfile(prev => ({ ...prev, department: e.target.value }))}
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
            <Typography variant="h6" gutterBottom>Skills</Typography>
            <Box display="flex" gap={1} mb={2}>
              {profile.skills.map(skill => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => setProfile(prev => ({
                    ...prev,
                    skills: prev.skills.filter(s => s !== skill)
                  }))}
                />
              ))}
            </Box>
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                label="Add Skill"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleAddSkill}
                startIcon={<AddIcon />}
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
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GitHub Profile"
              value={profile.github}
              onChange={e => setProfile(prev => ({ ...prev, github: e.target.value }))}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={notification.type}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProfile;
