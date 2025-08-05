import MentorshipSession from '../models/MentorshipSession';
import MentorReview from '../models/MentorReview';
import User from '../models/User';
import mongoose from 'mongoose';

export class MentorshipDashboardService {
  static async getMentorStats(mentorId: string) {
    const sessions = await MentorshipSession.aggregate([
      { $match: { mentor: new mongoose.Types.ObjectId(mentorId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const reviews = await MentorReview.aggregate([
      { $match: { mentor: new mongoose.Types.ObjectId(mentorId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    return {
      sessions: sessions.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      reviews: reviews[0] || { avgRating: 0, totalReviews: 0 }
    };
  }

  static async getMenteeStats(menteeId: string) {
    const sessions = await MentorshipSession.find({ mentee: menteeId })
      .populate('mentor', 'name avatar')
      .sort({ createdAt: -1 });

    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const activeSessions = sessions.filter(s => s.status === 'active').length;

    return {
      totalSessions: sessions.length,
      completedSessions,
      activeSessions,
      recentSessions: sessions.slice(0, 5)
    };
  }
}