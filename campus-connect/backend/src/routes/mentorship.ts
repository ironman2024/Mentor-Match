import express from 'express';
import auth from '../middleware/auth';
import MentorshipSession from '../models/MentorshipSession';
import Notification from '../models/Notification';
import Chat from '../models/Chat';
import Message from '../models/Message';
import User, { IUser } from '../models/User';
import UserAchievement from '../models/UserAchievement';
import Badge from '../models/Badge';
import { BadgeService } from '../services/BadgeService';
import { AchievementTrackingService } from '../services/AchievementTrackingService';
import LeaderboardService from '../services/LeaderboardService';
import mongoose, { Document, Types } from 'mongoose';
import multer from 'multer';
import path from 'path';
import { io } from '../index';

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/resumes'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const valid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    cb(null, valid);
  }
});

const router = express.Router();

// Test route to verify basic functionality
router.get('/test', (req, res) => {
  res.json({ message: 'Mentorship routes are working' });
});

// Test route with auth
router.get('/test-auth', auth, (req: any, res) => {
  res.json({ message: 'Auth is working', user: req.user._id });
});

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
    }).populate('mentee', 'name avatar email department skills');

    console.log('Fetched requests:', requests); // Debug log
    res.json(requests);
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Minimal test route
router.patch('/requests/:id', (req: any, res) => {
  res.json({ success: true, message: 'Route working' });
});

// Working route with database operations
router.patch('/requests/:id/update', auth, async (req: any, res) => {
  try {
    const { status } = req.body;
    const sessionId = req.params.id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const session = await MentorshipSession.findByIdAndUpdate(
      sessionId,
      { status },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (session.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let chat = null;
    
    // Create initial message and notification if accepted
    if (status === 'accepted') {
      // Create initial welcome message from mentor to mentee
      const domain = session.requestDetails?.domain || 'General';
      const specificHelp = session.requestDetails?.specificHelp || 'mentorship';
      
      const welcomeMessage = await Message.create({
        sender: session.mentor,
        recipient: session.mentee,
        content: `Hi! I've accepted your ${domain} mentorship request. I'm excited to help you with ${specificHelp.toLowerCase()}. Let's schedule our first session soon!`,
        read: false
      });

      await welcomeMessage.populate('sender', 'name avatar');
      chat = { _id: welcomeMessage._id, message: welcomeMessage };

      // Send real-time message via socket.io
      if (io) {
        io.to(session.mentee.toString()).emit('new_message', welcomeMessage);
      }

      // Create notification for mentee
      await Notification.create({
        recipient: session.mentee,
        type: 'mentorship_accepted',
        title: 'Mentorship Request Accepted!',
        message: 'Your mentorship request has been accepted. You can now start chatting with your mentor.',
        read: false
      });
    } else {
      // Create notification for rejection
      await Notification.create({
        recipient: session.mentee,
        type: 'mentorship_rejected',
        title: 'Mentorship Request Declined',
        message: 'Your mentorship request has been declined. Don\'t worry, there are many other mentors available!',
        read: false
      });
    }

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      chat: chat ? { _id: chat._id } : null,
      nextStep: status === 'accepted' ? 'chat' : null
    });

  } catch (error: any) {
    res.status(500).json({
      message: 'Database error',
      error: error.message
    });
  }
});

router.post('/request', auth, async (req: any, res) => {
  try {
    const { mentorId, topic, message, domain, projectDescription, specificHelp, timeCommitment, preferredMeetingType } = req.body;
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
      requestDetails: {
        domain: domain || 'General',
        projectDescription,
        specificHelp: specificHelp || message,
        studentMessage: message,
        timeCommitment,
        preferredMeetingType: preferredMeetingType || 'online'
      },
      meetingDetails: {
        scheduledDate: new Date(),
        duration: 60,
        meetingType: preferredMeetingType || 'online'
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

      // Track collaboration achievement for mentor
      await BadgeService.processUserActivity(session.mentor._id.toString(), {
        type: 'mentorship_session',
        value: 1,
        metadata: { menteeId: session.mentee._id.toString() }
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

// Rate mentor endpoint
router.post('/rate/:mentorId', auth, async (req: any, res) => {
  try {
    const { mentorId } = req.params;
    const { rating, comment } = req.body;  // Get comment from request body

    // Verify mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Get existing session to verify student can rate
    const session = await MentorshipSession.findOne({
      mentor: mentorId,
      mentee: req.user._id,
      status: 'completed'
    });

    if (!session) {
      return res.status(403).json({ 
        message: 'You can only rate mentors after completing a mentorship session' 
      });
    }

    // Update mentor's rating
    const newRating = (mentor.mentorRating * mentor.totalRatings + rating) / (mentor.totalRatings + 1);
    mentor.mentorRating = Number(newRating.toFixed(1));
    mentor.totalRatings += 1;
    
    await mentor.save();
    
    // Update session with feedback including comment
    session.feedback = {
      menteeFeedback: {
        rating,
        comment: comment || '', // Default to empty string if no comment provided
        givenAt: new Date()
      }
    };
    await session.save();

    // Track mentorship achievement for mentor
    await BadgeService.processUserActivity(mentorId, {
      type: 'mentorship_session',
      value: 1,
      metadata: { sessionId: session._id.toString(), rating }
    });

    // Process mentorship activity for badge checking
    await BadgeService.processUserActivity(mentorId, {
      type: 'mentorship_session',
      value: 1,
      metadata: { rating }
    });

    res.json({ 
      message: 'Rating submitted successfully',
      newRating: mentor.mentorRating
    });

  } catch (error: any) {
    console.error('Error rating mentor:', error);
    res.status(500).json({ 
      message: 'Failed to submit rating',
      error: error.message 
    });
  }
});

// Setup mentor profile (for alumni and faculty)
router.post('/setup-profile', auth, upload.single('resume'), async (req: any, res) => {
  try {
    const { areasOfExpertise, skills, experiences, projects, bio, linkedin, github } = req.body;
    
    // Check if user is alumni or faculty
    if (req.user.role !== 'alumni' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Only alumni and faculty can set up mentor profiles' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse skills if it's a string
    let parsedSkills = [];
    if (typeof skills === 'string') {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        parsedSkills = skills.split(',').map((s: string) => s.trim());
      }
    } else if (Array.isArray(skills)) {
      parsedSkills = skills;
    }

    // Parse areas of expertise
    let parsedAreas = [];
    if (typeof areasOfExpertise === 'string') {
      try {
        parsedAreas = JSON.parse(areasOfExpertise);
      } catch (e) {
        parsedAreas = areasOfExpertise.split(',').map((s: string) => s.trim());
      }
    } else if (Array.isArray(areasOfExpertise)) {
      parsedAreas = areasOfExpertise;
    }

    // Format skills for the schema
    const formattedSkills = parsedSkills.map((skill: any) => {
      if (typeof skill === 'string') {
        return {
          name: skill,
          proficiency: 3, // Default proficiency
          endorsements: []
        };
      }
      return skill;
    });

    // Parse experiences
    let parsedExperiences = [];
    if (experiences) {
      try {
        parsedExperiences = typeof experiences === 'string' ? JSON.parse(experiences) : experiences;
      } catch (e) {
        console.error('Error parsing experiences:', e);
      }
    }

    // Parse projects
    let parsedProjects = [];
    if (projects) {
      try {
        parsedProjects = typeof projects === 'string' ? JSON.parse(projects) : projects;
      } catch (e) {
        console.error('Error parsing projects:', e);
      }
    }

    // Update user profile
    const updateData: any = {
      mentorshipAvailability: true,
      areasOfExpertise: parsedAreas,
      skills: formattedSkills,
      experiences: parsedExperiences,
      projects: parsedProjects
    };

    // Add optional fields if provided
    if (bio) updateData.bio = bio;
    if (linkedin) updateData.linkedin = linkedin;
    if (github) updateData.github = github;

    // Add resume if uploaded
    if (req.file) {
      updateData.resume = `/uploads/resumes/${req.file.filename}`;
    }

    await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    res.json({ 
      message: 'Mentor profile setup completed successfully',
      resumeUploaded: !!req.file,
      profileComplete: true
    });

  } catch (error: any) {
    console.error('Mentor profile setup error:', error);
    res.status(500).json({ 
      message: 'Error setting up mentor profile',
      error: error.message 
    });
  }
});

// Get all available mentors
router.get('/mentors', auth, async (req, res) => {
  try {
    const mentors = await User.find({
      role: { $in: ['alumni', 'faculty'] },
      mentorshipAvailability: true
    })
    .select('name email avatar bio resume areasOfExpertise skills mentorRating totalRatings role department yearOfGraduation linkedin github experiences projects')
    .lean();

    // Format the response
    const formattedMentors = mentors.map(mentor => ({
      ...mentor,
      skills: mentor.skills?.map((skill: any) => 
        typeof skill === 'object' ? skill.name : skill
      ) || [],
      rating: mentor.mentorRating || 0,
      totalRatings: mentor.totalRatings || 0
    }));

    res.json(formattedMentors);
  } catch (error: any) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ 
      message: 'Error fetching mentors',
      error: error.message 
    });
  }
});

// Get mentor profile by ID
router.get('/mentor/:id', auth, async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id)
      .select('name email avatar bio resume areasOfExpertise skills mentorRating totalRatings role department yearOfGraduation linkedin github experiences projects')
      .lean();

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    if (mentor.role !== 'alumni' && mentor.role !== 'faculty') {
      return res.status(400).json({ message: 'User is not a mentor' });
    }

    // Format the response
    const formattedMentor = {
      ...mentor,
      skills: mentor.skills?.map((skill: any) => 
        typeof skill === 'object' ? skill.name : skill
      ) || [],
      rating: mentor.mentorRating || 0,
      totalRatings: mentor.totalRatings || 0
    };

    res.json(formattedMentor);
  } catch (error: any) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ 
      message: 'Error fetching mentor profile',
      error: error.message 
    });
  }
});

// Get mentorship-related badges
router.get('/badges', auth, async (req: any, res) => {
  try {
    const mentorshipBadges = await Badge.find({ category: 'mentorship' }).sort({ rarity: 1 });
    const userAchievement = await UserAchievement.findOne({ user: req.user._id });
    
    const badgesWithProgress = await Promise.all(
      mentorshipBadges.map(async (badge) => {
        const earned = userAchievement?.badges.find(b => b.badge.toString() === badge._id.toString());
        const progress = await BadgeService.getBadgeProgress(req.user._id, badge._id.toString());
        return {
          ...badge.toObject(),
          earned: !!earned,
          earnedAt: earned?.earnedAt,
          progress: progress?.progress || 0
        };
      })
    );
    
    res.json(badgesWithProgress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentorship leaderboard
router.get('/leaderboard', auth, async (req: any, res) => {
  try {
    const { period = 'all-time', limit = 20 } = req.query;
    const leaderboard = await LeaderboardService.getLeaderboard(
      'mentorship',
      period as string,
      parseInt(limit as string)
    );
    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's mentorship achievements
router.get('/achievements', auth, async (req: any, res) => {
  try {
    const userAchievement = await UserAchievement.findOne({ user: req.user._id })
      .populate('badges.badge');
    
    const mentorshipAchievements = userAchievement?.badges.filter(b => {
      const badge = b.badge as any;
      return badge?.category === 'mentorship';
    }) || [];
    
    res.json({
      achievements: mentorshipAchievements,
      mentorshipScore: userAchievement?.mentorshipScore || 0,
      totalPoints: userAchievement?.totalPoints || 0
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's mentorship rank
router.get('/rank', auth, async (req: any, res) => {
  try {
    const rank = await LeaderboardService.getUserRank(req.user._id, 'mentorship');
    res.json(rank || { rank: null, score: 0 });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
