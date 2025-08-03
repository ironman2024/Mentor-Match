import express from 'express';
import auth from '../middleware/auth';
import EnhancedMentorshipService from '../services/EnhancedMentorshipService';
import MentorAvailability from '../models/MentorAvailability';
import MentorReview from '../models/MentorReview';
import MentorshipHistory from '../models/MentorshipHistory';
import MentorshipRequest from '../models/MentorshipRequest';
import ScheduledSession from '../models/ScheduledSession';
import User from '../models/User';
import Notification from '../models/Notification';

const router = express.Router();

// Enhanced mentor discovery with advanced filtering
router.get('/discover', auth, async (req: any, res) => {
  try {
    const filters = {
      skills: req.query.skills ? req.query.skills.split(',') : undefined,
      expertise: req.query.expertise ? req.query.expertise.split(',') : undefined,
      department: req.query.department,
      minRating: req.query.minRating ? parseFloat(req.query.minRating) : undefined,
      availability: req.query.availability,
      sessionType: req.query.sessionType,
      location: req.query.location,
      experience: req.query.experience ? parseInt(req.query.experience) : undefined,
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 12
    };

    const mentors = await EnhancedMentorshipService.discoverMentors(filters);
    
    res.json({
      mentors,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        hasMore: mentors.length === filters.limit
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentor's detailed availability calendar
router.get('/mentor/:mentorId/calendar', auth, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { month, year } = req.query;
    
    const targetDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    
    const [availability, bookedSessions] = await Promise.all([
      MentorAvailability.findOne({ mentor: mentorId }),
      ScheduledSession.find({
        mentor: mentorId,
        scheduledDate: {
          $gte: targetDate,
          $lte: nextMonth
        },
        status: { $in: ['scheduled', 'confirmed'] }
      }).select('scheduledDate duration')
    ]);

    if (!availability) {
      return res.json({ calendar: [], availability: null });
    }

    // Generate calendar with availability
    const calendar = [];
    const currentDate = new Date(targetDate);
    
    while (currentDate <= nextMonth) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = availability.weeklySchedule.find(s => s.day === dayName);
      
      const dayBookings = bookedSessions.filter(session => 
        session.scheduledDate.toDateString() === currentDate.toDateString()
      );

      const availableSlots = daySchedule?.timeSlots.filter(slot => {
        if (!slot.isAvailable) return false;
        return !dayBookings.some(booking => 
          booking.scheduledDate.toTimeString().slice(0, 5) === slot.startTime
        );
      }) || [];

      calendar.push({
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek: dayName,
        availableSlots: availableSlots.length,
        bookedSlots: dayBookings.length,
        slots: daySchedule?.timeSlots || [],
        bookings: dayBookings
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      calendar,
      availability: {
        timezone: availability.timezone,
        maxSessionsPerDay: availability.maxSessionsPerDay,
        sessionDuration: availability.sessionDuration
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Enhanced session scheduling
router.post('/schedule-session', auth, async (req: any, res) => {
  try {
    const sessionData = {
      ...req.body,
      menteeId: req.user._id,
      scheduledDate: new Date(req.body.scheduledDate)
    };

    const result = await EnhancedMentorshipService.scheduleEnhancedSession(sessionData);
    
    res.status(201).json({
      message: 'Session scheduled successfully',
      ...result
    });
  } catch (error: any) {
    if (error.message.includes('conflicts detected')) {
      res.status(409).json({ 
        message: error.message,
        type: 'conflict'
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Get comprehensive mentorship analytics
router.get('/analytics', auth, async (req: any, res) => {
  try {
    const role = req.query.role || 'mentee';
    const analytics = await EnhancedMentorshipService.getComprehensiveAnalytics(req.user._id, role);
    
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Smart mentorship request with enhanced matching
router.post('/smart-request', auth, async (req: any, res) => {
  try {
    const {
      mentorId,
      requestType,
      focusAreas,
      duration,
      preferredMeetingMode,
      message,
      expectedOutcomes,
      urgency,
      preferredSchedule
    } = req.body;

    // Create enhanced mentorship request
    const request = new MentorshipRequest({
      mentee: req.user._id,
      mentor: mentorId,
      requestType,
      focusAreas,
      duration,
      preferredMeetingMode,
      message,
      expectedOutcomes,
      urgency,
      preferredSchedule,
      status: 'pending'
    });

    // Calculate match score
    const mentor = await User.findById(mentorId);
    if (mentor) {
      request.matchScore = EnhancedMentorshipService.calculateEnhancedMatchScore(mentor, {
        skills: focusAreas,
        expertise: focusAreas
      });
    }

    await request.save();

    // Create notification with enhanced details
    await Notification.create({
      recipient: mentorId,
      type: 'mentorship_request',
      title: 'New Mentorship Request',
      message: `${req.user.name} sent you a ${requestType} mentorship request`,
      relatedEvent: request._id,
      read: false
    });

    res.status(201).json({
      message: 'Mentorship request sent successfully',
      requestId: request._id,
      matchScore: request.matchScore
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentor expertise showcase
router.get('/mentor/:mentorId/expertise', auth, async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    const [mentor, reviews, history, sessions] = await Promise.all([
      User.findById(mentorId).select('name areasOfExpertise skills experiences projects portfolio'),
      MentorReview.find({ mentor: mentorId, status: 'active' })
        .populate('mentee', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      MentorshipHistory.find({ mentor: mentorId, status: 'completed' })
        .select('outcomes tags')
        .limit(10),
      ScheduledSession.countDocuments({ mentor: mentorId, status: 'completed' })
    ]);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Analyze expertise areas
    const expertiseAnalysis = mentor.areasOfExpertise.map((area: any) => {
      const relatedReviews = reviews.filter(review => 
        review.review.toLowerCase().includes(area.name.toLowerCase())
      );
      
      const relatedHistory = history.filter(h => 
        h.outcomes?.skillsImproved?.includes(area.name) ||
        h.tags?.includes(area.name)
      );

      return {
        ...area,
        mentorshipCount: relatedHistory.length,
        averageRating: relatedReviews.length > 0 
          ? relatedReviews.reduce((sum, r) => sum + r.rating, 0) / relatedReviews.length 
          : 0,
        testimonials: relatedReviews.slice(0, 2)
      };
    });

    // Get skill endorsements
    const skillEndorsements = mentor.skills.map((skill: any) => ({
      ...skill,
      endorsementCount: skill.endorsements?.length || 0
    }));

    res.json({
      mentor: {
        name: mentor.name,
        bio: mentor.bio
      },
      expertise: expertiseAnalysis,
      skills: skillEndorsements,
      experience: mentor.experiences,
      projects: mentor.projects,
      portfolio: mentor.portfolio,
      stats: {
        completedSessions: sessions,
        totalMentorships: history.length,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Enhanced review system with detailed categories
router.post('/review/detailed', auth, async (req: any, res) => {
  try {
    const {
      mentorId,
      sessionId,
      rating,
      review,
      categories,
      tags,
      wouldRecommend,
      isAnonymous = false
    } = req.body;

    // Check if review already exists
    const existingReview = await MentorReview.findOne({
      mentor: mentorId,
      mentee: req.user._id,
      session: sessionId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted' });
    }

    const newReview = new MentorReview({
      mentor: mentorId,
      mentee: req.user._id,
      session: sessionId,
      rating,
      review,
      categories,
      isAnonymous
    });

    await newReview.save();

    // Update mentor's rating
    const mentor = await User.findById(mentorId);
    if (mentor) {
      const newRating = (mentor.mentorRating * mentor.totalRatings + rating) / (mentor.totalRatings + 1);
      mentor.mentorRating = Number(newRating.toFixed(1));
      mentor.totalRatings += 1;
      await mentor.save();
    }

    // Update mentorship history if exists
    const history = await MentorshipHistory.findOne({
      mentor: mentorId,
      mentee: req.user._id,
      status: { $in: ['active', 'completed'] }
    });

    if (history) {
      if (tags) {
        history.tags = [...new Set([...history.tags, ...tags])];
      }
      await history.save();
    }

    res.status(201).json({
      message: 'Detailed review submitted successfully',
      review: newReview
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentorship history with detailed tracking
router.get('/history/detailed', auth, async (req: any, res) => {
  try {
    const role = req.query.role || 'mentee';
    const status = req.query.status;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const matchQuery: any = role === 'mentor' 
      ? { mentor: req.user._id } 
      : { mentee: req.user._id };

    if (status) {
      matchQuery.status = status;
    }

    const [history, total] = await Promise.all([
      MentorshipHistory.find(matchQuery)
        .populate('mentor', 'name avatar email')
        .populate('mentee', 'name avatar email')
        .populate('mentorshipRequest', 'requestType focusAreas')
        .sort({ startDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      MentorshipHistory.countDocuments(matchQuery)
    ]);

    // Enhance with additional data
    const enhancedHistory = await Promise.all(
      history.map(async (h) => {
        const [sessions, reviews] = await Promise.all([
          ScheduledSession.find({
            mentor: h.mentor._id,
            mentee: h.mentee._id
          }).select('scheduledDate status duration'),
          MentorReview.find({
            mentor: h.mentor._id,
            mentee: h.mentee._id
          }).select('rating createdAt')
        ]);

        return {
          ...h.toObject(),
          sessions: sessions.length,
          completedSessions: sessions.filter(s => s.status === 'completed').length,
          totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
          lastSession: sessions.length > 0 ? sessions[sessions.length - 1].scheduledDate : null,
          reviewCount: reviews.length
        };
      })
    );

    res.json({
      history: enhancedHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update mentor availability with smart scheduling
router.put('/availability/smart', auth, async (req: any, res) => {
  try {
    const {
      weeklySchedule,
      exceptions,
      timezone,
      maxSessionsPerDay,
      sessionDuration,
      bufferTime,
      autoAcceptBookings
    } = req.body;

    const availability = await MentorAvailability.findOneAndUpdate(
      { mentor: req.user._id },
      {
        mentor: req.user._id,
        weeklySchedule,
        exceptions: exceptions || [],
        timezone: timezone || 'UTC',
        maxSessionsPerDay: maxSessionsPerDay || 3,
        sessionDuration: sessionDuration || 60,
        bufferTime: bufferTime || 15,
        autoAcceptBookings: autoAcceptBookings || false
      },
      { upsert: true, new: true }
    );

    // Calculate availability statistics
    const totalSlots = weeklySchedule.reduce((sum: number, day: any) => 
      sum + day.timeSlots.filter((slot: any) => slot.isAvailable).length, 0
    );

    const nextAvailableSlot = await EnhancedMentorshipService.getNextAvailableSlot(req.user._id);

    res.json({
      availability,
      stats: {
        totalWeeklySlots: totalSlots,
        nextAvailableSlot
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentor dashboard with enhanced metrics
router.get('/dashboard/enhanced', auth, async (req: any, res) => {
  try {
    const [stats, recentActivity, upcomingSessions, pendingRequests] = await Promise.all([
      EnhancedMentorshipService.getOverallStats(req.user._id, 'mentor'),
      MentorshipHistory.find({ mentor: req.user._id })
        .populate('mentee', 'name avatar')
        .sort({ updatedAt: -1 })
        .limit(5),
      ScheduledSession.find({
        mentor: req.user._id,
        scheduledDate: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      })
        .populate('mentee', 'name avatar')
        .sort({ scheduledDate: 1 })
        .limit(5),
      MentorshipRequest.find({
        mentor: req.user._id,
        status: 'pending'
      })
        .populate('mentee', 'name avatar department')
        .sort({ urgency: -1, matchScore: -1 })
        .limit(5)
    ]);

    res.json({
      stats,
      recentActivity,
      upcomingSessions,
      pendingRequests,
      quickActions: {
        availableToday: await EnhancedMentorshipService.getNextAvailableSlot(req.user._id),
        pendingReviews: await MentorReview.countDocuments({ 
          mentor: req.user._id, 
          status: 'active' 
        })
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;