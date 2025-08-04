import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBadge from './notifications/NotificationBadge';
import SchoolIcon from '@mui/icons-material/School';
import UserAvatar from './common/UserAvatar';

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { isAuthenticated, logout, user } = useAuth();

  const menuItems = [
    {
      text: 'Mentorship',
      path: user?.role === 'student' ? '/mentorship' : '/mentorship/dashboard',
      icon: <SchoolIcon />,
      roles: ['student', 'faculty', 'alumni']
    },
  ];

  return (
    <AppBar position="fixed">
      <Toolbar>
        {isAuthenticated && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component={Link} to="/" sx={{ 
          flexGrow: 1,
          textDecoration: 'none',
          color: 'inherit'
        }}>
          Campus Connect
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {isAuthenticated && <NotificationBadge />}
          {!isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          ) : (
            <>
              <UserAvatar 
                user={user}
                size={32}
                component={Link}
                to={`/profile`}
                sx={{ 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s ease'
                  }
                }}
              />
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
