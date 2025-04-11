import React from 'react';
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
  return (
    <Card>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            src={user?.avatar}
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
            {user?.skills?.join(', ') || 'No skills added yet'}
          </Typography>
        </Box>

        <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
