import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

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
    <Card>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            src={user?.avatar ? `http://localhost:5002${user.avatar}` : undefined}
            sx={{ width: 80, height: 80, mb: 2 }}
          >
            {user?.name?.[0] || <PersonIcon />}
          </Avatar>
          <Typography variant="h6" gutterBottom>
            {user?.name}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {user?.role}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Skills
          </Typography>
          <Typography color="textSecondary" paragraph>
            {formatSkills(user?.skills || []).join(', ') || 'No skills added yet'}
          </Typography>
        </Box>

        <Box display="flex" gap={2} mt={2}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => navigate(`/profile/edit`)}
          >
            Edit Profile
          </Button>
          <Button 
            fullWidth 
            variant="contained"
            onClick={() => navigate(`/profile/${user?._id}`)}
          >
            View Profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
