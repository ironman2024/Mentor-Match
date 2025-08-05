import MentorAvailability from '../models/MentorAvailability';
import MentorshipSession from '../models/MentorshipSession';
import { startOfDay, endOfDay, format, addDays, parseISO } from 'date-fns';

export class SchedulingService {
  static async getAvailableSlots(mentorId: string, date: Date) {
    const availability = await MentorAvailability.findOne({ mentor: mentorId });
    if (!availability) return [];

    const dayName = format(date, 'EEEE').toLowerCase();
    const daySchedule = availability.weeklySchedule.find(s => s.day === dayName);
    if (!daySchedule) return [];

    // Get existing sessions for the date
    const existingSessions = await MentorshipSession.find({
      mentor: mentorId,
      'meetingDetails.scheduledDate': {
        $gte: startOfDay(date),
        $lte: endOfDay(date)
      },
      status: { $in: ['scheduled', 'active'] }
    });

    // Filter available slots
    const availableSlots = daySchedule.timeSlots.filter(slot => {
      if (!slot.isAvailable) return false;
      
      const slotTime = `${format(date, 'yyyy-MM-dd')}T${slot.startTime}`;
      return !existingSessions.some(session => 
        format(session.meetingDetails.scheduledDate, 'HH:mm') === slot.startTime
      );
    });

    return availableSlots;
  }

  static async scheduleSession(sessionData: {
    mentorId: string;
    menteeId: string;
    scheduledDate: Date;
    duration: number;
    topic: string;
    meetingType: 'online' | 'offline';
    location?: string;
  }) {
    // Check if slot is available
    const slots = await this.getAvailableSlots(sessionData.mentorId, sessionData.scheduledDate);
    const requestedTime = format(sessionData.scheduledDate, 'HH:mm');
    
    if (!slots.some(slot => slot.startTime === requestedTime)) {
      throw new Error('Time slot not available');
    }

    const session = new MentorshipSession({
      mentor: sessionData.mentorId,
      mentee: sessionData.menteeId,
      topic: sessionData.topic,
      status: 'scheduled',
      sessionType: 'one-time',
      meetingDetails: {
        scheduledDate: sessionData.scheduledDate,
        duration: sessionData.duration,
        meetingType: sessionData.meetingType,
        location: sessionData.location
      }
    });

    return await session.save();
  }
}