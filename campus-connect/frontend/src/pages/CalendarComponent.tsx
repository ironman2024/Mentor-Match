import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Typography, Chip, Tooltip, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import axios from 'axios';
import { EventNote, LocationOn, People, Info } from '@mui/icons-material';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'hackathon' | 'workshop' | 'seminar' | 'competition';
  organizer: string;
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/events');
      console.log('Fetched events:', response.data); // Debug log
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
        return dateString; // Return original string if invalid
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if error
    }
  };

  const calendarEvents = events
    .map(event => {
      const formattedDate = formatDate(event.date);
      console.log('Processing event:', event.title, 'Date:', formattedDate); // Debug log
      return {
        id: event.id,
        title: event.title,
        start: formattedDate,
        backgroundColor: getEventColor(event.type),
        borderColor: getEventColor(event.type),
        extendedProps: {
          description: event.description,
          location: event.location,
          type: event.type,
          capacity: event.capacity,
          registered: event.registered
        }
      };
    });

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
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
            console.log('Event mounted:', info.event.title, 'Date:', info.event.start); // Debug log
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventNote color="primary" />
                <Typography variant="h6">{selectedEvent.title}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn color="action" sx={{ mr: 1 }} />
                  <Typography>{selectedEvent.extendedProps.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People color="action" sx={{ mr: 1 }} />
                  <Typography>
                    {selectedEvent.extendedProps.registered}/{selectedEvent.extendedProps.capacity} registered
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Info color="action" sx={{ mr: 1 }} />
                  <Typography>{selectedEvent.extendedProps.description}</Typography>
                </Box>
                <Chip 
                  label={selectedEvent.extendedProps.type}
                  sx={{
                    backgroundColor: getEventColor(selectedEvent.extendedProps.type),
                    color: 'white'
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarComponent;