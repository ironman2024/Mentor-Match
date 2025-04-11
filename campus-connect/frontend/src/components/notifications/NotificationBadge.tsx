import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  Chat as ChatIcon, 
  Event as EventIcon, 
  Person as PersonIcon, 
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Theme colors to match with MainLayout
const themeColors = {
  primary: '#585E6C',       // Dark blue-gray
  secondary: '#E9573F',     // Red-orange from the tie/globe
  lightGray: '#F5F7FA',     // Light background color
  textPrimary: '#333842',   // Darker text
  textSecondary: '#B5BBC9', // Lighter text
  white: '#FFFFFF'
};

const NotificationBadge: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interval, setIntervalId] = useState<NodeJS.Timeout | null>(null);

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
      if (interval) clearInterval(interval);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 30000);
      setIntervalId(intervalId);
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [user]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh notifications when opening menu
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

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?._id) return;
      
      await axios.patch('http://localhost:5002/api/notifications/mark-all-read', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'mentorship_request':
      case 'mentorship_accepted':
        return (
          <Avatar sx={{ bgcolor: themeColors.primary, width: 32, height: 32 }}>
            <PersonIcon fontSize="small" />
          </Avatar>
        );
      case 'message':
        return (
          <Avatar sx={{ bgcolor: themeColors.secondary, width: 32, height: 32 }}>
            <ChatIcon fontSize="small" />
          </Avatar>
        );
      case 'event_registration':
        return (
          <Avatar sx={{ bgcolor: '#4A90E2', width: 32, height: 32 }}>
            <EventIcon fontSize="small" />
          </Avatar>
        );
      default:
        return (
          <Avatar sx={{ bgcolor: '#5CB85C', width: 32, height: 32 }}>
            <NotificationsIcon fontSize="small" />
          </Avatar>
        );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton 
          onClick={handleMenuOpen}
          sx={{ 
            color: unreadCount > 0 ? themeColors.secondary : themeColors.primary,
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(233, 87, 63, 0.08)'
            },
            mr: 1
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: themeColors.secondary,
                color: themeColors.white,
                fontWeight: 'bold',
                boxShadow: '0 0 0 2px #fff'
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            width: 360,
            maxWidth: '90vw',
            maxHeight: 400,
            overflowY: 'auto',
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
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.primary }}>
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Typography>
          {unreadCount > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: themeColors.secondary, 
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={markAllAsRead}
            >
              Mark all as read
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: themeColors.textSecondary, opacity: 0.5, mb: 1 }} />
            <Typography variant="body2" color="textSecondary" textAlign="center">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem 
                  button
                  alignItems="flex-start"
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    py: 1.5,
                    px: 2,
                    backgroundColor: notification.read ? 'transparent' : 'rgba(233, 87, 63, 0.05)',
                    '&:hover': {
                      backgroundColor: notification.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(233, 87, 63, 0.1)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 42, mt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: notification.read ? 500 : 600,
                            color: notification.read ? themeColors.textPrimary : themeColors.secondary
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {!notification.read && (
                            <CircleIcon sx={{ color: themeColors.secondary, fontSize: 10, mr: 0.5 }} />
                          )}
                        </Box>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography 
                          variant="body2" 
                          component="span" 
                          sx={{ 
                            display: 'block',
                            color: themeColors.textSecondary
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          component="span" 
                          sx={{ 
                            display: 'block', 
                            mt: 0.5,
                            color: themeColors.textSecondary,
                            opacity: 0.8
                          }}
                        >
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
        {notifications.length > 0 && (
          <Box sx={{ textAlign: 'center', py: 1.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: themeColors.primary, 
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => {
                navigate('/notifications');
                handleMenuClose();
              }}
            >
              View all notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationBadge;