import { BadgeService } from './BadgeService';
import UserStats from '../models/UserStats';
import Achievement from '../models/Achievement';

export class AchievementTrackingService {
  private static cache = new Map<string, any>();

  static async trackActivity(userId: string, activity: {
    type: 'project_created' | 'project_completed' | 'event_attended' | 'mentorship_session' | 'skill_endorsed' | 'team_joined' | 'team_led' | 'hackathon_won' | 'competition_won';
    value?: number;
    metadata?: any;
  }) {
    const cacheKey = `${userId}_stats`;
    let userStats = this.cache.get(cacheKey);

    if (!userStats) {
      userStats = await UserStats.findOne({ user: userId });
      this.cache.set(cacheKey, userStats);
      
      // Cache invalidation after 5 minutes
      setTimeout(() => this.cache.delete(cacheKey), 300000);
    }

    const updates = await Promise.all([
      this.updateStats(userStats, activity),
      BadgeService.processUserActivity(userId, activity)
    ]);

    return updates;
  }

  private static async updateStats(userStats: any, activity: any) {
    // Batch update stats
    const updates: any = {};
    
    switch (activity.type) {
      case 'mentorship':
        updates.mentorshipScore = (userStats.mentorshipScore || 0) + activity.value;
        updates.totalMentorships = (userStats.totalMentorships || 0) + 1;
        break;
      // Add other activity types...
    }

    if (Object.keys(updates).length > 0) {
      await UserStats.updateOne({ _id: userStats._id }, { $inc: updates });
    }

    return updates;
  }

  static async getAchievementLeaderboard(metric: string, limit: number) {
    const userStats = await UserStats.find()
      .sort({ [metric]: -1 })
      .limit(limit)
      .populate('user', 'name avatar')
      .lean();
    
    return userStats.map((stats: any, index) => ({
      rank: index + 1,
      user: stats.user,
      value: stats[metric] || 0
    }));
  }

  static async compareAchievements(userId1: string, userId2: string) {
    const [stats1, stats2] = await Promise.all([
      UserStats.findOne({ user: userId1 }).populate('user', 'name avatar'),
      UserStats.findOne({ user: userId2 }).populate('user', 'name avatar')
    ]);

    if (!stats1 || !stats2) {
      throw new Error('User stats not found');
    }

    return {
      user1: {
        user: stats1.user,
        totalPoints: stats1.totalPoints || 0,
        level: stats1.level || 1,
        projectScore: stats1.projectScore || 0,
        mentorshipScore: stats1.mentorshipScore || 0
      },
      user2: {
        user: stats2.user,
        totalPoints: stats2.totalPoints || 0,
        level: stats2.level || 1,
        projectScore: stats2.projectScore || 0,
        mentorshipScore: stats2.mentorshipScore || 0
      }
    };
  }

  // Get comprehensive achievement analytics
  static async getAchievementAnalytics(userId: string) {
    const [userStats, achievements] = await Promise.all([
      UserStats.findOne({ user: userId }),
      Achievement.find({ user: userId, isCompleted: true }).populate('badge')
    ]);

    if (!userStats) {
      return {
        totalPoints: 0,
        level: 1,
        badges: [],
        categoryBreakdown: {},
        rarityBreakdown: {},
        recentAchievements: []
      };
    }

    const categoryBreakdown = achievements.reduce((acc: Record<string, number>, achievement) => {
      const badge = achievement.badge as any;
      acc[badge.category] = (acc[badge.category] || 0) + 1;
      return acc;
    }, {});

    const rarityBreakdown = achievements.reduce((acc: Record<string, number>, achievement) => {
      const badge = achievement.badge as any;
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPoints: userStats.totalPoints,
      level: userStats.level,
      badges: achievements.length,
      categoryBreakdown,
      rarityBreakdown,
      recentAchievements: achievements
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
        .slice(0, 5)
    };
  }
}