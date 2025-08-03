import MentorAvailability from '../models/MentorAvailability';
import MentorReview from '../models/MentorReview';
import MentorshipHistory from '../models/MentorshipHistory';
import MentorshipRequest from '../models/MentorshipRequest';
import MentorshipSession from '../models/MentorshipSession';
import ScheduledSession from '../models/ScheduledSession';
import User from '../models/User';
import Notification from '../models/Notification';
import { io } from '../index';
import { BadgeService } from './BadgeService';

export class MentorshipService {
  // Get mentor dashboard analytics
  static async getMentorDashboard(mentorId: string) {
    const [stats, recentRequests, upcomingSessions, reviews] = await Promise.all([
      this.getMentorStats(mentorId),
      this.getRecentRequests(mentorId),
      this.getUpcomingSessions(mentorId),
      this.getRecentReviews(mentorId)
    ]);

    return {
      stats,
      recentRequests,
      upcomingSessions,
      reviews
    };
  }

  // Get comprehensive mentor statistics
  static async getMentorStats(mentorId: string) {
    const [historyStats, sessionStats, reviewStats] = await Promise.all([
      MentorshipHistory.aggregate([
        { $match: { mentor: mentorId } },
        {
          $group: {
            _id: null,
            totalMentorships: { $sum: 1 },
            activeMentorships: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            completedMentorships: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalSessions: { $sum: '$totalSessions' },
            completedSessions: { $sum: '$completedSessions' }
          }
        }
      ]),
      ScheduledSession.aggregate([
        { $match: { mentor: mentorId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      MentorReview.aggregate([
        { $match: { mentor: mentorId, status: 'active' } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            avgCommunication: { $avg: '$categories.communication' },
            avgExpertise: { $avg: '$categories.expertise' },
            avgHelpfulness: { $avg: '$categories.helpfulness' },
            avgAvailability: { $avg: '$categories.availability' }
          }
        }
      ])
    ]);

    return {
      mentorships: historyStats[0] || { totalMentorships: 0, activeMentorships: 0, completedMentorships: 0, totalSessions: 0, completedSessions: 0 },
      sessions: sessionStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      reviews: reviewStats[0] || { avgRating: 0, totalReviews: 0, avgCommunication: 0, avgExpertise: 0, avgHelpfulness: 0, avgAvailability: 0 }
    };
  }

  // Get recent mentorship requests
  static async getRecentRequests(mentorId: string, limit = 5) {
    return MentorshipRequest.find({ mentor: mentorId, status: 'pending' })
      .populate('mentee', 'name avatar email department')
      .sort({ urgency: -1, matchScore: -1, createdAt: -1 })
      .limit(limit);
  }

  // Get upcoming sessions
  static async getUpcomingSessions(mentorId: string, limit = 5) {
    return ScheduledSession.find({
      mentor: mentorId,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('mentee', 'name avatar email')
      .sort({ scheduledDate: 1 })
      .limit(limit);
  }

  // Get recent reviews
  static async getRecentReviews(mentorId: string, limit = 5) {
    return MentorReview.find({ mentor: mentorId, status: 'active' })
      .populate('mentee', 'name avatar')
      .populate('session', 'topic')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Smart mentor matching
  static async findMatchingMentors(criteria: {
    focusAreas: string[];
    requestType: string;
    preferredMeetingMode: string;
    department?: string;
    minRating?: number;
  }) {
    let query: any = {
      role: { $in: ['alumni', 'faculty'] },
      mentorshipAvailability: true
    };

    if (criteria.department) {
      query.department = criteria.department;
    }
    if (criteria.minRating) {
      query.mentorRating = { $gte: criteria.minRating };
    }

    const mentors = await User.find(query)
      .select('name email avatar bio areasOfExpertise skills mentorRating totalRatings role department experiences')
      .lean();

    // Calculate match scores and sort
    const mentorsWithScores = mentors.map(mentor => ({
      ...mentor,
      matchScore: this.calculateMatchScore(mentor, criteria)
    })).sort((a, b) => b.matchScore - a.matchScore);

    return mentorsWithScores;
  }

  // Calculate mentor-mentee compatibility score
  static calculateMatchScore(mentor: any, criteria: any): number {
    let score = 0;

    // Expertise alignment (40 points)
    if (mentor.areasOfExpertise && criteria.focusAreas) {
      const expertiseMatch = criteria.focusAreas.some((area: string) =>
        mentor.areasOfExpertise.some((exp: any) => 
          exp.name.toLowerCase().includes(area.toLowerCase()) ||
          area.toLowerCase().includes(exp.name.toLowerCase())
        )
      );
      if (expertiseMatch) score += 40;
    }

    // Skills match (25 points)
    if (mentor.skills && criteria.focusAreas) {
      const skillsMatch = criteria.focusAreas.some((area: string) =>
        mentor.skills.some((skill: any) => 
          skill.name.toLowerCase().includes(area.toLowerCase()) ||
          area.toLowerCase().includes(skill.name.toLowerCase())
        )
      );
      if (skillsMatch) score += 25;
    }

    // Rating bonus (20 points)
    if (mentor.mentorRating >= 4.5) score += 20;
    else if (mentor.mentorRating >= 4) score += 15;
    else if (mentor.mentorRating >= 3.5) score += 10;
    else if (mentor.mentorRating >= 3) score += 5;

    // Experience relevance (10 points)
    if (mentor.experiences && mentor.experiences.length > 0) {
      const relevantExperience = mentor.experiences.some((exp: any) =>
        criteria.focusAreas.some((area: string) =>
          exp.title.toLowerCase().includes(area.toLowerCase()) ||
          exp.description.toLowerCase().includes(area.toLowerCase())
        )
      );
      if (relevantExperience) score += 10;
    }

    // Activity bonus (5 points)
    if (mentor.totalRatings > 10) score += 5;

    return Math.min(score, 100);
  }

  // Schedule session with conflict checking
  static async scheduleSession(data: {
    mentorId: string;
    menteeId: string;
    scheduledDate: Date;
    duration: number;
    meetingType: 'online' | 'offline';
    agenda: string;
    meetingLink?: string;
    location?: string;
  }) {
    // Check for conflicts
    const conflicts = await ScheduledSession.find({
      $or: [
        { mentor: data.mentorId },
        { mentee: data.menteeId }
      ],
      scheduledDate: {
        $gte: new Date(data.scheduledDate.getTime() - data.duration * 60000),
        $lte: new Date(data.scheduledDate.getTime() + data.duration * 60000)
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (conflicts.length > 0) {
      throw new Error('Time slot conflicts with existing session');
    }

    // Check mentor availability
    const availability = await MentorAvailability.findOne({ mentor: data.mentorId });
    if (!availability) {
      throw new Error('Mentor availability not configured');
    }

    const dayName = data.scheduledDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const timeSlot = data.scheduledDate.toTimeString().slice(0, 5);
    
    const daySchedule = availability.weeklySchedule.find(s => s.day === dayName);
    const isSlotAvailable = daySchedule?.timeSlots.some(slot => 
      slot.startTime === timeSlot && slot.isAvailable
    );

    if (!isSlotAvailable) {
      throw new Error('Selected time slot is not available');
    }

    // Create session
    const session = new ScheduledSession(data);
    await session.save();

    // Send notifications
    await Promise.all([
      Notification.create({
        recipient: data.mentorId,
        type: 'session_scheduled',
        title: 'New Session Scheduled',
        message: 'A new mentorship session has been scheduled',
        read: false
      }),
      Notification.create({
        recipient: data.menteeId,
        type: 'session_confirmed',
        title: 'Session Confirmed',
        message: 'Your mentorship session has been confirmed',
        read: false
      })
    ]);

    // Real-time notification
    io.to(data.mentorId).emit('new_session', {
      type: 'session_scheduled',
      data: session
    });

    return session;
  }

  // Complete mentorship with outcomes tracking
  static async completeMentorship(historyId: string, completionData: {
    outcomes: any;
    finalFeedback: any;
    overallExperience: number;
    wouldRecommend: boolean;
  }) {
    const history = await MentorshipHistory.findById(historyId);
    if (!history) {
      throw new Error('Mentorship history not found');
    }

    // Update history
    history.status = 'completed';
    history.endDate = new Date();
    history.outcomes = completionData.outcomes;
    history.feedback = completionData.finalFeedback;
    history.feedback.overallExperience = completionData.overallExperience;
    history.feedback.wouldRecommend = completionData.wouldRecommend;

    await history.save();

    // Update mentor stats
    await User.findByIdAndUpdate(history.mentor, {
      $inc: { 'mentorshipStats.successfulMentorships': 1 }
    });

    return history;
  }

  // Get mentorship analytics
  static async getMentorshipAnalytics(userId: string, role: 'mentor' | 'mentee' | 'both') {
    const matchQuery = role === 'mentor' ? { mentor: userId } :
                      role === 'mentee' ? { mentee: userId } :
                      { $or: [{ mentor: userId }, { mentee: userId }] };

    const [monthlyStats, outcomeStats, ratingTrends] = await Promise.all([
      MentorshipHistory.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              year: { $year: '$startDate' },
              month: { $month: '$startDate' }
            },
            count: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      MentorshipHistory.aggregate([
        { $match: { ...matchQuery, status: 'completed' } },
        { $unwind: '$outcomes.skillsImproved' },
        {
          $group: {
            _id: '$outcomes.skillsImproved',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      MentorReview.aggregate([
        { $match: role === 'mentor' ? { mentor: userId } : {} },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    return {
      monthlyStats,
      outcomeStats,
      ratingTrends
    };
  }

  static async submitReview(sessionId: string, reviewData: any) {
    const review = await MentorReview.create({
      session: sessionId,
      ...reviewData
    });

    // Update mentor stats
    await this.updateMentorStats(review.mentor.toString(), review.rating);
    
    // Trigger badge checks
    await BadgeService.processUserActivity(review.mentor.toString(), {
      type: 'mentorship_session',
      value: review.rating
    });

    return review;
  }

  private static async updateMentorStats(mentorId: string, rating: number) {
    const stats = await this.getMentorStats(mentorId);
    const newRating = ((stats.reviews.avgRating * stats.reviews.totalReviews) + rating) / 
                     (stats.reviews.totalReviews + 1);

    await User.findByIdAndUpdate(mentorId, {
      $set: { 'mentorStats.rating': newRating },
      $inc: { 'mentorStats.totalReviews': 1 }
    });
  }
}

export default MentorshipService;