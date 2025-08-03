import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, IconButton, Tooltip, Alert, Snackbar
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
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

const EnhancedAvailabilityCalendar: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Partial<AvailabilitySlot>>({});
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await apiService.calendar.getAvailability();
      setAvailability(response.data);
    } catch (error) {
      showNotification('Error fetching availability', 'error');
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
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const slot = availability.find(s => s._id === clickInfo.event.id);
    if (slot) {
      setSelectedSlot(slot);
      setEditMode(true);
      setOpenDialog(true);
    }
  };

  const handleSaveSlot = async () => {
    try {
      const updatedSlots = editMode 
        ? availability.map(slot => slot._id === selectedSlot._id ? selectedSlot : slot)
        : [...availability, selectedSlot];
      
      await apiService.calendar.updateAvailability({ slots: updatedSlots });
      fetchAvailability();
      setOpenDialog(false);
      setSelectedSlot({});
      showNotification(editMode ? 'Slot updated successfully' : 'Slot added successfully', 'success');
    } catch (error) {
      showNotification('Error saving availability', 'error');
    }
  };

  const handleDeleteSlot = async () => {
    if (selectedSlot._id) {
      try {
        await apiService.calendar.deleteSlot(selectedSlot._id);
        fetchAvailability();
        setOpenDialog(false);
        setSelectedSlot({});
        showNotification('Slot deleted successfully', 'success');
      } catch (error) {
        showNotification('Error deleting slot', 'error');
      }
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ open: true, message, type });
  };

  const calendarEvents = availability.map(slot => ({
    id: slot._id,
    title: 'Available',
    start: slot.date ? `${slot.date}T${slot.startTime}` : undefined,
    end: slot.date ? `${slot.date}T${slot.endTime}` : undefined,
    daysOfWeek: slot.isRecurring ? [slot.dayOfWeek] : undefined,
    startTime: slot.isRecurring ? slot.startTime : undefined,
    endTime: slot.isRecurring ? slot.endTime : undefined,
    backgroundColor: slot.isRecurring ? '#4CAF50' : '#2196F3',
    borderColor: slot.isRecurring ? '#4CAF50' : '#2196F3'
  }));

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Availability Management</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip label={`${availability.length} slots`} color="primary" />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedSlot({
                startTime: '09:00',
                endTime: '10:00',
                isRecurring: false,
                dayOfWeek: 1
              });
              setEditMode(false);
              setOpenDialog(true);
            }}
          >
            Add Slot
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Chip size="small" label="One-time" sx={{ backgroundColor: '#2196F3', color: 'white' }} />
        <Chip size="small" label="Recurring" sx={{ backgroundColor: '#4CAF50', color: 'white' }} />
      </Box>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={calendarEvents}
        selectable={true}
        select={handleSlotSelect}
        eventClick={handleEventClick}
        height="600px"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Availability Slot' : 'Add Availability Slot'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Start Time"
            type="time"
            value={selectedSlot.startTime || ''}
            onChange={(e) => setSelectedSlot({...selectedSlot, startTime: e.target.value})}
            sx={{ mt: 2, mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Time"
            type="time"
            value={selectedSlot.endTime || ''}
            onChange={(e) => setSelectedSlot({...selectedSlot, endTime: e.target.value})}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            fullWidth
            label="Type"
            value={selectedSlot.isRecurring ? 'recurring' : 'one-time'}
            onChange={(e) => setSelectedSlot({...selectedSlot, isRecurring: e.target.value === 'recurring'})}
            sx={{ mb: 2 }}
          >
            <MenuItem value="one-time">One-time</MenuItem>
            <MenuItem value="recurring">Weekly recurring</MenuItem>
          </TextField>
          {selectedSlot.isRecurring && (
            <TextField
              select
              fullWidth
              label="Day of Week"
              value={selectedSlot.dayOfWeek || 1}
              onChange={(e) => setSelectedSlot({...selectedSlot, dayOfWeek: Number(e.target.value)})}
              sx={{ mb: 2 }}
            >
              <MenuItem value={1}>Monday</MenuItem>
              <MenuItem value={2}>Tuesday</MenuItem>
              <MenuItem value={3}>Wednesday</MenuItem>
              <MenuItem value={4}>Thursday</MenuItem>
              <MenuItem value={5}>Friday</MenuItem>
              <MenuItem value={6}>Saturday</MenuItem>
              <MenuItem value={0}>Sunday</MenuItem>
            </TextField>
          )}
          {!selectedSlot.isRecurring && (
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={selectedSlot.date || ''}
              onChange={(e) => setSelectedSlot({...selectedSlot, date: e.target.value})}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {editMode && (
            <Button onClick={handleDeleteSlot} color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          )}
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSlot} variant="contained">
            {editMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.type}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default EnhancedAvailabilityCalendar;