import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import UserAvatar from '../common/UserAvatar';

interface ProfileCardProps {
  user: any; // Replace with proper User type
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const navigate = useNavigate();

  const formatSkills = (skills: any[]) => {
    if (!Array.isArray(skills)) return [];
    return skills.map(skill => typeof skill === 'object' ? skill.name : skill);
  };

  return (
    <Card sx={{
      borderRadius: '24px',
      border: '1px solid #B5BBC9',
      boxShadow: '0 4px 20px rgba(88,94,108,0.1)',
      background: 'white',
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <UserAvatar
            user={user}
            size={80}
            sx={{ 
              mb: 2,
              border: '2px solid #E74C3C'
            }}
          />
          <Typography variant="h6" sx={{ color: '#585E6C', fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Typography sx={{ color: '#B5BBC9' }}>
            {user?.role}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#B5BBC9' }} />

        <Box>
          <Typography variant="subtitle2" sx={{ color: '#585E6C', fontWeight: 600 }}>
            Skills
          </Typography>
          <Typography sx={{ color: '#B5BBC9' }}>
            {formatSkills(user?.skills || []).join(', ') || 'No skills added yet'}
          </Typography>
        </Box>

        <Box display="flex" gap={2} mt={3}>
          <Button 
            fullWidth 
            variant="outlined"
            onClick={() => navigate(`/profile/edit`)}
            sx={{
              py: 1.5,
              borderRadius: '30px',
              borderColor: '#585E6C',
              color: '#585E6C',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#474D59',
                background: 'rgba(88,94,108,0.05)',
              }
            }}
          >
            Edit Profile
          </Button>
          <Button 
            fullWidth 
            variant="contained"
            onClick={() => navigate(`/profile/${user?._id}`)}
            sx={{
              py: 1.5,
              borderRadius: '30px',
              background: '#585E6C',
              textTransform: 'none',
              '&:hover': {
                background: '#474D59',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(88,94,108,0.25)',
              }
            }}
          >
            View Profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;