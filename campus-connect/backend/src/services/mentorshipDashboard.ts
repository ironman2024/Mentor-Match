import mongoose from 'mongoose';
import User from '../models/User';
import Event from '../models/Event';

export interface DashboardStats {
  totalMentorships: number;
  activeMentorships: number;
  completedMentorships: number;
  upcomingEvents: number;
  totalEvents: number;
}

export interface MentorshipOverview {
  id: string;
  mentorName: string;
  menteeName: string;
  status: 'active' | 'completed' | 'pending';
  startDate: Date;
  lastActivity: Date;
  progress: number;
}

export class MentorshipDashboardService {
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isMentor = user.role === 'faculty' || user.role === 'alumni';
    const matchField = isMentor ? 'mentor' : 'mentee';

    const [totalMentorships, activeMentorships, completedMentorships, upcomingEvents, totalEvents] = await Promise.all([
      this.getMentorshipCount(userId, matchField),
      this.getMentorshipCount(userId, matchField, 'active'),
      this.getMentorshipCount(userId, matchField, 'completed'),
      Event.countDocuments({ date: { $gte: new Date() }, status: 'upcoming' }),
      Event.countDocuments({})
    ]);

    return {
      totalMentorships,
      activeMentorships,
      completedMentorships,
      upcomingEvents,
      totalEvents
    };
  }

  async getMentorshipOverview(userId: string, limit = 10): Promise<MentorshipOverview[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isMentor = user.role === 'faculty' || user.role === 'alumni';
    const matchCondition = isMentor ? { mentor: userId } : { mentee: userId };

    const mentorships = await User.aggregate([
      { $match: { 'mentorships': { $elemMatch: matchCondition } } },
      { $unwind: '$mentorships' },
      { $match: { [`mentorships.${isMentor ? 'mentor' : 'mentee'}`]: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'users',
          localField: isMentor ? 'mentorships.mentee' : 'mentorships.mentor',
          foreignField: '_id',
          as: 'partner'
        }
      },
      { $unwind: '$partner' },
      {
        $project: {
          id: '$mentorships._id',
          mentorName: isMentor ? user.name : '$partner.name',
          menteeName: isMentor ? '$partner.name' : user.name,
          status: '$mentorships.status',
          startDate: '$mentorships.startDate',
          lastActivity: '$mentorships.lastActivity',
          progress: '$mentorships.progress'
        }
      },
      { $sort: { lastActivity: -1 } },
      { $limit: limit }
    ]);

    return mentorships;
  }

  async getUpcomingEvents(limit = 5) {
    return Event.find({
      date: { $gte: new Date() },
      status: 'upcoming'
    })
    .populate('organizer', 'name email')
    .sort({ date: 1 })
    .limit(limit)
    .select('title date location type capacity registrations');
  }

  async getRecentActivity(userId: string, limit = 10) {
    const activities = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$mentorships' },
      {
        $lookup: {
          from: 'users',
          localField: 'mentorships.mentor',
          foreignField: '_id',
          as: 'mentor'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'mentorships.mentee',
          foreignField: '_id',
          as: 'mentee'
        }
      },
      {
        $project: {
          type: 'mentorship_update',
          description: {
            $concat: [
              'Progress updated for mentorship with ',
              { $arrayElemAt: ['$mentor.name', 0] },
              ' and ',
              { $arrayElemAt: ['$mentee.name', 0] }
            ]
          },
          timestamp: '$mentorships.lastActivity',
          progress: '$mentorships.progress'
        }
      },
      { $sort: { timestamp: -1 } },
      { $limit: limit }
    ]);

    return activities;
  }

  private async getMentorshipCount(userId: string, field: string, status?: string) {
    const matchCondition: any = {};
    matchCondition[`mentorships.${field}`] = new mongoose.Types.ObjectId(userId);
    
    if (status) {
      matchCondition['mentorships.status'] = status;
    }

    const result = await User.aggregate([
      { $match: { 'mentorships': { $elemMatch: matchCondition } } },
      { $unwind: '$mentorships' },
      { $match: matchCondition },
      { $count: 'total' }
    ]);

    return result[0]?.total || 0;
  }
}