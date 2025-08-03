import React from 'react';
import { Box, Typography } from '@mui/material';

const TeamDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#585E6C', fontWeight: 600 }}>
        Team Dashboard
      </Typography>
      <Typography variant="body1" sx={{ color: '#B5BBC9' }}>
        Team dashboard functionality coming soon...
      </Typography>
    </Box>
  );
};

export default TeamDashboard;