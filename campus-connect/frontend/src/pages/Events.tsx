import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Paper,
  useTheme
} from '@mui/material';
import {
  Event as EventIcon,
  Search as SearchIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import TeamRegistrationDialog from '../components/dialogs/TeamRegistrationDialog';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Custom theme with Coral Red color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#585E6C', // Steel Blue Gray
      light: '#B5BBC9', // Cool Gray
      dark: '#2D3E50',
    },
    secondary: {
      main: '#E74C3C', // Coral Red
      light: '#FF6B6B',
      dark: '#C0392B',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#585E6C', // Steel Blue Gray
      secondary: '#B5BBC9', // Cool Gray
    },
    error: {
      main: '#E74C3C',
    },
    warning: {
      main: '#F39C12',
    },
    success: {
      main: '#1ABC9C',
    },
    info: {
      main: '#3498DB',
    }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#585E6C',
    },
    h6: {
      fontWeight: 600,
      color: '#585E6C',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 6px 16px rgba(88, 94, 108, 0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 24px rgba(88, 94, 108, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 12,
          fontWeight: 600,
          textTransform: 'none',
          padding: '12px 24px',
          boxShadow: 'none', // Removed shadow
          '&:hover': {
            boxShadow: 'none', // Removed hover shadow
          },
        },
        outlined: {
          borderRadius: 12,
          borderWidth: 2,
          fontWeight: 600,
          textTransform: 'none',
          padding: '10px 22px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 20,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: '#585E6C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#585E6C',
            },
          },
        },
      },
    },
  },
});

interface Event {
  id: string;
  _id: string;  // Added for MongoDB compatibility
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'hackathon' | 'workshop' | 'seminar' | 'competition';
  organizer: string;
  image?: string;
  capacity: number;
  registered: number;
  isTeamEvent: boolean;
  teamSize: number;
}

const Events: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    type: 'hackathon',
    capacity: 0,
    isTeamEvent: false,
    teamSize: 1
  });

  const [registrationDialog, setRegistrationDialog] = useState({
    open: false,
    eventId: '',
    event: null as any
  });

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    open: false,
    message: '',
    type: 'success'
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ open: true, message, type });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      await axios.post('http://localhost:5002/api/events', eventForm);
      setOpenCreate(false);
      fetchEvents();
      showNotification('Event created successfully!', 'success');
      setEventForm({
        title: '',
        description: '',
        date: '',
        location: '',
        type: 'hackathon',
        capacity: 0,
        isTeamEvent: false,
        teamSize: 1
      });
    } catch (error) {
      console.error('Error creating event:', error);
      showNotification('Failed to create event. Please try again.', 'error');
    }
  };

  const handleRegisterClick = (event: any) => {
    if (user?.role !== 'student') {
      showNotification('Only students can register for events', 'error');
      return;
    }
    setRegistrationDialog({
      open: true,
      eventId: event._id,
      event: event
    });
  };

  const handleRegistrationSubmit = async (registrationData: any) => {
    try {
      await axios.post(
        `http://localhost:5002/api/events/${registrationDialog.eventId}/register`,
        registrationData
      );
      showNotification('Successfully registered for the event!', 'success');
      setRegistrationDialog({ open: false, eventId: '', event: null });
      fetchEvents(); // Refresh events list
    } catch (error) {
      console.error('Registration error:', error);
      showNotification('Failed to register. Please try again.', 'error');
    }
  };

  const canCreateEvent = user?.role === 'faculty' || user?.role === 'club';

  const filteredEvents = events.filter(event => 
    (filter === 'all' || event.type === filter) &&
    (event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Get color for event type chip
  const getEventTypeColor = (type: string) => {
    switch(type) {
      case 'hackathon':
        return '#E74C3C'; // Coral Red for hackathons
      case 'workshop':
        return '#3498DB'; // Blue for workshops
      case 'seminar':
        return '#9B59B6'; // Purple for seminars
      case 'competition':
        return '#F39C12'; // Orange for competitions
      default:
        return '#E74C3C'; // Default Coral Red
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper sx={{ 
        p: 4, 
        borderRadius: 3, 
        backgroundColor: '#F5F7FA',
        backgroundImage: 'linear-gradient(to bottom, #FFFFFF, #F5F7FA)',
        minHeight: '100vh'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '60px',
                height: '4px',
                bottom: '-10px',
                left: '0',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '2px'
              }
            }}
          >
            Campus Events
          </Typography>
          {canCreateEvent && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreate(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #585E6C 30%, #B5BBC9 90%)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.2
              }}
            >
              Create Event
            </Button>
          )}
        </Box>

        <Box 
          display="flex" 
          gap={2} 
          mb={4}
          sx={{
            backgroundColor: 'white',
            p: 2.5,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            border: '1px solid #F0F0F0'
          }}
        >
          <TextField
            sx={{ 
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
            variant="outlined"
            placeholder="Search events by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Event Type"
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="all">All Events</MenuItem>
              <MenuItem value="hackathon">Hackathons</MenuItem>
              <MenuItem value="workshop">Workshops</MenuItem>
              <MenuItem value="seminar">Seminars</MenuItem>
              <MenuItem value="competition">Competitions</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {event.image ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.image}
                      alt={event.title}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        height: 200, 
                        background: `linear-gradient(135deg, ${getEventTypeColor(event.type)} 0%, ${theme.palette.secondary.main} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '-30%',
                          right: '-20%',
                          width: '250px',
                          height: '250px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.1)'
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-30%',
                          left: '-20%',
                          width: '200px',
                          height: '200px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.08)'
                        }
                      }}
                    >
                      <Typography variant="h5" color="white" fontWeight={700} sx={{ zIndex: 1 }}>
                        {event.title}
                      </Typography>
                    </Box>
                  )}
                  
                  <Chip 
                    label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                    size="small" 
                    sx={{ 
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: getEventTypeColor(event.type),
                      color: 'white',
                      fontWeight: 600,
                      px: 1,
                      '& .MuiChip-label': { px: 1.5 }
                    }} 
                  />
                  
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: 3
                  }}>
                    <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 1.5 }}>
                      {event.title}
                    </Typography>
                    
                    <Typography 
                      color="textSecondary" 
                      sx={{ 
                        mb: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.6
                      }}
                    >
                      {event.description}
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        mt: 'auto',
                        mb: 2,
                        p: 2.5,
                        backgroundColor: '#FAFAFA',
                        borderRadius: 3,
                        border: '1px solid #F0F0F0'
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={3} mb={2}>
                        <Box display="flex" alignItems="center">
                          <EventIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <LocationIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="body2" fontWeight={600}>
                            {event.location}
                          </Typography>
                        </Box>
                      </Box>

                      <Box 
                        display="flex" 
                        alignItems="center"
                        mb={1.5}
                      >
                        <PeopleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Box sx={{ width: '100%' }}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" fontWeight={600}>
                              Capacity
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {event.registrations.length}/{event.capacity} spots
                            </Typography>
                          </Box>
                          <Box 
                            sx={{ 
                              mt: 1,
                              width: '100%', 
                              height: 8, 
                              backgroundColor: '#E0E6ED',
                              borderRadius: 4,
                              overflow: 'hidden'
                            }}
                          >
                            <Box 
                              sx={{ 
                                width: `${(event.registered / event.capacity) * 100}%`, 
                                height: '100%', 
                                backgroundColor: event.registered >= event.capacity 
                                  ? '#95A5A6' 
                                  : (event.registered / event.capacity) > 0.8 
                                    ? '#F39C12' 
                                    : theme.palette.primary.main,
                                borderRadius: 4
                              }} 
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={event.registered >= event.capacity}
                      onClick={() => handleRegisterClick(event)}
                      sx={{ 
                        mt: 2,
                        py: 1.5,
                        backgroundColor: event.registered >= event.capacity ? '#95A5A6' : theme.palette.primary.main,
                        color: 'white',
                        borderRadius: 3,
                        fontWeight: 700,
                        '&:hover': {
                          backgroundColor: event.registered >= event.capacity 
                            ? '#95A5A6' 
                            : theme.palette.primary.dark
                        }
                      }}
                    >
                      {event.registered >= event.capacity ? 'No Spots Available' : 'Register Now'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Box 
              sx={{ 
                width: '100%', 
                py: 10, 
                textAlign: 'center',
                mt: 4
              }}
            >
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 7.5H18M8.964 17.5L4.5 19L6 14.5L16.5 4C17.0304 3.46973 17.7375 3.17157 18.4749 3.17157C19.2123 3.17157 19.9194 3.46973 20.4497 4C20.98 4.53032 21.2782 5.23736 21.2782 5.97479C21.2782 6.71222 20.98 7.41925 20.4497 7.94957L9.95 18.45L8.964 17.5Z" stroke="#95A5A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <Typography variant="h6" color="textSecondary" sx={{ mt: 3, fontWeight: 600 }}>
                No events found
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                Try adjusting your search or filters to find events
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 3 }}
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Grid>

        <Dialog 
          open={openCreate} 
          onClose={() => setOpenCreate(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, overflow: 'hidden' }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #E74C3C 30%, #FF6B6B 90%)', 
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 700,
            py: 2.5
          }}>
            Create New Event
          </DialogTitle>
          <DialogContent sx={{ mt: 2, px: 3 }}>
            <Box display="flex" flexDirection="column" gap={3} mt={2}>
              <TextField
                fullWidth
                label="Event Title"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </Grid>
              </Grid>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={eventForm.type}
                      onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                      label="Event Type"
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="hackathon">Hackathon</MenuItem>
                      <MenuItem value="workshop">Workshop</MenuItem>
                      <MenuItem value="seminar">Seminar</MenuItem>
                      <MenuItem value="competition">Competition</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ 
                backgroundColor: '#F5F7FA', 
                p: 3, 
                borderRadius: 3,
                border: '1px solid #B5BBC9'
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventForm.isTeamEvent}
                      onChange={(e) => setEventForm(prev => ({
                        ...prev,
                        isTeamEvent: e.target.checked
                      }))}
                      color="primary"
                    />
                  }
                  label={<Typography fontWeight={600}>Team Event</Typography>}
                />
                
                {eventForm.isTeamEvent && (
                  <TextField
                    fullWidth
                    label="Max Team Size"
                    type="number"
                    value={eventForm.teamSize}
                    onChange={(e) => setEventForm(prev => ({
                      ...prev,
                      teamSize: parseInt(e.target.value)
                    }))}
                    margin="normal"
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, backgroundColor: '#FAFAFA' }}>
            <Button 
              onClick={() => setOpenCreate(false)}
              variant="outlined"
              sx={{ 
                color: theme.palette.secondary.main, 
                borderColor: theme.palette.secondary.main,
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEvent} 
              variant="contained"
              sx={{ 
                background: 'linear-gradient(45deg, #585E6C 30%, #B5BBC9 90%)',
                color: 'white',
                fontWeight: 600,
                px: 4
              }}
            >
              Create Event
            </Button>
          </DialogActions>
        </Dialog>

        <TeamRegistrationDialog
          open={registrationDialog.open}
          onClose={() => setRegistrationDialog({ open: false, eventId: '', event: null })}
          onSubmit={handleRegistrationSubmit}
          maxTeamSize={registrationDialog.event?.teamSize || 1}
          isTeamEvent={registrationDialog.event?.isTeamEvent || false}
          showNotification={showNotification}
        />
        
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={notification.type} 
            onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            sx={{ 
              width: '100%', 
              borderRadius: 2.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontWeight: 600
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Paper>
    </ThemeProvider>
  );
};

export default Events;