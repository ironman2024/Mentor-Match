import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Grid, Card, CardContent, IconButton,
  List, ListItem, ListItemText, Avatar, Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { apiService } from '../../services/apiService';

interface AvailabilitySlot {
  _id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  date?: string;
}

interface Session {
  _id: string;
  mentee: { name: string; avatar?: string };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

const EnhancedCalendar: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Partial<AvailabilitySlot>>({});
  const [view, setView] = useState<'availability' | 'sessions'>('availability');

  useEffect(() => {
    fetchAvailability();
    fetchSessions();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await apiService.calendar.getAvailability();
      setAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await apiService.sessions.getMySessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleSlotSelect = (selectInfo: any) => {
    setSelectedSlot({
      date: selectInfo.startStr,
      startTime: '09:00',
      endTime: '10:00',
      isRecurring: false,
      dayOfWeek: new Date(selectInfo.start).getDay()
    });
    setOpenDialog(true);
  };

  const handleSaveSlot = async () => {
    try {
      await apiService.calendar.updateAvailability({
        slots: [...availability, selectedSlot]
      });
      fetchAvailability();
      setOpenDialog(false);
      setSelectedSlot({});
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  const getCalendarEvents = () => {
    if (view === 'availability') {
      return availability.map(slot => ({
        id: slot._id,
        title: 'Available',
        start: slot.date ? `${slot.date}T${slot.startTime}` : undefined,
        end: slot.date ? `${slot.date}T${slot.endTime}` : undefined,
        daysOfWeek: slot.isRecurring ? [slot.dayOfWeek] : undefined,
        startTime: slot.isRecurring ? slot.startTime : undefined,
        endTime: slot.isRecurring ? slot.endTime : undefined,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50'
      }));
    } else {
      return sessions.map(session => ({
        id: session._id,
        title: `Session with ${session.mentee.name}`,
        start: `${session.date}T${session.startTime}`,
        end: `${session.date}T${session.endTime}`,
        backgroundColor: session.status === 'confirmed' ? '#2196F3' : '#FF9800',
        borderColor: session.status === 'confirmed' ? '#2196F3' : '#FF9800'
      }));
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Calendar Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={view === 'availability' ? 'contained' : 'outlined'}
            onClick={() => setView('availability')}
          >
            Availability
          </Button>
          <Button
            variant={view === 'sessions' ? 'contained' : 'outlined'}
            onClick={() => setView('sessions')}
          >
            Sessions
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={getCalendarEvents()}
            selectable={view === 'availability'}
            select={handleSlotSelect}
            height="600px"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {view === 'availability' ? 'Availability Slots' : 'Upcoming Sessions'}
              </Typography>
              
              {view === 'availability' ? (
                <Box>
                  <Chip label={`${availability.length} slots`} color="primary" sx={{ mb: 2 }} />
                  <List>
                    {availability.slice(0, 5).map((slot, index) => (
                      <ListItem key={index} dense>
                        <ListItemText
                          primary={`${slot.startTime} - ${slot.endTime}`}
                          secondary={slot.isRecurring ? 'Weekly' : slot.date}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <List>
                  {sessions.slice(0, 5).map((session) => (
                    <ListItem key={session._id} dense>
                      <Avatar src={session.mentee.avatar} sx={{ width: 32, height: 32, mr: 1 }}>
                        {session.mentee.name[0]}
                      </Avatar>
                      <ListItemText
                        primary={session.mentee.name}
                        secondary={`${session.date} ${session.startTime}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Availability Slot</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Start Time"
            type="time"
            value={selectedSlot.startTime || ''}
            onChange={(e) => setSelectedSlot({...selectedSlot, startTime: e.target.value})}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="End Time"
            type="time"
            value={selectedSlot.endTime || ''}
            onChange={(e) => setSelectedSlot({...selectedSlot, endTime: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Recurring"
            value={selectedSlot.isRecurring ? 'yes' : 'no'}
            onChange={(e) => setSelectedSlot({...selectedSlot, isRecurring: e.target.value === 'yes'})}
          >
            <MenuItem value="no">One-time</MenuItem>
            <MenuItem value="yes">Weekly recurring</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSlot} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EnhancedCalendar;