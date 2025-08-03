import express from 'express';
import auth from '../middleware/auth';
import Event from '../models/Event';
import User from '../models/User';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware to check if user can create events
const checkEventCreationPermission = (req: any, res: any, next: any) => {
  const allowedRoles = ['faculty', 'club'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Only faculty and club members can create events' 
    });
  }
  next();
};

// Middleware to check if user is a student
const checkStudentRole = (req: any, res: any, next: any) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can register for events' });
  }
  next();
};

// Create event (protected, only faculty and clubs)
router.post('/', auth, checkEventCreationPermission, async (req: any, res) => {
  try {
    console.log('Creating event with user:', req.user); // Debug log
    const event = new Event({
      ...req.body,
      organizer: req.user._id,
      status: 'upcoming'
    });
    await event.save();
    res.status(201).json(event);
  } catch (error: any) {
    console.error('Event creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all events with registration statistics
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    
    const eventsWithStats = events.map(event => {
      const registrations = event.registrations || [];
      const totalRegistered = registrations.length;
      
      return {
        ...event,
        registered: totalRegistered,
        registrationStats: {
          totalRegistered,
          spotsRemaining: Math.max(0, event.capacity - totalRegistered),
          teamCount: registrations.length,
          isFull: totalRegistered >= event.capacity,
          registrationRate: event.capacity > 0 ? Math.round((totalRegistered / event.capacity) * 100) : 0
        }
      };
    });
    
    res.json(eventsWithStats);
  } catch (error: any) {
    console.error('Events error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add event registration with transaction support
router.post('/:eventId/register', auth, async (req: any, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { teamName, members } = req.body;
    const event = await Event.findById(req.params.eventId).session(session);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check capacity and duplicates in a single query
    const registrationStats = await Event.aggregate([
      { $match: { _id: event._id } },
      { $project: {
        isFull: { $gte: [{ $size: '$registrations' }, '$capacity'] },
        isDuplicate: {
          $or: [
            { $in: [req.user._id, '$registrations.leader'] },
            { $in: [req.user.email, '$registrations.memberEmails'] }
          ]
        }
      }}
    ]).session(session);

    const { isFull, isDuplicate } = registrationStats[0];
    if (isFull) throw new Error('Event is full');
    if (isDuplicate) throw new Error('Already registered');

    // Update event atomically with explicit type checking
    const result = await Event.findByIdAndUpdate(
      event._id,
      {
        $push: {
          registrations: {
            teamName,
            leader: req.user._id,
            memberData: members,
            memberEmails: members.map((m: any) => m.email),
            registeredAt: new Date()
          }
        }
      },
      { new: true, session }
    );

    if (!result) {
      throw new Error('Failed to update event registration');
    }

    await session.commitTransaction();

    // Calculate registration stats after confirming result exists
    const totalRegistered = result.registrations?.length || 0;
    const spotsRemaining = Math.max(0, event.capacity - totalRegistered);

    res.json({
      message: 'Registration successful',
      registrationStats: {
        totalRegistered,
        capacity: event.capacity,
        spotsRemaining
      }
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

router.get('/:eventId/registrations', auth, async (req: any, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('registrations.leader', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const formattedRegistrations = event.registrations.map((reg: any) => ({
      teamName: reg.teamName || 'N/A',
      leaderName: reg.leader?.name || 'N/A',
      leaderEmail: reg.leader?.email || 'N/A',
      members: reg.memberData || [],
      createdAt: reg.registeredAt || new Date(),
      registrationDate: reg.registeredAt || new Date()
    }));

    res.json(formattedRegistrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get live registration statistics
router.get('/:eventId/stats', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = event.registrations || [];
    const totalRegistered = registrations.length;
    const teamCount = registrations.length;
    const spotsRemaining = event.capacity - totalRegistered;
    const registrationRate = event.capacity > 0 ? (totalRegistered / event.capacity) * 100 : 0;

    res.json({
      eventId: event._id,
      eventTitle: event.title,
      totalRegistered,
      capacity: event.capacity,
      spotsRemaining: Math.max(0, spotsRemaining),
      teamCount,
      registrationRate: Math.round(registrationRate * 100) / 100,
      isFull: totalRegistered >= event.capacity,
      isTeamEvent: event.isTeamEvent,
      teamSize: event.teamSize
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Check if user is registered for an event
router.get('/:eventId/check-registration', auth, async (req: any, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = event.registrations || [];
    const isRegistered = registrations.some(reg => 
      reg.leader.toString() === req.user._id.toString() || 
      (reg.members && reg.members.some(member => member.toString() === req.user._id.toString())) ||
      (reg.memberEmails && reg.memberEmails.includes(req.user.email))
    );

    const userRegistration = registrations.find(reg => 
      reg.leader.toString() === req.user._id.toString() || 
      (reg.members && reg.members.some(member => member.toString() === req.user._id.toString())) ||
      (reg.memberEmails && reg.memberEmails.includes(req.user.email))
    );

    res.json({
      isRegistered,
      registration: userRegistration || null,
      isLeader: userRegistration ? userRegistration.leader.toString() === req.user._id.toString() : false
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;