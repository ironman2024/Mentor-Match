import UserStats from '../models/UserStats';
import Achievement from '../models/Achievement';
import Badge from '../models/Badge';
import User from '../models/User';
import Notification from '../models/Notification';
import Leaderboard from '../models/Leaderboard';
import { BadgeService } from './BadgeService';

export class AchievementService {
  // Unified method to track any user activity
  static async trackActivity(userId: string, activityType: string, metadata?: any) {
    try {
      const activityMap: Record<string, any> = {
        'project_created': { type: 'project_created' },
        'project_completed': { type: 'project_completed' },
        'event_attended': { type: 'event_attended' },
        'mentorship_session': { type: 'mentorship_session' },
        'skill_endorsed': { type: 'skill_endorsed' },
        'team_joined': { type: 'team_joined' },
        'team_led': { type: 'team_led' },
        'hackathon_won': { type: 'hackathon_won' },
        'competition_won': { type: 'competition_won' }
      };

      const activity = activityMap[activityType];
      if (!activity) return null;

      const result = await BadgeService.processUserActivity(userId, { ...activity, metadata });
      
      // Update leaderboards if significant achievement
      if (result?.newBadges?.length) {
        await this.updateLeaderboards();
        await this.checkLeaderboardNotifications(userId);
      }

      return result;
    } catch (error) {
      console.error('Error tracking activity:', error);
      throw error;
    }
  }

  // Get comprehensive user analytics
  static async getUserAnalytics(userId: string) {
    const [userStats, achievements, user, userRankings] = await Promise.all([
      UserStats.findOne({ user: userId }),
      Achievement.find({ user: userId, isCompleted: true }).populate('badge'),
      User.findById(userId),
      this.getUserRankings(userId)
    ]);

    if (!userStats) return null;

    const badgesByCategory = achievements.reduce((acc, achievement) => {
      const category = (achievement.badge as any)?.category;
      if (category) acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const badgesByRarity = achievements.reduce((acc, achievement) => {
      const rarity = (achievement.badge as any)?.rarity;
      if (rarity) acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      overview: {
        level: userStats.level,
        totalPoints: userStats.totalPoints,
        nextLevelPoints: Math.max(0, (userStats.level * 100) - userStats.totalPoints),
        totalBadges: achievements.length,
        currentStreak: userStats.streaks.current,
        longestStreak: userStats.streaks.longest
      },
      categories: {
        projects: {
          created: userStats.projectsCreated,
          completed: userStats.projectsCompleted,
          badges: badgesByCategory.project || 0
        },
        mentorship: {
          sessions: userStats.mentorshipSessions,
          rating: user?.mentorRating || 0,
          badges: badgesByCategory.mentorship || 0
        },
        events: {
          attended: userStats.eventsAttended,
          badges: badgesByCategory.event || 0
        },
        skills: {
          count: user?.skills?.length || 0,
          endorsements: userStats.skillEndorsements,
          badges: badgesByCategory.skill || 0
        },
        collaboration: {
          contributionScore: userStats.contributionScore,
          badges: badgesByCategory.collaboration || 0
        }
      },
      recentAchievements: achievements
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
        .slice(0, 10),
      monthlyProgress: userStats.monthlyStats.slice(-6),
      badgeDistribution: badgesByRarity,
      rankings: userRankings
    };
  }

  // Get user rankings across all leaderboards
  private static async getUserRankings(userId: string) {
    const leaderboards = await Leaderboard.find({});
    const rankings: Record<string, any> = {};

    for (const leaderboard of leaderboards) {
      const userRanking = leaderboard.rankings.find(r => r.user.toString() === userId);
      if (userRanking) {
        rankings[`${leaderboard.type}_${leaderboard.period}`] = {
          rank: userRanking.rank,
          score: userRanking.score,
          type: leaderboard.type,
          period: leaderboard.period
        };
      }
    }

    return rankings;
  }

  // Update all leaderboards efficiently
  static async updateLeaderboards() {
    const leaderboardTypes = [
      { type: 'projects', scoreField: 'projectsCreated', multiplier: 1 },
      { type: 'mentorship', scoreField: 'mentorshipSessions', multiplier: 1 },
      { type: 'contributions', scoreField: 'contributionScore', multiplier: 1 },
      { type: 'overall', scoreField: 'totalPoints', multiplier: 1 }
    ];

    for (const { type, scoreField, multiplier } of leaderboardTypes) {
      await this.updateSingleLeaderboard(type, scoreField, multiplier);
    }
  }

  private static async updateSingleLeaderboard(type: string, scoreField: string, multiplier: number) {
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          user: '$user',
          score: { $multiply: [`$${scoreField}`, multiplier] },
          name: '$userInfo.name',
          avatar: '$userInfo.avatar',
          department: '$userInfo.department'
        }
      },
      { $match: { score: { $gt: 0 } } },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ];

    const results = await UserStats.aggregate(pipeline);
    const rankings = results.map((result, index) => ({
      user: result.user,
      score: result.score,
      rank: index + 1,
      metadata: {
        name: result.name,
        avatar: result.avatar,
        department: result.department
      }
    }));

    await Leaderboard.findOneAndUpdate(
      { type, period: 'all-time' },
      { rankings, lastUpdated: new Date() },
      { upsert: true }
    );
  }

  // Check and send leaderboard notifications
  private static async checkLeaderboardNotifications(userId: string) {
    const rankings = await this.getUserRankings(userId);
    
    for (const [key, ranking] of Object.entries(rankings)) {
      if (ranking.rank <= 10) {
        await Notification.create({
          recipient: userId,
          type: 'general',
          title: 'Leaderboard Achievement!',
          message: `You're now #${ranking.rank} on the ${ranking.type} leaderboard!`
        });
      }
    }
  }

  // Get leaderboard with user info
  static async getLeaderboard(type: string, period: string = 'all-time', limit: number = 50) {
    const leaderboard = await Leaderboard.findOne({ type, period });
    if (!leaderboard) return { rankings: [] };

    const rankings = leaderboard.rankings.slice(0, limit);
    const userIds = rankings.map(r => r.user);
    const users = await User.find({ _id: { $in: userIds } }).select('name avatar department');
    
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    
    return {
      type,
      period,
      lastUpdated: leaderboard.lastUpdated,
      rankings: rankings.map(ranking => ({
        ...ranking,
        user: userMap.get(ranking.user.toString())
      }))
    };
  }

  // Get achievement comparison between users
  static async compareUsers(userId1: string, userId2: string) {
    const [analytics1, analytics2] = await Promise.all([
      this.getUserAnalytics(userId1),
      this.getUserAnalytics(userId2)
    ]);

    if (!analytics1 || !analytics2) return null;

    return {
      user1: analytics1,
      user2: analytics2,
      comparison: {
        levelDifference: analytics1.overview.level - analytics2.overview.level,
        pointsDifference: analytics1.overview.totalPoints - analytics2.overview.totalPoints,
        badgesDifference: analytics1.overview.totalBadges - analytics2.overview.totalBadges,
        streakDifference: analytics1.overview.currentStreak - analytics2.overview.currentStreak
      }
    };
  }

  // Send achievement digest
  static async sendWeeklyDigest(userId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentAchievements = await Achievement.find({
      user: userId,
      isCompleted: true,
      earnedAt: { $gte: weekAgo }
    }).populate('badge');

    if (recentAchievements.length === 0) return;

    const totalPoints = recentAchievements.reduce((sum, achievement) => 
      sum + ((achievement.badge as any)?.points || 0), 0);

    await Notification.create({
      recipient: userId,
      type: 'general',
      title: 'Weekly Achievement Digest',
      message: `This week you earned ${recentAchievements.length} badges and ${totalPoints} points!`
    });
  }

  // Get available badges with progress
  static async getAvailableBadges(userId: string) {
    const [badges, userStats, user, achievements] = await Promise.all([
      Badge.find().sort({ points: 1 }),
      UserStats.findOne({ user: userId }),
      User.findById(userId),
      Achievement.find({ user: userId }).select('badge')
    ]);

    const earnedBadgeIds = new Set(achievements.map(a => a.badge.toString()));

    return badges.map(badge => {
      const isEarned = earnedBadgeIds.has(badge._id.toString());
      let progress = 0;
      let currentValue = 0;

      if (!isEarned && userStats && user) {
        currentValue = BadgeService['getCurrentValue'](badge.criteria.metric, userStats, user);
        progress = Math.min((currentValue / badge.criteria.target) * 100, 100);
      }

      return {
        ...badge.toObject(),
        earned: isEarned,
        progress: isEarned ? 100 : progress,
        currentValue: isEarned ? badge.criteria.target : currentValue,
        targetValue: badge.criteria.target
      };
    });
  }
}