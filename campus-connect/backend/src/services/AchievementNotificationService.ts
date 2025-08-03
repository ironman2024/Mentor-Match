import Notification from '../models/Notification';
import User from '../models/User';
import Badge from '../models/Badge';
import Achievement from '../models/Achievement';

class AchievementNotificationService {
  // Send badge earned notification
  static async sendBadgeEarnedNotification(userId: string, badgeId: string) {
    try {
      const badge = await Badge.findById(badgeId);
      if (!badge) return;

      await Notification.create({
        recipient: userId,
        type: 'achievement',
        title: 'Badge Earned!',
        message: `Congratulations! You've earned the "${badge.name}" badge!`,
        data: {
          badgeId: badge._id,
          badgeName: badge.name,
          badgeIcon: badge.icon,
          points: badge.points,
          rarity: badge.rarity
        }
      });
    } catch (error) {
      console.error('Failed to send badge notification:', error);
    }
  }

  // Send level up notification
  static async sendLevelUpNotification(userId: string, newLevel: number, pointsEarned: number) {
    try {
      await Notification.create({
        recipient: userId,
        type: 'achievement',
        title: 'Level Up!',
        message: `Amazing! You've reached level ${newLevel}!`,
        data: {
          newLevel,
          pointsEarned,
          type: 'levelUp'
        }
      });
    } catch (error) {
      console.error('Failed to send level up notification:', error);
    }
  }

  // Send streak milestone notification
  static async sendStreakMilestoneNotification(userId: string, streakDays: number) {
    try {
      const milestones = [7, 14, 30, 50, 100];
      if (milestones.includes(streakDays)) {
        await Notification.create({
          recipient: userId,
          type: 'achievement',
          title: 'Streak Milestone!',
          message: `Incredible! You've maintained a ${streakDays}-day activity streak!`,
          data: {
            streakDays,
            type: 'streakMilestone'
          }
        });
      }
    } catch (error) {
      console.error('Failed to send streak notification:', error);
    }
  }

  // Send leaderboard position notification
  static async sendLeaderboardNotification(userId: string, leaderboardType: string, rank: number, previousRank?: number) {
    try {
      if (rank <= 10 && (!previousRank || rank < previousRank)) {
        const message = rank === 1 
          ? `🏆 You're now #1 on the ${leaderboardType} leaderboard!`
          : `🎉 You've climbed to #${rank} on the ${leaderboardType} leaderboard!`;

        await Notification.create({
          recipient: userId,
          type: 'achievement',
          title: 'Leaderboard Update!',
          message,
          data: {
            leaderboardType,
            rank,
            previousRank,
            type: 'leaderboard'
          }
        });
      }
    } catch (error) {
      console.error('Failed to send leaderboard notification:', error);
    }
  }

  // Get achievement summary for user
  static async getAchievementSummary(userId: string, period: 'week' | 'month' | 'all' = 'all') {
    try {
      let dateFilter = {};
      
      if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { earnedAt: { $gte: weekAgo } };
      } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { earnedAt: { $gte: monthAgo } };
      }

      const achievements = await Achievement.find({
        user: userId,
        isCompleted: true,
        ...dateFilter
      }).populate('badge');

      const summary = {
        totalBadges: achievements.length,
        totalPoints: achievements.reduce((sum, achievement) => {
          const badge = achievement.badge as any;
          return sum + (badge.points || 0);
        }, 0),
        badgesByCategory: achievements.reduce((acc: Record<string, number>, achievement) => {
          const badge = achievement.badge as any;
          const category = badge.category;
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {}),
        badgesByRarity: achievements.reduce((acc: Record<string, number>, achievement) => {
          const badge = achievement.badge as any;
          const rarity = badge.rarity;
          acc[rarity] = (acc[rarity] || 0) + 1;
          return acc;
        }, {}),
        recentAchievements: achievements
          .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
          .slice(0, 5)
      };

      return summary;
    } catch (error) {
      console.error('Failed to get achievement summary:', error);
      return null;
    }
  }

  // Send weekly achievement digest
  static async sendWeeklyDigest(userId: string) {
    try {
      const summary = await this.getAchievementSummary(userId, 'week');
      if (!summary || summary.totalBadges === 0) return;

      await Notification.create({
        recipient: userId,
        type: 'digest',
        title: 'Weekly Achievement Digest',
        message: `This week you earned ${summary.totalBadges} badges and ${summary.totalPoints} points!`,
        data: {
          ...summary,
          type: 'weeklyDigest'
        }
      });
    } catch (error) {
      console.error('Failed to send weekly digest:', error);
    }
  }
}

export default AchievementNotificationService;