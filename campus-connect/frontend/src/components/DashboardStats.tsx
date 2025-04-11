import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { Assignment as AssignmentIcon, Group as GroupIcon, 
         Event as EventIcon, Star as StarIcon } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" mb={1}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {value}
        </Typography>
      </Box>
      <Typography color="textSecondary">{title}</Typography>
    </CardContent>
  </Card>
);

const DashboardStats: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Projects" value="5" icon={<AssignmentIcon color="primary" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Mentorship Sessions" value="12" icon={<GroupIcon color="primary" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Events Attended" value="8" icon={<EventIcon color="primary" />} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Reputation Points" value="350" icon={<StarIcon color="primary" />} />
      </Grid>
    </Grid>
  );
};

export default DashboardStats;
