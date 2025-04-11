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
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
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
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Profile</Typography>
          {isOwnProfile && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                sx={{ width: 120, height: 120, mb: 2 }}
                src={user?.avatar}
              />
              <Typography variant="h6">{profile.name}</Typography>
              <Typography color="textSecondary">{profile.email}</Typography>
            </Box>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Box>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={3}
                value={profile.bio}
                disabled={!isEditing}
                sx={{ mb: 2 }}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={profile.department}
                    disabled={!isEditing}
                    onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Year of Graduation"
                    value={profile.yearOfGraduation}
                    disabled={!isEditing}
                    onChange={(e) => setProfile(prev => ({ ...prev, yearOfGraduation: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Skills Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Skills</Typography>
            <Box sx={{ mb: 2 }}>
              {profile.skills.map((skill: string) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={isEditing ? () => handleRemoveSkill(skill) : undefined}
                  sx={{ m: 0.5 }}
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
            <Typography variant="h6" gutterBottom>Professional Links</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  value={profile.linkedin}
                  disabled={!isEditing}
                  onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GitHub"
                  value={profile.github}
                  disabled={!isEditing}
                  onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
