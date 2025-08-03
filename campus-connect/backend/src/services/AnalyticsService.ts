import Achievement from '../models/Achievement';
import Badge from '../models/Badge';
import UserStats from '../models/UserStats';
import User from '../models/User';
import Leaderboard from '../models/Leaderboard';

class AnalyticsService {
  // Get comprehensive user analytics
  static async getUserAnalytics(userId: string) {
    try {
      const [achievements, userStats, user] = await Promise.all([
        Achievement.find({ user: userId, isCompleted: true }).populate('badge'),
        UserStats.findOne({ user: userId }),
        User.findById(userId)
      ]);

      const analytics = {
        overview: {
          totalBadges: achievements.length,
          totalPoints: userStats?.totalPoints || 0,
          level: userStats?.level || 1,
          currentStreak: userStats?.streaks.current || 0,
          longestStreak: userStats?.streaks.longest || 0
        },
        
        badgeDistribution: {
          byCategory: achievements.reduce((acc, achievement) => {
            const category = achievement.badge.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {}),
          byRarity: achievements.reduce((acc, achievement) => {
            const rarity = achievement.badge.rarity;
            acc[rarity] = (acc[rarity] || 0) + 1;
            return acc;
          }, {})
        },

        activityMetrics: {
          projectsCreated: userStats?.projectsCreated || 0,
          projectsCompleted: userStats?.projectsCompleted || 0,
          eventsAttended: userStats?.eventsAttended || 0,
          mentorshipSessions: userStats?.mentorshipSessions || 0,
          skillEndorsements: userStats?.skillEndorsements || 0,
          contributionScore: userStats?.contributionScore || 0
        },

        monthlyProgress: userStats?.monthlyStats || [],

        recentAchievements: achievements
          .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
          .slice(0, 10),

        progressToNextLevel: {
          currentLevel: userStats?.level || 1,
          currentPoints: userStats?.totalPoints || 0,
          pointsToNextLevel: ((userStats?.level || 1) * 100) - (userStats?.totalPoints || 0),
          progressPercentage: Math.min(((userStats?.totalPoints || 0) % 100) / 100 * 100, 100)
        }
      };

      return analytics;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return null;
    }
  }

  // Get platform-wide analytics
  static async getPlatformAnalytics() {
    try {
      const [totalUsers, totalBadges, totalAchievements, userStats] = await Promise.all([
        User.countDocuments(),
        Badge.countDocuments(),
        Achievement.countDocuments({ isCompleted: true }),
        UserStats.aggregate([
          {
            $group: {
              _id: null,
              totalPoints: { $sum: '$totalPoints' },
              avgLevel: { $avg: '$level' },
              totalProjects: { $sum: '$projectsCreated' },
              totalEvents: { $sum: '$eventsAttended' },
              totalMentorships: { $sum: '$mentorshipSessions' }
            }
          }
        ])
      ]);

      const stats = userStats[0] || {};

      const analytics = {
        userMetrics: {
          totalUsers,
          activeUsers: await UserStats.countDocuments({ 'streaks.current': { $gt: 0 } }),
          avgLevel: Math.round(stats.avgLevel || 1)
        },

        achievementMetrics: {
          totalBadges,
          totalAchievements,
          avgAchievementsPerUser: Math.round(totalAchievements / totalUsers) || 0
        },

        activityMetrics: {
          totalProjects: stats.totalProjects || 0,
          totalEvents: stats.totalEvents || 0,
          totalMentorships: stats.totalMentorships || 0,
          totalPoints: stats.totalPoints || 0
        },

        topPerformers: await this.getTopPerformers(),

        badgePopularity: await this.getBadgePopularity()
      };

      return analytics;
    } catch (error) {
      console.error('Failed to get platform analytics:', error);
      return null;
    }
  }

  // Get top performers across categories
  static async getTopPerformers() {
    try {
      const [topByPoints, topByBadges, topByStreak] = await Promise.all([
        UserStats.find().sort({ totalPoints: -1 }).limit(5).populate('user', 'name email'),
        Achievement.aggregate([
          { $match: { isCompleted: true } },
          { $group: { _id: '$user', badgeCount: { $sum: 1 } } },
          { $sort: { badgeCount: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
          { $unwind: '$user' }
        ]),
        UserStats.find().sort({ 'streaks.longest': -1 }).limit(5).populate('user', 'name email')
      ]);

      return {
        byPoints: topByPoints,
        byBadges: topByBadges,
        byStreak: topByStreak
      };
    } catch (error) {
      console.error('Failed to get top performers:', error);
      return null;
    }
  }

  // Get badge popularity statistics
  static async getBadgePopularity() {
    try {
      const badgeStats = await Achievement.aggregate([
        { $match: { isCompleted: true } },
        { $group: { _id: '$badge', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'badges', localField: '_id', foreignField: '_id', as: 'badge' } },
        { $unwind: '$badge' },
        {
          $project: {
            name: '$badge.name',
            icon: '$badge.icon',
            category: '$badge.category',
            rarity: '$badge.rarity',
            count: 1
          }
        }
      ]);

      return badgeStats;
    } catch (error) {
      console.error('Failed to get badge popularity:', error);
      return [];
    }
  }

  // Get user comparison data
  static async getUserComparison(userId: string) {
    try {
      const userStats = await UserStats.findOne({ user: userId });
      if (!userStats) return null;

      const [totalUsers, userRank, avgStats] = await Promise.all([
        UserStats.countDocuments(),
        UserStats.countDocuments({ totalPoints: { $gt: userStats.totalPoints } }),
        UserStats.aggregate([
          {
            $group: {
              _id: null,
              avgPoints: { $avg: '$totalPoints' },
              avgLevel: { $avg: '$level' },
              avgProjects: { $avg: '$projectsCreated' },
              avgEvents: { $avg: '$eventsAttended' }
            }
          }
        ])
      ]);

      const avg = avgStats[0] || {};

      return {
        userRank: userRank + 1,
        totalUsers,
        percentile: Math.round(((totalUsers - userRank) / totalUsers) * 100),
        comparison: {
          points: {
            user: userStats.totalPoints,
            average: Math.round(avg.avgPoints || 0),
            percentageDiff: Math.round(((userStats.totalPoints - (avg.avgPoints || 0)) / (avg.avgPoints || 1)) * 100)
          },
          level: {
            user: userStats.level,
            average: Math.round(avg.avgLevel || 1),
            percentageDiff: Math.round(((userStats.level - (avg.avgLevel || 1)) / (avg.avgLevel || 1)) * 100)
          },
          projects: {
            user: userStats.projectsCreated,
            average: Math.round(avg.avgProjects || 0),
            percentageDiff: Math.round(((userStats.projectsCreated - (avg.avgProjects || 0)) / (avg.avgProjects || 1)) * 100)
          }
        }
      };
    } catch (error) {
      console.error('Failed to get user comparison:', error);
      return null;
    }
  }
}

export default AnalyticsService;