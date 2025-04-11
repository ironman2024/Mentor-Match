import React, { useState } from 'react';
import { Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Container, 
  AppBar, 
  Tabs, 
  Tab, 
  Button, 
  useTheme,
  useMediaQuery,
  CircularProgress,
  Fab,
  Toolbar,
  Typography,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Leaderboard as LeaderboardIcon,
  WorkOutline as OpportunitiesIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Navbar from '../Navbar';
import { useAuth } from '../../contexts/AuthContext';
import SendMessageDialog from '../dialogs/SendMessageDialog';
import NotificationBadge from '../notifications/NotificationBadge';

const DRAWER_WIDTH = 240;

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openSendMessage, setOpenSendMessage] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return <CircularProgress />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Messages', icon: <ChatIcon />, path: '/inbox' },
    { text: 'Mentorship', icon: <GroupIcon />, path: '/mentorship' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
    { text: 'Projects', icon: <SchoolIcon />, path: '/projects' },
    
    { text: 'Event Calender', icon: <CalendarTodayIcon />, path: '/calender' },
    ...(user?.role === 'faculty' || user?.role === 'alumni' ? [
      { text: 'Opportunities', icon: <OpportunitiesIcon />, path: '/opportunities' }
    ] : [])
  ];

  // Update active tab based on current path
  React.useEffect(() => {
    const index = menuItems.findIndex(item => item.path === location.pathname);
    if (index !== -1) {
      setActiveTab(index);
    }
  }, [location.pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    navigate(menuItems[newValue].path);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Box>
      <AppBar 
        position="fixed" 
        color="inherit" 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <SchoolIcon sx={{ mr: 2, color: '#585E6C' }} />
            <Typography variant="h6" sx={{ color: '#585E6C', flexGrow: 0 }}>
              MatchMentor
            </Typography>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                ml: 4,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 64,
                  color: '#B5BBC9',
                  '&.Mui-selected': {
                    color: '#585E6C',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#585E6C',
                }
              }}
            >
              {menuItems.map((item, index) => (
                <Tab
                  key={item.text}
                  icon={item.icon}
                  label={item.text}
                  iconPosition="start"
                  sx={{
                    minWidth: 'auto',
                    px: 3,
                  }}
                />
              ))}
            </Tabs>
            {isAuthenticated && <NotificationBadge />}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Tooltip title="Logout">
                <IconButton
                  onClick={() => setLogoutDialog(true)}
                  sx={{ color: '#585E6C' }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog 
        open={logoutDialog} 
        onClose={() => setLogoutDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#585E6C' }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#B5BBC9' }}>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setLogoutDialog(false)}
            sx={{ color: '#B5BBC9' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogout}
            variant="contained"
            sx={{
              bgcolor: '#585E6C',
              '&:hover': { bgcolor: '#474D59' }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
        <Fab
          color="primary"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            bgcolor: '#585E6C',
            '&:hover': {
              bgcolor: '#474D59'
            }
          }}
          onClick={() => setOpenSendMessage(true)}
        >
          <ChatIcon />
        </Fab>
        <SendMessageDialog 
          open={openSendMessage}
          onClose={() => setOpenSendMessage(false)}
        />
      </Box>
    </Box>
  );
};

export default MainLayout;