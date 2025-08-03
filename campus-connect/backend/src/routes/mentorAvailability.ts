import express from 'express';
import auth from '../middleware/auth';
import MentorAvailability from '../models/MentorAvailability';
import ScheduledSession from '../models/ScheduledSession';

const router = express.Router();

// Get mentor's availability
router.get('/', auth, async (req: any, res) => {
  try {
    const availability = await MentorAvailability.findOne({ mentor: req.user._id });
    res.json(availability || {});
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update mentor's availability
router.put('/', auth, async (req: any, res) => {
  try {
    const { weeklySchedule, exceptions, timezone, maxSessionsPerDay, sessionDuration } = req.body;
    
    const availability = await MentorAvailability.findOneAndUpdate(
      { mentor: req.user._id },
      {
        mentor: req.user._id,
        weeklySchedule,
        exceptions: exceptions || [],
        timezone: timezone || 'UTC',
        maxSessionsPerDay: maxSessionsPerDay || 3,
        sessionDuration: sessionDuration || 60
      },
      { upsert: true, new: true }
    );

    res.json(availability);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get available time slots for a mentor on a specific date
router.get('/:mentorId/slots/:date', auth, async (req, res) => {
  try {
    const { mentorId, date } = req.params;
    const targetDate = new Date(date);
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase().slice(0, 3);
    
    const availability = await MentorAvailability.findOne({ mentor: mentorId });
    if (!availability) {
      return res.json([]);
    }

    // Get day schedule
    const daySchedule = availability.weeklySchedule.find(
      schedule => schedule.day.toLowerCase().startsWith(dayName)
    );
    
    if (!daySchedule) {
      return res.json([]);
    }

    // Check for exceptions
    const exception = availability.exceptions.find(
      exc => exc.date.toDateString() === targetDate.toDateString()
    );

    let timeSlots = daySchedule.timeSlots;
    if (exception) {
      if (!exception.isAvailable) {
        return res.json([]);
      }
      timeSlots = exception.timeSlots?.map(slot => ({ ...slot, isAvailable: true })) || timeSlots;
    }

    // Get existing sessions for the date
    const existingSessions = await ScheduledSession.find({
      mentor: mentorId,
      scheduledDate: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Filter out booked slots
    const availableSlots = timeSlots.filter(slot => {
      if (!slot.isAvailable) return false;
      
      return !existingSessions.some(session => {
        const sessionTime = session.scheduledDate.toTimeString().slice(0, 5);
        return sessionTime === slot.startTime;
      });
    });

    res.json(availableSlots);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;