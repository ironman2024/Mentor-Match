import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
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

const AvailabilityCalendar: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Partial<AvailabilitySlot>>({});

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await apiService.calendar.getAvailability();
      setAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
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

  const calendarEvents = availability.map(slot => ({
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

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Availability Management</Typography>
        <Chip label={`${availability.length} slots`} color="primary" />
      </Box>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        events={calendarEvents}
        selectable={true}
        select={handleSlotSelect}
        height="600px"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
      />

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

export default AvailabilityCalendar;