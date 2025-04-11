import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Box, Typography, Chip, Tooltip, Paper, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, Divider, Grid, Avatar, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import axios from 'axios';
import { 
  EventNote, LocationOn, People, Info, AccessTime, Person, 
  CalendarToday, Close, BookmarkBorder, Share, DirectionsWalk
} from '@mui/icons-material';

interface Organizer {
  _id: string;
  role: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'hackathon' | 'workshop' | 'seminar' | 'competition';
  organizer: string | Organizer; // Updated to handle both string and object
  image?: string;
  capacity: number;
  registered: number;
}

const CalendarComponent: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchEvents();
  }, []);

  // Helper function to get organizer display name
  const getOrganizerName = (organizer: string | Organizer): string => {
    if (typeof organizer === 'string') {
      return organizer;
    }
    
    // If organizer is an object with a name property
    if (organizer && typeof organizer === 'object' && 'name' in organizer) {
      return organizer.name;
    }
    
    return 'Unknown Organizer';
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/events');
      console.log('Fetched events:', response.data);
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
      setLoading(false);
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'hackathon':
        return '#1976d2'; // Blue
      case 'workshop':
        return '#2e7d32'; // Green
      case 'seminar':
        return '#ed6c02'; // Orange
      case 'competition':
        return '#9c27b0'; // Purple
      default:
        return '#1976d2';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return dateString;
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const calendarEvents = events.map((event, index) => {
    const formattedDate = formatDate(event.date);
    const organizerName = getOrganizerName(event.organizer);
    
    return {
      id: `${event.title}-${formattedDate}-${index}`,
      title: event.title,
      start: formattedDate,
      end: formattedDate,
      allDay: true,
      backgroundColor: getEventColor(event.type),
      borderColor: getEventColor(event.type),
      extendedProps: {
        description: event.description,
        location: event.location,
        type: event.type,
        capacity: event.capacity,
        registered: event.registrations.length,
        organizer: organizerName, // Use the extracted name string
        date: event.date,
        image: event.image || 'https://tse3.mm.bing.net/th?id=OIP.SiVeFrZjOhdaQmcd5NI-CQHaEK&pid=Api&P=0&h=180',
      },
    };
  });
  
  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setOpenDialog(true);
    setIsRegistered(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleRegister = () => {
    setIsRegistered(!isRegistered);
  };

  const handleGetDirections = () => {
    if (selectedEvent && selectedEvent.extendedProps.location) {
      window.open(`https://maps.google.com?q=${encodeURIComponent(selectedEvent.extendedProps.location)}`, '_blank');
    }
  };

  const handleShareEvent = () => {
    if (navigator.share && selectedEvent) {
      navigator.share({
        title: selectedEvent.title,
        text: `Check out this event: ${selectedEvent.title}`,
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying link:', err));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5">Loading calendar...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error" variant="h5">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Event Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all campus events in one place
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ height: 'calc(100vh - 200px)' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          eventContent={(eventInfo) => {
            return (
              <Tooltip title={
                <Box>
                  <Typography variant="subtitle2">{eventInfo.event.title}</Typography>
                  <Typography variant="caption">
                    {eventInfo.event.extendedProps.type}
                  </Typography>
                </Box>
              }>
                <Box sx={{ 
                  padding: '4px',
                  borderRadius: '4px',
                  backgroundColor: eventInfo.event.backgroundColor,
                  color: 'white'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {eventInfo.event.title}
                  </Typography>
                  <Chip 
                    label={eventInfo.event.extendedProps.type}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      height: '20px',
                      fontSize: '0.7rem',
                      marginTop: '2px'
                    }}
                  />
                </Box>
              </Tooltip>
            );
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
          }}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="100%"
          dayMaxEvents={true}
          eventDisplay="block"
          eventDidMount={(info) => {
            console.log('Event mounted:', info.event.title, 'Date:', info.event.start);
          }}
        />
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ 
              p: 0, 
              position: 'relative',
              height: '200px',
              backgroundImage: `url(${selectedEvent.extendedProps.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: 3
              }}>
                <Chip 
                  label={selectedEvent.extendedProps.type.charAt(0).toUpperCase() + selectedEvent.extendedProps.type.slice(1)}
                  sx={{
                    backgroundColor: getEventColor(selectedEvent.extendedProps.type),
                    color: 'white',
                    mb: 1,
                    maxWidth: 'fit-content'
                  }}
                />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {selectedEvent.title}
                </Typography>
              </Box>
              <IconButton 
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  }
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>About this event</Typography>
                  <Typography paragraph>
                    {selectedEvent.extendedProps.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ color: 'primary.main', mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">Date & Time</Typography>
                        <Typography color="text.secondary">
                          {formatDisplayDate(selectedEvent.extendedProps.date)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ color: 'error.main', mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">Location</Typography>
                        <Typography color="text.secondary">
                          {selectedEvent.extendedProps.location}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ color: 'info.main', mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">Organizer</Typography>
                        <Typography color="text.secondary">
                          {/* This is now safe since we've extracted the name in calendarEvents */}
                          {selectedEvent.extendedProps.organizer}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
                    <Typography variant="h6" gutterBottom>Registration</Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: 2 
                    }}>
                      <Typography>Occupied spots</Typography>
                      <Chip 
                        label={`${selectedEvent.extendedProps.registered}/${selectedEvent.extendedProps.capacity}`}
                        color={selectedEvent.extendedProps.registered >= selectedEvent.extendedProps.capacity ? "error" : "success"}
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                      {/* <Button 
                        variant={isRegistered ? "outlined" : "contained"}
                        color={isRegistered ? "error" : "primary"}
                        fullWidth
                        size="large"
                        onClick={handleRegister}
                        disabled={selectedEvent.extendedProps.registered >= selectedEvent.extendedProps.capacity && !isRegistered}
                      >
                        {isRegistered ? "Cancel Registration" : "Register Now"}
                      </Button> */}
                      
                      <Button 
                        variant="outlined" 
                        startIcon={<DirectionsWalk />}
                        onClick={handleGetDirections}
                        fullWidth
                      >
                        Get Directions
                      </Button>
                      
                      <Button 
                        variant="text" 
                        startIcon={<Share />}
                        onClick={handleShareEvent}
                        fullWidth
                      >
                        Share Event
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={handleCloseDialog} 
                color="inherit"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarComponent;