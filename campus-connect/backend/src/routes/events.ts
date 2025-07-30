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

// Get all events with registration statistics
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: 1 })
      .populate('organizer', 'name role')
      .populate('registrations.leader', 'name email')
      .populate('registrations.members', 'name email');
    
    // Add registration statistics to each event
    const eventsWithStats = events.map(event => {
      const totalRegistered = event.registrations.reduce(
        (acc, reg) => acc + (reg.memberData?.length || reg.members.length) + 1, 0
      );
      
      return {
        ...event.toObject(),
        registered: totalRegistered, // Add this for frontend compatibility
        registrationStats: {
          totalRegistered,
          spotsRemaining: Math.max(0, event.capacity - totalRegistered),
          teamCount: event.registrations.length,
          isFull: totalRegistered >= event.capacity,
          registrationRate: Math.round((totalRegistered / event.capacity) * 10000) / 100
        }
      };
    });
    
    res.json(eventsWithStats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:eventId/register', auth, async (req: any, res) => {
  try {
    const { teamName, members } = req.body;

    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if user is already registered (prevent duplicate registration)
    const isAlreadyRegistered = event.registrations.some(reg => 
      reg.leader.toString() === req.user._id.toString() || 
      reg.members.some(member => member.toString() === req.user._id.toString())
    );
    
    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Handle member data - store member info directly without creating users
    let memberData = [];
    if (members && Array.isArray(members)) {
      memberData = members.filter(member => member && member.name && member.email);
    }

    // Check if any team members are already registered by email
    for (const member of memberData) {
      const memberAlreadyRegistered = event.registrations.some(reg => {
        // Check if member email matches any existing registration
        const memberEmails = reg.memberEmails || [];
        return memberEmails.includes(member.email);
      });
      if (memberAlreadyRegistered) {
        return res.status(400).json({ 
          message: `Team member ${member.name} is already registered for this event` 
        });
      }
    }

    // Check if event is full
    const totalRegistered = event.registrations.reduce(
      (acc, reg) => acc + (reg.memberData?.length || reg.members.length) + 1, 0
    );
    if (totalRegistered >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Validate team size
    if (event.isTeamEvent && memberData.length + 1 > event.teamSize) {
      return res.status(400).json({ 
        message: `Team size cannot exceed ${event.teamSize} members` 
      });
    }

    const registration = {
      teamName,
      leader: req.user._id,
      members: [], // Keep empty for now
      memberData: memberData, // Store member info directly
      memberEmails: memberData.map(m => m.email), // For duplicate checking
      registeredAt: new Date(),
    };

    event.registrations.push(registration);
    await event.save();

    // Create notification for event organizer
    const notification = new Notification({
      recipient: event.organizer,
      type: 'event_registration',
      title: `New Registration: ${event.title}`,
      message: `${req.user.name} has registered ${
        event.isTeamEvent ? `team "${registration.teamName}"` : ''
      } for your event.`,
      relatedEvent: event._id
    });
    
    await notification.save();

    // Calculate updated registration count
    const updatedCount = event.registrations.reduce(
      (acc, reg) => acc + (reg.memberData?.length || reg.members.length) + 1, 0
    );

    res.status(200).json({ 
      message: 'Successfully registered for event',
      registrationCount: updatedCount,
      capacity: event.capacity,
      spotsRemaining: event.capacity - updatedCount
    });
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

    // Format registrations for frontend compatibility
    const formattedRegistrations = event.registrations.map((reg: any) => ({
      teamName: reg.teamName,
      leaderName: reg.leader?.name || 'N/A',
      leaderEmail: reg.leader?.email || 'N/A',
      members: reg.memberData || reg.members || [],
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

    const totalRegistered = event.registrations.reduce(
      (acc, reg) => acc + (reg.memberData?.length || reg.members.length) + 1, 0
    );
    
    const teamCount = event.registrations.length;
    const spotsRemaining = event.capacity - totalRegistered;
    const registrationRate = (totalRegistered / event.capacity) * 100;

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

    const isRegistered = event.registrations.some(reg => 
      reg.leader.toString() === req.user._id.toString() || 
      reg.members.some(member => member.toString() === req.user._id.toString()) ||
      (reg.memberEmails && reg.memberEmails.includes(req.user.email))
    );

    const userRegistration = event.registrations.find(reg => 
      reg.leader.toString() === req.user._id.toString() || 
      reg.members.some(member => member.toString() === req.user._id.toString()) ||
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