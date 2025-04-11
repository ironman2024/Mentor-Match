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
  Snackbar
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
    }
  };

  const handleRegisterClick = (event: any) => {
    if (user?.role !== 'student') {
      // Show error message - only students can register
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Events</Typography>
        {canCreateEvent && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Create Event
          </Button>
        )}
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          sx={{ flexGrow: 1 }}
          variant="outlined"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Type"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="hackathon">Hackathon</MenuItem>
            <MenuItem value="workshop">Workshop</MenuItem>
            <MenuItem value="seminar">Seminar</MenuItem>
            <MenuItem value="competition">Competition</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item xs={12} md={6} key={event.id}>
            <Card>
              {event.image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={event.image}
                  alt={event.title}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {event.title}
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {event.description}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box display="flex" alignItems="center">
                    <EventIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <LocationIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">{event.location}</Typography>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <PeopleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {event.registered}/{event.capacity} registered
                    </Typography>
                  </Box>
                  <Chip label={event.type} color="primary" size="small" />
                </Box>
                
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  disabled={event.registered >= event.capacity}
                  onClick={() => handleRegisterClick(event)}
                >
                  Register Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
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
            <TextField
              fullWidth
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={eventForm.date}
              onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Location"
              value={eventForm.location}
              onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventForm.type}
                onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                label="Event Type"
              >
                <MenuItem value="hackathon">Hackathon</MenuItem>
                <MenuItem value="workshop">Workshop</MenuItem>
                <MenuItem value="seminar">Seminar</MenuItem>
                <MenuItem value="competition">Competition</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Capacity"
              type="number"
              value={eventForm.capacity}
              onChange={(e) => setEventForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={eventForm.isTeamEvent}
                  onChange={(e) => setEventForm(prev => ({
                    ...prev,
                    isTeamEvent: e.target.checked
                  }))}
                />
              }
              label="Team Event"
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
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <TeamRegistrationDialog
        open={registrationDialog.open}
        onClose={() => setRegistrationDialog({ open: false, eventId: '', event: null })}
        onSubmit={handleRegistrationSubmit}
        maxTeamSize={registrationDialog.event?.teamSize || 1}
        isTeamEvent={registrationDialog.event?.isTeamEvent || false}
      />
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={notification.type} onClose={() => setNotification(prev => ({ ...prev, open: false }))}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Events;
