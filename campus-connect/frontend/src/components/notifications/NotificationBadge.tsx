import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Notifications as NotificationsIcon, Chat as ChatIcon, Event as EventIcon, Person as PersonIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationBadge: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?._id) return;

      const response = await axios.get('http://localhost:5002/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Clear interval on connection error
      clearInterval(interval);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      await axios.patch(`http://localhost:5002/api/notifications/${notification._id}`, 
        { read: true }
      );

      // Handle different notification types
      switch (notification.type) {
        case 'mentorship_request':
          navigate('/mentorship/dashboard');
          break;
        case 'mentorship_accepted':
          navigate('/inbox');
          break;
        case 'message':
          navigate('/inbox');
          break;
        default:
          // Handle other notification types
          break;
      }

      fetchNotifications();
    } catch (error) {
      console.error('Error handling notification:', error);
    }
    handleMenuClose();
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'mentorship_request':
      case 'mentorship_accepted':
        return <PersonIcon fontSize="small" />;
      case 'message':
        return <ChatIcon fontSize="small" />;
      case 'event_registration':
        return <EventIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 300,
            width: 320
          }
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>No notifications</MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              sx={{ 
                whiteSpace: 'normal',
                bgcolor: notification.read ? 'transparent' : 'action.hover'
              }}
            >
              <Box>
                <Typography variant="subtitle2">{notification.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBadge;
