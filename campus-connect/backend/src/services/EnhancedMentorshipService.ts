import mongoose from 'mongoose';
import MentorAvailability from '../models/MentorAvailability';
import MentorReview from '../models/MentorReview';
import MentorshipHistory from '../models/MentorshipHistory';
import MentorshipRequest from '../models/MentorshipRequest';
import MentorshipSession from '../models/MentorshipSession';
import ScheduledSession from '../models/ScheduledSession';
import User from '../models/User';
import Notification from '../models/Notification';

export class EnhancedMentorshipService {
  // Enhanced mentor discovery with advanced filtering
  static async discoverMentors(filters: {
    skills?: string[];
    expertise?: string[];
    department?: string;
    minRating?: number;
    availability?: 'immediate' | 'this-week' | 'flexible';
    sessionType?: 'one-time' | 'ongoing';
    location?: 'online' | 'offline' | 'hybrid';
    experience?: number;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 12 } = filters;
    const skip = (page - 1) * limit;

    let query: any = {
      role: { $in: ['alumni', 'faculty'] },
      mentorshipAvailability: true
    };

    if (filters.department) query.department = filters.department;
    if (filters.minRating) query.mentorRating = { $gte: filters.minRating };

    const mentors = await User.find(query)
      .select('name email avatar bio areasOfExpertise skills mentorRating totalRatings role department yearOfGraduation experiences projects linkedin github')
      .skip(skip)
      .limit(limit)
      .lean();

    // Enhanced matching with availability check
    const enhancedMentors = await Promise.all(
      mentors.map(async (mentor) => {
        const [availability, recentReviews, stats] = await Promise.all([
          MentorAvailability.findOne({ mentor: mentor._id }),
          MentorReview.find({ mentor: mentor._id, status: 'active' })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('mentee', 'name'),
          this.getMentorQuickStats(mentor._id.toString())
        ]);

        return {
          ...mentor,
          matchScore: this.calculateEnhancedMatchScore(mentor, filters),
          availability: this.getAvailabilityStatus(availability),
          recentReviews: recentReviews.slice(0, 2),
          stats,
          nextAvailableSlot: await this.getNextAvailableSlot(mentor._id.toString())
        };
      })
    );

    return enhancedMentors
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  // Calculate enhanced match score with more factors
  static calculateEnhancedMatchScore(mentor: any, filters: any): number {
    let score = 0;

    // Skills alignment (30%)
    if (filters.skills && mentor.skills) {
      const skillMatches = filters.skills.filter((skill: string) =>
        mentor.skills.some((ms: any) => 
          ms.name.toLowerCase().includes(skill.toLowerCase())
        )
      ).length;
      score += (skillMatches / filters.skills.length) * 30;
    }

    // Expertise alignment (25%)
    if (filters.expertise && mentor.areasOfExpertise) {
      const expertiseMatches = filters.expertise.filter((exp: string) =>
        mentor.areasOfExpertise.some((mae: any) =>
          mae.name.toLowerCase().includes(exp.toLowerCase())
        )
      ).length;
      score += (expertiseMatches / filters.expertise.length) * 25;
    }

    // Rating factor (20%)
    if (mentor.mentorRating) {
      score += (mentor.mentorRating / 5) * 20;
    }

    // Experience factor (15%)
    if (mentor.experiences && mentor.experiences.length > 0) {
      const avgExperience = mentor.experiences.length;
      score += Math.min(avgExperience / 5, 1) * 15;
    }

    // Activity factor (10%)
    if (mentor.totalRatings > 0) {
      score += Math.min(mentor.totalRatings / 20, 1) * 10;
    }

    return Math.round(score);
  }

  // Get mentor quick stats
  static async getMentorQuickStats(mentorId: string) {
    const [sessionCount, menteeCount, avgRating] = await Promise.all([
      ScheduledSession.countDocuments({ mentor: mentorId, status: 'completed' }),
      MentorshipHistory.distinct('mentee', { mentor: mentorId }),
      MentorReview.aggregate([
        { $match: { mentor: new mongoose.Types.ObjectId(mentorId), status: 'active' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ])
    ]);

    return {
      completedSessions: sessionCount,
      totalMentees: menteeCount.length,
      averageRating: avgRating[0]?.avg || 0,
      totalReviews: avgRating[0]?.count || 0
    };
  }

  // Get availability status
  static getAvailabilityStatus(availability: any) {
    if (!availability) return 'not-set';
    
    const now = new Date();
    const today = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todaySchedule = availability.weeklySchedule.find((s: any) => {
      const dayMap: { [key: number]: string } = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
      return s.day === dayMap[today];
    });

    if (todaySchedule?.timeSlots.some((slot: any) => 
      slot.isAvailable && slot.startTime > currentTime
    )) {
      return 'available-today';
    }

    return 'available-later';
  }

  // Get next available slot
  static async getNextAvailableSlot(mentorId: string) {
    const availability = await MentorAvailability.findOne({ mentor: mentorId });
    if (!availability) return null;

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find next available slot in the next 7 days
    for (let d = new Date(now); d <= nextWeek; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = availability.weeklySchedule.find(s => s.day === dayName);
      
      if (daySchedule) {
        const existingSessions = await ScheduledSession.find({
          mentor: mentorId,
          scheduledDate: {
            $gte: new Date(d.setHours(0, 0, 0, 0)),
            $lt: new Date(d.setHours(23, 59, 59, 999))
          },
          status: { $in: ['scheduled', 'confirmed'] }
        });

        const availableSlot = daySchedule.timeSlots.find((slot: any) => {
          if (!slot.isAvailable) return false;
          
          const slotTime = slot.startTime;
          return !existingSessions.some(session => 
            session.scheduledDate.toTimeString().slice(0, 5) === slotTime
          );
        });

        if (availableSlot) {
          return {
            date: d.toISOString().split('T')[0],
            time: availableSlot.startTime,
            duration: availability.sessionDuration
          };
        }
      }
    }

    return null;
  }

  // Enhanced session scheduling with smart conflict resolution
  static async scheduleEnhancedSession(data: {
    mentorId: string;
    menteeId: string;
    requestId?: string;
    scheduledDate: Date;
    duration: number;
    meetingType: 'online' | 'offline';
    topic: string;
    goals: string[];
    agenda: string;
    meetingLink?: string;
    location?: string;
    sessionType: 'one-time' | 'recurring';
    recurringPattern?: {
      frequency: 'weekly' | 'biweekly' | 'monthly';
      endDate?: Date;
      totalSessions?: number;
    };
  }) {
    // Validate availability
    const availability = await MentorAvailability.findOne({ mentor: data.mentorId });
    if (!availability) {
      throw new Error('Mentor availability not configured');
    }

    // Check for conflicts
    const conflicts = await this.checkScheduleConflicts(data.mentorId, data.menteeId, data.scheduledDate, data.duration);
    if (conflicts.length > 0) {
      const suggestions = await this.suggestAlternativeSlots(data.mentorId, data.scheduledDate, data.duration);
      throw new Error(`Time slot conflicts detected. Suggested alternatives: ${suggestions.map(s => s.time).join(', ')}`);
    }

    // Create session(s)
    if (data.sessionType === 'recurring' && data.recurringPattern) {
      return this.createRecurringSessions(data);
    } else {
      return this.createSingleSession(data);
    }
  }

  // Check schedule conflicts
  static async checkScheduleConflicts(mentorId: string, menteeId: string, scheduledDate: Date, duration: number) {
    const startTime = new Date(scheduledDate);
    const endTime = new Date(scheduledDate.getTime() + duration * 60000);

    return ScheduledSession.find({
      $or: [
        { mentor: mentorId },
        { mentee: menteeId }
      ],
      scheduledDate: {
        $gte: new Date(startTime.getTime() - 30 * 60000), // 30 min buffer
        $lte: new Date(endTime.getTime() + 30 * 60000)
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });
  }

  // Suggest alternative time slots
  static async suggestAlternativeSlots(mentorId: string, preferredDate: Date, duration: number) {
    const availability = await MentorAvailability.findOne({ mentor: mentorId });
    if (!availability) return [];

    const suggestions = [];
    const startDate = new Date(preferredDate);
    
    // Check next 7 days
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = availability.weeklySchedule.find(s => s.day === dayName);
      
      if (daySchedule) {
        for (const slot of daySchedule.timeSlots) {
          if (slot.isAvailable) {
            const slotDateTime = new Date(checkDate);
            const [hours, minutes] = slot.startTime.split(':');
            slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            const conflicts = await this.checkScheduleConflicts(mentorId, '', slotDateTime, duration);
            if (conflicts.length === 0) {
              suggestions.push({
                date: checkDate.toISOString().split('T')[0],
                time: slot.startTime,
                datetime: slotDateTime
              });
            }
          }
        }
      }
    }

    return suggestions.slice(0, 3);
  }

  // Create single session
  static async createSingleSession(data: any) {
    const session = new ScheduledSession({
      mentorshipRequest: data.requestId,
      mentor: data.mentorId,
      mentee: data.menteeId,
      scheduledDate: data.scheduledDate,
      duration: data.duration,
      meetingType: data.meetingType,
      meetingLink: data.meetingLink,
      location: data.location,
      agenda: data.agenda
    });

    await session.save();

    // Create mentorship session record
    const mentorshipSession = new MentorshipSession({
      mentor: data.mentorId,
      mentee: data.menteeId,
      topic: data.topic,
      goals: data.goals,
      sessionType: 'one-time',
      meetingDetails: {
        scheduledDate: data.scheduledDate,
        duration: data.duration,
        meetingType: data.meetingType,
        meetingLink: data.meetingLink,
        location: data.location
      }
    });

    await mentorshipSession.save();

    // Send notifications
    await this.sendSessionNotifications(data.mentorId, data.menteeId, session);

    return { session, mentorshipSession };
  }

  // Create recurring sessions
  static async createRecurringSessions(data: any) {
    const sessions = [];
    const { frequency, endDate, totalSessions } = data.recurringPattern;
    
    let currentDate = new Date(data.scheduledDate);
    let sessionCount = 0;
    const maxSessions = totalSessions || 10;

    while (sessionCount < maxSessions && (!endDate || currentDate <= endDate)) {
      const session = new ScheduledSession({
        mentorshipRequest: data.requestId,
        mentor: data.mentorId,
        mentee: data.menteeId,
        scheduledDate: new Date(currentDate),
        duration: data.duration,
        meetingType: data.meetingType,
        meetingLink: data.meetingLink,
        location: data.location,
        agenda: data.agenda
      });

      await session.save();
      sessions.push(session);

      // Calculate next date
      switch (frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }

      sessionCount++;
    }

    // Create master mentorship session
    const mentorshipSession = new MentorshipSession({
      mentor: data.mentorId,
      mentee: data.menteeId,
      topic: data.topic,
      goals: data.goals,
      sessionType: 'recurring',
      meetingDetails: {
        scheduledDate: data.scheduledDate,
        duration: data.duration,
        meetingType: data.meetingType,
        meetingLink: data.meetingLink,
        location: data.location
      },
      recurringSchedule: {
        frequency,
        endDate,
        totalSessions: sessions.length,
        completedSessions: 0
      }
    });

    await mentorshipSession.save();

    // Send notifications
    await this.sendSessionNotifications(data.mentorId, data.menteeId, sessions[0], true);

    return { sessions, mentorshipSession };
  }

  // Send session notifications
  static async sendSessionNotifications(mentorId: string, menteeId: string, session: any, isRecurring = false) {
    const [mentor, mentee] = await Promise.all([
      User.findById(mentorId).select('name'),
      User.findById(menteeId).select('name')
    ]);

    await Promise.all([
      Notification.create({
        recipient: mentorId,
        type: 'session_scheduled',
        title: `${isRecurring ? 'Recurring ' : ''}Session Scheduled`,
        message: `New mentorship session scheduled with ${mentee?.name}`,
        read: false
      }),
      Notification.create({
        recipient: menteeId,
        type: 'session_confirmed',
        title: `${isRecurring ? 'Recurring ' : ''}Session Confirmed`,
        message: `Mentorship session confirmed with ${mentor?.name}`,
        read: false
      })
    ]);
  }

  // Get comprehensive mentorship analytics
  static async getComprehensiveAnalytics(userId: string, role: 'mentor' | 'mentee') {
    const matchQuery = role === 'mentor' ? { mentor: userId } : { mentee: userId };

    const [
      overallStats,
      monthlyTrends,
      skillDevelopment,
      sessionAnalytics,
      outcomeMetrics
    ] = await Promise.all([
      this.getOverallStats(userId, role),
      this.getMonthlyTrends(matchQuery),
      this.getSkillDevelopment(matchQuery),
      this.getSessionAnalytics(matchQuery),
      this.getOutcomeMetrics(matchQuery)
    ]);

    return {
      overallStats,
      monthlyTrends,
      skillDevelopment,
      sessionAnalytics,
      outcomeMetrics
    };
  }

  // Get overall stats
  static async getOverallStats(userId: string, role: 'mentor' | 'mentee') {
    const matchQuery = role === 'mentor' ? { mentor: userId } : { mentee: userId };

    const [historyStats, sessionStats, reviewStats] = await Promise.all([
      MentorshipHistory.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            avgRating: { $avg: '$averageRating' }
          }
        }
      ]),
      ScheduledSession.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      role === 'mentor' ? MentorReview.aggregate([
        { $match: { mentor: userId, status: 'active' } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]) : []
    ]);

    return {
      mentorships: historyStats[0] || { total: 0, active: 0, completed: 0, avgRating: 0 },
      sessions: sessionStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      reviews: reviewStats[0] || { avgRating: 0, totalReviews: 0 }
    };
  }

  // Get monthly trends
  static async getMonthlyTrends(matchQuery: any) {
    return MentorshipHistory.aggregate([
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
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
  }

  // Get skill development
  static async getSkillDevelopment(matchQuery: any) {
    return MentorshipHistory.aggregate([
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
    ]);
  }

  // Get session analytics
  static async getSessionAnalytics(matchQuery: any) {
    return ScheduledSession.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$meetingType',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);
  }

  // Get outcome metrics
  static async getOutcomeMetrics(matchQuery: any) {
    return MentorshipHistory.aggregate([
      { $match: { ...matchQuery, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalCertifications: { $sum: { $size: '$outcomes.certificationsEarned' } },
          totalProjects: { $sum: { $size: '$outcomes.projectsCompleted' } },
          careerAdvancements: { $sum: { $cond: [{ $ne: ['$outcomes.careerAdvancement', null] }, 1, 0] } }
        }
      }
    ]);
  }
}

export default EnhancedMentorshipService;