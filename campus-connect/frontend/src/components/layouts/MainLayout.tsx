import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Event as EventIcon,
  School as SchoolIcon,
  WorkOutline as OpportunitiesIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Navbar from '../Navbar';
import { useAuth } from '../../contexts/AuthContext';
import SendMessageDialog from '../dialogs/SendMessageDialog';
import NotificationBadge from '../notifications/NotificationBadge';

const DRAWER_WIDTH = 240;

// Define theme colors based on the landing page
const themeColors = {
  primary: '#585E6C',       // Dark blue-gray from the landing page
  secondary: '#E9573F',     // Red-orange from the tie/globe
  lightGray: '#F5F7FA',     // Light background color
  textPrimary: '#333842',   // Darker text
  textSecondary: '#B5BBC9', // Lighter text
  white: '#FFFFFF',
  accent: '#4A90E2',        // Blue accent
  hover: '#474D59',         // Slightly darker primary for hover states
  divider: '#E0E4ED'        // Light divider color
};

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSendMessage, setOpenSendMessage] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: themeColors.lightGray
      }}>
        <CircularProgress sx={{ color: themeColors.secondary }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Messages', icon: <ChatIcon />, path: '/inbox' },
    { text: 'Mentorship', icon: <GroupIcon />, path: '/mentorship' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
    { text: 'Projects', icon: <SchoolIcon />, path: '/projects' },
    { text: 'Calendar', icon: <CalendarTodayIcon />, path: '/calendar' }
  ];

  // Update active tab based on current path
  useEffect(() => {
    const index = menuItems.findIndex(item => item.path === location.pathname);
    if (index !== -1) {
      setActiveTab(index);
    }
  }, [location.pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    navigate(menuItems[newValue].path);
  };

  const handleLogout = () => {
    // Logic for logging out would go here
    navigate('/login');
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: themeColors.lightGray 
    }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          borderBottom: 1, 
          borderColor: themeColors.divider,
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: themeColors.primary }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%', 
            height: 64 
          }}>
            <SchoolIcon sx={{ 
              mr: 1.5, 
              color: themeColors.primary,
              fontSize: 28
            }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: themeColors.primary, 
                fontWeight: 600,
                fontSize: '1.2rem'
              }}
            >
              MatchMentor
            </Typography>
            
            {!isMobile && (
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{
                  ml: 4,
                  height: 64,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minHeight: 64,
                    color: themeColors.textSecondary,
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: themeColors.primary,
                      backgroundColor: 'rgba(0, 0, 0, 0.03)'
                    },
                    '&.Mui-selected': {
                      color: themeColors.primary,
                      fontWeight: 600
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: themeColors.secondary,
                    height: 3
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
                      px: 2,
                    }}
                  />
                ))}
              </Tabs>
            )}
           
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              
              
              <Tooltip title="Profile">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36,
                      bgcolor: themeColors.secondary,
                      border: `2px solid ${themeColors.white}`,
                      '&:hover': { bgcolor: themeColors.accent }
                    }}
                  >
                    {user?.name?.charAt(0) || <PersonIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    overflow: 'visible',
                    borderRadius: 2,
                    width: 200,
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ py: 1, px: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.textPrimary }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                    {user?.role || 'Student'}
                  </Typography>
                </Box>
                <MenuItem sx={{ 
                  color: themeColors.textPrimary,
                  '&:hover': { bgcolor: themeColors.lightGray }
                }}>
                  <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  Profile
                </MenuItem>
                <MenuItem sx={{ 
                  color: themeColors.textPrimary,
                  '&:hover': { bgcolor: themeColors.lightGray }
                }}>
                  <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  Settings
                </MenuItem>
                <MenuItem 
                  onClick={() => setLogoutDialog(true)}
                  sx={{ 
                    color: themeColors.secondary,
                    '&:hover': { bgcolor: themeColors.lightGray }
                  }}
                >
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
            { <NotificationBadge />}
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog 
        open={logoutDialog} 
        onClose={() => setLogoutDialog(false)}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 3,
            p: 2,
            maxWidth: '400px',
            width: '90%',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: themeColors.textPrimary,
          fontWeight: 600,
          pb: 1
        }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: themeColors.textSecondary }}>
            Are you sure you want to logout from your MatchMentor account?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setLogoutDialog(false)}
            variant="outlined"
            sx={{ 
              color: themeColors.textPrimary,
              borderColor: themeColors.divider,
              '&:hover': { 
                borderColor: themeColors.primary,
                backgroundColor: themeColors.lightGray
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogout}
            variant="contained"
            sx={{
              bgcolor: themeColors.secondary,
              '&:hover': { bgcolor: '#D94B35' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: themeColors.white,
              px: 3,
              boxShadow: 'none'
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
          p: { xs: 2, sm: 3 },
          mt: 8,
          width: '100%'
        }}
      >
        <Container maxWidth="lg">
          <Paper 
            elevation={0} 
            sx={{ 
              backgroundColor: themeColors.white, 
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
              mb: 3,
              border: `1px solid ${themeColors.divider}`
            }}
          >
            <Outlet />
          </Paper>
        </Container>
        
        <Fab
          aria-label="send message"
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            bgcolor: themeColors.secondary,
            color: themeColors.white,
            '&:hover': {
              bgcolor: '#D94B35'
            },
            boxShadow: '0px 4px 14px rgba(233, 87, 63, 0.4)'
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