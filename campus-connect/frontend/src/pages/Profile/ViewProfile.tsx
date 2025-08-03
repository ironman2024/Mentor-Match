import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  EmojiEvents as AchievementsIcon,
  Code as ProjectsIcon,
  Groups as CommunitiesIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AvatarUpload from '../../components/profile/AvatarUpload';

const ViewProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3, bgcolor: '#f3f2ef', minHeight: '100vh' }}>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        {/* Cover Image */}
        <Box sx={{ height: 200, bgcolor: 'primary.main', position: 'relative' }} />
        
        {/* Profile Info */}
        <Box sx={{ p: 3, mt: -8 }}>
          <AvatarUpload
            currentAvatar={user?.avatar}
            size={152}
            editable={true}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">{user?.name || 'User Name'}</Typography>
              <Typography color="textSecondary">{user?.bio || 'Computer Science Student @ University'}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Mumbai, Maharashtra, India
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <IconButton color="primary" size="small">
                  <LinkedInIcon />
                </IconButton>
                <IconButton color="primary" size="small">
                  <GitHubIcon />
                </IconButton>
              </Box>
            </Box>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Skills & Endorsements */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Skills</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {['React', 'TypeScript', 'Node.js', 'Python', 'Machine Learning'].map((skill) => (
            <Chip 
              key={skill} 
              label={skill} 
              sx={{ 
                bgcolor: '#f3f2ef',
                '&:hover': { bgcolor: '#eef3f8' }
              }} 
            />
          ))}
        </Box>
      </Paper>

      {/* Education */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Education</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <SchoolIcon color="primary" />
          <Box>
            <Typography fontWeight="bold">Bachelor of Engineering in Computer Science</Typography>
            <Typography color="textSecondary">University Name</Typography>
            <Typography variant="body2" color="textSecondary">2020 - 2024</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Add Achievements Section */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AchievementsIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">Achievements</Typography>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {['Dean\'s List 2023', 'Hackathon Winner', 'Best Project Award'].map((achievement) => (
            <Grid item xs={12} sm={4} key={achievement}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: '#f8fafd',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}>
                <Typography fontWeight="bold">{achievement}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Add Projects Section */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ProjectsIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">Projects</Typography>
        </Box>
        {['Campus Connect - Student Network', 'AI Study Assistant', 'Smart Library System'].map((project) => (
          <Box key={project} sx={{ mb: 2, p: 2, bgcolor: '#f8fafd', borderRadius: 2 }}>
            <Typography fontWeight="bold">{project}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Add Communities Section */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CommunitiesIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">Communities & Clubs</Typography>
        </Box>
        <Grid container spacing={2}>
          {['Tech Club', 'Coding Society', 'AI/ML Group'].map((community) => (
            <Grid item xs={12} sm={4} key={community}>
              <Chip 
                label={community}
                sx={{ 
                  width: '100%',
                  py: 2,
                  bgcolor: '#f8fafd',
                  '&:hover': { bgcolor: '#eef3f8' }
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ViewProfile;
