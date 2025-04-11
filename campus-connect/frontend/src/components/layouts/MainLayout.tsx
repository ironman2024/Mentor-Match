import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Leaderboard as LeaderboardIcon,
  WorkOutline as OpportunitiesIcon
} from '@mui/icons-material';
import Navbar from '../Navbar';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Mentorship', icon: <GroupIcon />, path: '/mentorship' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
    { text: 'Projects', icon: <SchoolIcon />, path: '/projects' },
    { text: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard' },
    ...(user?.role === 'faculty' || user?.role === 'alumni' ? [
      { text: 'Opportunities', icon: <OpportunitiesIcon />, path: '/opportunities' }
    ] : [])
  ];

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem button key={item.text} onClick={() => navigate(item.path)}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box display="flex">
      <Navbar onMenuClick={handleDrawerToggle} />
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` }
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
