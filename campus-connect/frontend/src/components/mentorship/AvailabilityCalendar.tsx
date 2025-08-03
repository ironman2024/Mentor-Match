import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box
} from '@mui/material';

interface AvailabilityCalendarProps {
  availability: {
    weeklySchedule: Array<{
      day: string;
      timeSlots: Array<{
        startTime: string;
        endTime: string;
        isAvailable: boolean;
      }>;
    }>;
  };
  readOnly?: boolean;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  readOnly = true
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = Array.from({ length: 12 }, (_, i) => 
    `${String(i + 9).padStart(2, '0')}:00`
  );

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            {days.map(day => (
              <TableCell key={day} align="center">{day}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map(time => (
            <TableRow key={time}>
              <TableCell>{time}</TableCell>
              {days.map(day => {
                const slot = availability?.weeklySchedule
                  ?.find(s => s.day.toLowerCase() === day.toLowerCase())
                  ?.timeSlots.find(t => t.startTime === time);
                
                return (
                  <TableCell 
                    key={`${day}-${time}`} 
                    align="center"
                    sx={{
                      bgcolor: slot?.isAvailable ? 'success.light' : 'error.light',
                      opacity: 0.7
                    }}
                  >
                    {slot?.isAvailable ? '✓' : '✗'}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AvailabilityCalendar;
