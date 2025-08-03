import Leaderboard from '../models/Leaderboard';
import UserStats from '../models/UserStats';
import Achievement from '../models/Achievement';
import User from '../models/User';

class LeaderboardService {
  // Update all leaderboards
  static async updateLeaderboards() {
    await Promise.all([
      this.updateProjectsLeaderboard(),
      this.updateContributionsLeaderboard(),
      this.updateMentorshipLeaderboard(),
      this.updateOverallLeaderboard(),
      this.updateMonthlyLeaderboard(),
      this.updateWeeklyLeaderboards()
    ]);
  }

  // Projects leaderboard
  static async updateProjectsLeaderboard() {
    const stats = await UserStats.aggregate([
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
          score: { $add: ['$projectsCreated', { $multiply: ['$projectsCompleted', 2] }] },
          projectsCount: { $add: ['$projectsCreated', '$projectsCompleted'] }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ]);

    const rankings = stats.map((stat, index) => ({
      user: stat.user,
      score: stat.score,
      rank: index + 1,
      metadata: { projectsCount: stat.projectsCount }
    }));

    await Leaderboard.findOneAndUpdate(
      { type: 'projects', period: 'all-time' },
      { rankings, lastUpdated: new Date() },
      { upsert: true }
    );
  }

  // Contributions leaderboard
  static async updateContributionsLeaderboard() {
    const stats = await UserStats.aggregate([
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
          score: '$contributionScore',
          contributionScore: '$contributionScore'
        }
      },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ]);

    const rankings = stats.map((stat, index) => ({
      user: stat.user,
      score: stat.score,
      rank: index + 1,
      metadata: { contributionScore: stat.contributionScore }
    }));

    await Leaderboard.findOneAndUpdate(
      { type: 'contributions', period: 'all-time' },
      { rankings, lastUpdated: new Date() },
      { upsert: true }
    );
  }

  // Mentorship leaderboard
  static async updateMentorshipLeaderboard() {
    const stats = await UserStats.aggregate([
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
          score: { $multiply: ['$mentorshipSessions', '$userInfo.mentorRating'] },
          mentorshipRating: '$userInfo.mentorRating'
        }
      },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ]);

    const rankings = stats.map((stat, index) => ({
      user: stat.user,
      score: stat.score,
      rank: index + 1,
      metadata: { mentorshipRating: stat.mentorshipRating }
    }));

    await Leaderboard.findOneAndUpdate(
      { type: 'mentorship', period: 'all-time' },
      { rankings, lastUpdated: new Date() },
      { upsert: true }
    );
  }

  // Overall leaderboard
  static async updateOverallLeaderboard() {
    const stats = await UserStats.aggregate([
      {
        $lookup: {
          from: 'achievements',
          localField: 'user',
          foreignField: 'user',
          as: 'achievements'
        }
      },
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
          score: '$totalPoints',
          badgesCount: { $size: '$achievements' }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ]);

    const rankings = stats.map((stat, index) => ({
      user: stat.user,
      score: stat.score,
      rank: index + 1,
      metadata: { badgesCount: stat.badgesCount }
    }));

    await Leaderboard.findOneAndUpdate(
      { type: 'overall', period: 'all-time' },
      { rankings, lastUpdated: new Date() },
      { upsert: true }
    );
  }

  // Monthly leaderboard
  static async updateMonthlyLeaderboard() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const stats = await UserStats.aggregate([
      { $unwind: '$monthlyStats' },
      { $match: { 'monthlyStats.month': currentMonth } },
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
          score: '$monthlyStats.points'
        }
      },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ]);

    const rankings = stats.map((stat, index) => ({
      user: stat.user,
      score: stat.score,
      rank: index + 1
    }));

    await Leaderboard.findOneAndUpdate(
      { type: 'monthly', period: 'monthly' },
      { rankings, lastUpdated: new Date() },
      { upsert: true }
    );
  }

  // Get leaderboard
  static async getLeaderboard(type: string, period: string = 'all-time', limit: number = 50) {
    const leaderboard = await Leaderboard.findOne({ type, period })
      .populate('rankings.user', 'name email profilePicture department year')
      .lean();

    if (!leaderboard) return { rankings: [] };

    return {
      ...leaderboard,
      rankings: leaderboard.rankings.slice(0, limit)
    };
  }

  // Weekly leaderboards
  static async updateWeeklyLeaderboards() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Projects weekly
    const weeklyProjectStats = await UserStats.aggregate([
      {
        $lookup: {
          from: 'achievements',
          let: { userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user', '$$userId'] },
                earnedAt: { $gte: oneWeekAgo },
                'metadata.projectId': { $exists: true }
              }
            }
          ],
          as: 'weeklyProjectAchievements'
        }
      },
      {
        $project: {
          user: '$user',
          score: { $size: '$weeklyProjectAchievements' }
        }
      },
      { $match: { score: { $gt: 0 } } },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ]);

    const weeklyProjectRankings = weeklyProjectStats.map((stat, index) => ({
      user: stat.user,
      score: stat.score,
      rank: index + 1
    }));

    await Leaderboard.findOneAndUpdate(
      { type: 'projects', period: 'weekly' },
      { rankings: weeklyProjectRankings, lastUpdated: new Date() },
      { upsert: true }
    );

    // Contributions weekly
    const weeklyContributions = await UserStats.aggregate([
      {
        $lookup: {
          from: 'achievements',
          let: { userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user', '$$userId'] },
                earnedAt: { $gte: oneWeekAgo }
              }
            },
            {
              $lookup: {
                from: 'badges',
                localField: 'badge',
                foreignField: '_id',
                as: 'badgeInfo'
              }
            },
            { $unwind: '$badgeInfo' }
          ],
          as: 'weeklyAchievements'
        }
      },
      {
        $project: {
          user: '$user',
          score: { $sum: '$weeklyAchievements.badgeInfo.points' }
        }
      },
      { $match: { score: { $gt: 0 } } },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ]);

    const weeklyContributionRankings = weeklyContributions.map((stat, index) => ({
      user: stat.user,
      score: stat.score,
      rank: index + 1
    }));

    await Leaderboard.findOneAndUpdate(
      { type: 'contributions', period: 'weekly' },
      { rankings: weeklyContributionRankings, lastUpdated: new Date() },
      { upsert: true }
    );

    // Mentorship weekly
    const weeklyMentorship = await UserStats.aggregate([
      {
        $lookup: {
          from: 'achievements',
          let: { userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user', '$$userId'] },
                earnedAt: { $gte: oneWeekAgo },
                'metadata.mentorshipId': { $exists: true }
              }
            }
          ],
          as: 'weeklyMentorshipAchievements'
        }
      },
      {
        $project: {
          user: '$user',
          score: { $size: '$weeklyMentorshipAchievements' }
        }
      },
      { $match: { score: { $gt: 0 } } },
      { $sort: { score: -1 } },
      { $limit: 100 }
    ]);

    const weeklyMentorshipRankings = weeklyMentorship.map((stat, index) => ({
      user: stat.user,
      score: stat.score,
      rank: index + 1
    }));

    await Leaderboard.findOneAndUpdate(
      { type: 'mentorship', period: 'weekly' },
      { rankings: weeklyMentorshipRankings, lastUpdated: new Date() },
      { upsert: true }
    );
  }

  // Get user rank
  static async getUserRank(userId: string, type: string, period: string = 'all-time') {
    const leaderboard = await Leaderboard.findOne({ type, period });
    if (!leaderboard) return null;

    const userRanking = leaderboard.rankings.find(r => r.user.toString() === userId);
    return userRanking || null;
  }

  // Get top performers summary
  static async getTopPerformers(limit: number = 10) {
    const [projects, contributions, mentorship] = await Promise.all([
      this.getLeaderboard('projects', 'all-time', limit),
      this.getLeaderboard('contributions', 'all-time', limit),
      this.getLeaderboard('mentorship', 'all-time', limit)
    ]);

    return {
      projects: projects.rankings,
      contributions: contributions.rankings,
      mentorship: mentorship.rankings
    };
  }
}

export default LeaderboardService;