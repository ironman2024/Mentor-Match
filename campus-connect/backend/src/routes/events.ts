import express from 'express';
import auth from '../middleware/auth';
import Event from '../models/Event';
import User from '../models/User';
import Notification from '../models/Notification';

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

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: 1 })
      .populate('organizer', 'name role');
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:eventId/register', auth, checkStudentRole, async (req: any, res) => {
  try {
    const { teamName, members } = req.body;
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    const totalRegistered = event.registrations.reduce(
      (acc, reg) => acc + reg.members.length + 1, 0
    );
    if (totalRegistered >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Validate team size
    if (event.isTeamEvent && members && members.length + 1 > event.teamSize) {
      return res.status(400).json({ 
        message: `Team size cannot exceed ${event.teamSize} members` 
      });
    }

    // Create registration
    const registration = {
      teamName: event.isTeamEvent ? teamName : undefined,
      leader: req.user._id,
      members: members || [],
      registeredAt: new Date()
    };

    event.registrations.push(registration);
    await event.save();

    // Create notification for event organizer
    const notification = new Notification({
      recipient: event.organizer,
      type: 'event_registration',
      title: `New Registration: ${event.title}`,
      message: `${registration.leader.name} has registered ${
        event.isTeamEvent ? `team "${registration.teamName}"` : ''
      } for your event.`,
      relatedEvent: event._id
    });
    
    await notification.save();

    res.status(200).json({ message: 'Successfully registered for event' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:eventId/registrations', auth, async (req: any, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('registrations.leader', 'name email')
      .populate('registrations.members', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event.registrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
