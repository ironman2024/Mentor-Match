import express from 'express';
import auth from '../middleware/auth';
import ScheduledSession from '../models/ScheduledSession';
import MentorAvailability from '../models/MentorAvailability';
import Notification from '../models/Notification';

const router = express.Router();

// Schedule a new session
router.post('/', auth, async (req: any, res) => {
  try {
    const {
      mentorshipRequestId,
      mentorId,
      scheduledDate,
      duration = 60,
      meetingType,
      meetingLink,
      location,
      agenda
    } = req.body;

    // Check mentor availability
    const availability = await MentorAvailability.findOne({ mentor: mentorId });
    if (!availability) {
      return res.status(400).json({ message: 'Mentor availability not set' });
    }

    // Check if slot is available
    const targetDate = new Date(scheduledDate);
    const timeSlot = targetDate.toTimeString().slice(0, 5);
    
    const existingSession = await ScheduledSession.findOne({
      mentor: mentorId,
      scheduledDate: targetDate,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingSession) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const session = new ScheduledSession({
      mentorshipRequest: mentorshipRequestId,
      mentor: mentorId,
      mentee: req.user._id,
      scheduledDate: targetDate,
      duration,
      meetingType,
      meetingLink,
      location,
      agenda
    });

    await session.save();

    // Create notification for mentor
    await Notification.create({
      recipient: mentorId,
      type: 'session_scheduled',
      title: 'New Session Scheduled',
      message: `A new mentorship session has been scheduled with ${req.user.name}`,
      read: false
    });

    res.status(201).json({ message: 'Session scheduled successfully', session });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's scheduled sessions
router.get('/my-sessions', auth, async (req: any, res) => {
  try {
    const { status, upcoming = true } = req.query;
    
    let query: any = {
      $or: [
        { mentor: req.user._id },
        { mentee: req.user._id }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
    }

    const sessions = await ScheduledSession.find(query)
      .populate('mentor', 'name avatar email')
      .populate('mentee', 'name avatar email')
      .populate('mentorshipRequest', 'requestType focusAreas')
      .sort({ scheduledDate: 1 });

    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update session status
router.patch('/:sessionId/status', auth, async (req: any, res) => {
  try {
    const { status, notes } = req.body;
    const session = await ScheduledSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is participant
    if (session.mentor.toString() !== req.user._id.toString() && 
        session.mentee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = status;
    if (notes) session.notes = notes;
    await session.save();

    // Create notification for the other participant
    const otherParticipant = session.mentor.toString() === req.user._id.toString() 
      ? session.mentee 
      : session.mentor;

    await Notification.create({
      recipient: otherParticipant,
      type: 'session_updated',
      title: 'Session Status Updated',
      message: `Session status updated to ${status}`,
      read: false
    });

    res.json({ message: 'Session updated successfully', session });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Reschedule session
router.patch('/:sessionId/reschedule', auth, async (req: any, res) => {
  try {
    const { newDate, reason } = req.body;
    const session = await ScheduledSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is participant
    if (session.mentor.toString() !== req.user._id.toString() && 
        session.mentee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add to reschedule history
    session.rescheduleHistory.push({
      originalDate: session.scheduledDate,
      newDate: new Date(newDate),
      reason,
      rescheduledBy: req.user._id,
      rescheduledAt: new Date()
    });

    session.scheduledDate = new Date(newDate);
    session.status = 'rescheduled';
    await session.save();

    // Create notification for the other participant
    const otherParticipant = session.mentor.toString() === req.user._id.toString() 
      ? session.mentee 
      : session.mentor;

    await Notification.create({
      recipient: otherParticipant,
      type: 'session_rescheduled',
      title: 'Session Rescheduled',
      message: `Your session has been rescheduled to ${new Date(newDate).toLocaleString()}`,
      read: false
    });

    res.json({ message: 'Session rescheduled successfully', session });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Submit session feedback
router.post('/:sessionId/feedback', auth, async (req: any, res) => {
  try {
    const { feedback, rating } = req.body;
    const session = await ScheduledSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is participant
    if (session.mentor.toString() !== req.user._id.toString() && 
        session.mentee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const isMentor = session.mentor.toString() === req.user._id.toString();
    
    if (!session.feedback) {
      session.feedback = {
        mentorFeedback: '',
        menteeFeedback: '',
        mentorRating: 0,
        menteeRating: 0
      };
    }

    if (isMentor) {
      session.feedback.mentorFeedback = feedback;
      session.feedback.mentorRating = rating;
    } else {
      session.feedback.menteeFeedback = feedback;
      session.feedback.menteeRating = rating;
    }

    await session.save();

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;