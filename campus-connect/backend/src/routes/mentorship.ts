import express from 'express';
import auth from '../middleware/auth';
import MentorshipSession from '../models/MentorshipSession';
import Notification from '../models/Notification';
import Chat from '../models/Chat';
import User, { IUser } from '../models/User';
import mongoose, { Document, Types } from 'mongoose';

const router = express.Router();

// Get mentor dashboard stats
router.get('/stats', auth, async (req: any, res) => {
  try {
    const stats = await MentorshipSession.aggregate([
      { $match: { mentor: req.user._id } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeStudents: { $addToSet: '$mentee' }
        }
      }
    ]);
    res.json(stats[0] || { totalSessions: 0, completedSessions: 0, activeStudents: [] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending mentorship requests
router.get('/requests', auth, async (req: any, res) => {
  try {
    // Verify the user is a faculty member or alumni
    if (req.user.role !== 'faculty' && req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only faculty and alumni members can view mentorship requests' });
    }

    const requests = await MentorshipSession.find({
      mentor: req.user._id,
      status: 'pending'
    }).populate('mentee', 'name avatar email department');

    console.log('Fetched requests:', requests); // Debug log
    res.json(requests);
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update mentorship request status
router.patch('/requests/:id', auth, async (req: any, res) => {
  try {
    const { status } = req.body;
    const sessionId = req.params.id;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find and populate the session
    const session = await MentorshipSession.findById(sessionId)
      .populate('mentor', 'name email _id')
      .populate('mentee', 'name email _id');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify the user is the mentor
    if (session.mentor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = status;
    await session.save();

    let chat = null;
    if (status === 'accepted') {
      chat = await Chat.create({
        participants: [session.mentor._id, session.mentee._id],
        type: 'direct',
        messages: []
      });
    }

    // Create notification
    await Notification.create({
      recipient: session.mentee._id,
      type: status === 'accepted' ? 'mentorship_accepted' : 'mentorship_rejected',
      title: `Mentorship Request ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
      message: `Your mentorship request has been ${status}`,
      read: false
    });

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      chat
    });

  } catch (error: any) {
    console.error('Error updating mentorship request:', error);
    res.status(500).json({
      message: 'Failed to process mentorship request',
      error: error.message
    });
  }
});

router.post('/request', auth, async (req: any, res) => {
  try {
    const { mentorId, topic, message } = req.body;
    const menteeId = req.user._id;

    // Verify mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Create mentorship session
    const session = new MentorshipSession({
      mentor: mentorId,
      mentee: menteeId,
      topic,
      status: 'pending',
      goals: [],
      schedule: {
        startDate: new Date(),
        frequency: 'weekly'
      }
    });

    await session.save();

    // Create notification for mentor
    const notification = new Notification({
      recipient: mentorId,
      type: 'mentorship_request',
      title: 'New Mentorship Request',
      message: `You have a new mentorship request from ${req.user.name}`,
      relatedEvent: session._id,
      read: false
    });

    await notification.save();

    res.status(201).json({ 
      message: 'Mentorship request sent successfully',
      sessionId: session._id 
    });
  } catch (error: any) {
    console.error('Mentorship request error:', error);
    res.status(500).json({ 
      message: 'Error creating mentorship request',
      error: error.message 
    });
  }
});

interface PopulatedMentor {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedSession extends Document {
  mentor: PopulatedMentor;
  mentee: PopulatedMentor;
  status: string;
  topic: string;
}

router.patch('/request/:id/status', auth, async (req: any, res) => {
  try {
    const { status } = req.body;
    const sessionId = req.params.id;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const session = await MentorshipSession.findById(sessionId)
      .populate<{ mentor: PopulatedMentor }>('mentor', 'name email _id')
      .populate<{ mentee: PopulatedMentor }>('mentee', 'name email _id');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user is the mentor
    if (session.mentor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = status;
    await session.save();

    // Create chat if request is accepted
    let chat = null;
    if (status === 'accepted') {
      chat = await Chat.create({
        participants: [session.mentor._id, session.mentee._id],
        type: 'mentorship',
        mentorshipId: session._id,
        messages: []
      });

      // Create notification for acceptance
      await Notification.create({
        recipient: session.mentee._id,
        type: 'mentorship_accepted',
        title: 'Mentorship Request Accepted',
        message: `${session.mentor.name} has accepted your mentorship request`,
        read: false
      });
    } else {
      // Create notification for rejection
      await Notification.create({
        recipient: session.mentee._id,
        type: 'mentorship_rejected',
        title: 'Mentorship Request Declined',
        message: `${session.mentor.name} has declined your mentorship request`,
        read: false
      });
    }

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      chat: chat
    });

  } catch (error: any) {
    console.error('Error updating mentorship request:', error);
    res.status(500).json({
      message: 'Failed to process mentorship request',
      error: error.message
    });
  }
});

export default router;
