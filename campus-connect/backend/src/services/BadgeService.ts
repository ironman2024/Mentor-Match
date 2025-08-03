import Badge from '../models/Badge';
import UserStats from '../models/UserStats';
import Achievement from '../models/Achievement';
import Notification from '../models/Notification';
import User from '../models/User';
import mongoose from 'mongoose';

// Add TypeScript interfaces for better type safety
interface BadgeCriteria {
  type: 'count' | 'rating' | 'completion' | 'milestone' | 'streak';
  target: number;
  metric: string;
}

interface Badge {
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: BadgeCriteria;
  rarity: string;
  points: number;
}

export class BadgeService {
  private static readonly BADGES = [
    { name: 'First Mentor', description: 'Complete your first mentorship session', icon: '🎓', category: 'mentorship', criteria: { type: 'count', target: 1, metric: 'mentorshipSessions' }, rarity: 'common', points: 50 },
    { name: 'Mentor Master', description: 'Complete 10 mentorship sessions', icon: '👨‍🏫', category: 'mentorship', criteria: { type: 'count', target: 10, metric: 'mentorshipSessions' }, rarity: 'rare', points: 200 },
    { name: 'Top Rated Mentor', description: 'Achieve 4.5+ average rating', icon: '⭐', category: 'mentorship', criteria: { type: 'rating', target: 4.5, metric: 'mentorRating' }, rarity: 'epic', points: 300 },
    { name: 'Project Pioneer', description: 'Create your first project', icon: '🚀', category: 'project', criteria: { type: 'count', target: 1, metric: 'projectsCreated' }, rarity: 'common', points: 30 },
    { name: 'Project Finisher', description: 'Complete 5 projects', icon: '✅', category: 'project', criteria: { type: 'count', target: 5, metric: 'projectsCompleted' }, rarity: 'rare', points: 150 },
    { name: 'Innovation Leader', description: 'Create 10 projects', icon: '💡', category: 'project', criteria: { type: 'count', target: 10, metric: 'projectsCreated' }, rarity: 'epic', points: 250 },
    { name: 'Event Enthusiast', description: 'Attend your first event', icon: '🎪', category: 'event', criteria: { type: 'count', target: 1, metric: 'eventsAttended' }, rarity: 'common', points: 25 },
    { name: 'Hackathon Hero', description: 'Participate in 5 hackathons', icon: '💻', category: 'event', criteria: { type: 'count', target: 5, metric: 'eventsAttended' }, rarity: 'rare', points: 100 },
    { name: 'Skill Collector', description: 'Add 5 skills to your profile', icon: '🛠️', category: 'skill', criteria: { type: 'count', target: 5, metric: 'skillCount' }, rarity: 'common', points: 40 },
    { name: 'Expert Endorser', description: 'Receive 10 skill endorsements', icon: '👍', category: 'skill', criteria: { type: 'count', target: 10, metric: 'skillEndorsements' }, rarity: 'rare', points: 120 },
    { name: 'Team Player', description: 'Join 3 project teams', icon: '🤝', category: 'collaboration', criteria: { type: 'count', target: 3, metric: 'teamsJoined' }, rarity: 'common', points: 60 },
    { name: 'Team Leader', description: 'Lead 5 successful teams', icon: '👨‍💼', category: 'collaboration', criteria: { type: 'count', target: 5, metric: 'teamsLed' }, rarity: 'rare', points: 150 },
    { name: 'Hackathon Winner', description: 'Win a hackathon competition', icon: '🏆', category: 'collaboration', criteria: { type: 'count', target: 1, metric: 'hackathonWins' }, rarity: 'epic', points: 300 },
    { name: 'Competition Champion', description: 'Win 3 competitions', icon: '🥇', category: 'collaboration', criteria: { type: 'count', target: 3, metric: 'competitionWins' }, rarity: 'legendary', points: 500 },
    { name: 'Community Builder', description: 'Help 20 students through mentorship', icon: '🏗️', category: 'collaboration', criteria: { type: 'count', target: 20, metric: 'studentsHelped' }, rarity: 'legendary', points: 500 },
    { name: 'Perfect Teammate', description: 'Receive 5-star team ratings 10 times', icon: '⭐', category: 'collaboration', criteria: { type: 'count', target: 10, metric: 'perfectTeamRatings' }, rarity: 'epic', points: 250 },
    { name: 'Rising Star', description: 'Reach level 5', icon: '🌟', category: 'achievement', criteria: { type: 'milestone', target: 5, metric: 'level' }, rarity: 'rare', points: 100 },
    { name: 'Campus Legend', description: 'Reach level 20', icon: '👑', category: 'achievement', criteria: { type: 'milestone', target: 20, metric: 'level' }, rarity: 'legendary', points: 1000 },
    { name: 'Consistent Contributor', description: 'Maintain a 7-day activity streak', icon: '🔥', category: 'achievement', criteria: { type: 'streak', target: 7, metric: 'currentStreak' }, rarity: 'rare', points: 150 },
    { name: 'Dedication Master', description: 'Maintain a 30-day activity streak', icon: '💪', category: 'achievement', criteria: { type: 'streak', target: 30, metric: 'currentStreak' }, rarity: 'epic', points: 400 },
    { name: 'Unstoppable Force', description: 'Maintain a 100-day activity streak', icon: '⚡', category: 'achievement', criteria: { type: 'streak', target: 100, metric: 'currentStreak' }, rarity: 'legendary', points: 1500 }
  ];

  static async initializeBadges() {
    await Badge.insertMany(this.BADGES, { ordered: false }).catch(() => {});
  }

  static async processUserActivity(userId: string, activity: {
    type: 'project_created' | 'project_completed' | 'event_attended' | 'mentorship_session' | 'skill_endorsed' | 'team_joined' | 'team_led' | 'hackathon_won' | 'competition_won';
    value?: number;
    metadata?: any;
  }) {
    const userStats = await this.getOrCreateUserStats(userId);
    const user = await User.findById(userId);
    if (!user || !userStats) return;

    // Update stats based on activity
    const updates = this.calculateStatUpdates(activity, userStats, user);
    Object.assign(userStats, updates.stats);
    
    // Update monthly stats
    const currentMonth = new Date().toISOString().slice(0, 7);
    let monthlyStats = userStats.monthlyStats.find(m => m.month === currentMonth);
    if (!monthlyStats) {
      monthlyStats = { month: currentMonth, points: 0, projects: 0, events: 0, mentorships: 0 };
      userStats.monthlyStats.push(monthlyStats);
    }
    Object.assign(monthlyStats, updates.monthly);

    // Update streak
    this.updateStreak(userStats);
    
    // Calculate level
    userStats.level = Math.floor(userStats.totalPoints / 100) + 1;
    
    await userStats.save();

    // Check and award badges
    const newBadges = await this.checkAndAwardBadges(userId, userStats, user);
    
    return { userStats, newBadges };
  }

  private static async getOrCreateUserStats(userId: string) {
    let userStats = await UserStats.findOne({ user: userId });
    if (!userStats) {
      userStats = new UserStats({ user: userId });
      await userStats.save();
    }
    return userStats;
  }

  private static calculateStatUpdates(activity: any, userStats: any, user: any) {
    const stats: any = {};
    const monthly: any = {};

    switch (activity.type) {
      case 'project_created':
        stats.projectsCreated = userStats.projectsCreated + 1;
        monthly.projects = (monthly.projects || 0) + 1;
        break;
      case 'project_completed':
        stats.projectsCompleted = userStats.projectsCompleted + 1;
        monthly.projects = (monthly.projects || 0) + 1;
        break;
      case 'event_attended':
        stats.eventsAttended = userStats.eventsAttended + 1;
        monthly.events = (monthly.events || 0) + 1;
        break;
      case 'mentorship_session':
        stats.mentorshipSessions = userStats.mentorshipSessions + 1;
        monthly.mentorships = (monthly.mentorships || 0) + 1;
        break;
      case 'skill_endorsed':
        stats.skillEndorsements = userStats.skillEndorsements + 1;
        break;
    }

    return { stats, monthly };
  }

  private static updateStreak(userStats: any) {
    const today = new Date();
    const lastActivity = new Date(userStats.streaks.lastActivity);
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      userStats.streaks.current += 1;
      userStats.streaks.longest = Math.max(userStats.streaks.longest, userStats.streaks.current);
    } else if (daysDiff > 1) {
      userStats.streaks.current = 1;
    }
    userStats.streaks.lastActivity = today;
  }

  // Optimize badge checking with caching
  public static async checkAndAwardBadges(userId: string, userStats: any, user: any) {
    // Cache badges and achievements in memory
    const [badges, existingAchievements] = await Promise.all([
      Badge.find().lean(),
      Achievement.find({ user: userId }).select('badge').lean()
    ]);

    const earnedBadgeIds = new Set(existingAchievements.map(a => a.badge.toString()));
    const newBadges: Badge[] = [];
    const operations: Promise<any>[] = [];

    badges.forEach(badge => {
      if (earnedBadgeIds.has(badge._id.toString())) return;

      const currentValue = this.getCurrentValue(badge.criteria.metric, userStats, user);
      if (this.checkBadgeRequirement(badge, currentValue)) {
        operations.push(
          Achievement.create({
            user: userId,
            badge: badge._id,
            progress: currentValue,
            isCompleted: true
          })
        );

        userStats.totalPoints += badge.points;
        this.updateCategoryScore(userStats, badge.category, badge.points);
        operations.push(this.sendBadgeNotification(userId, badge));
        newBadges.push(badge);
      }
    });

    // Execute all database operations in parallel
    await Promise.all(operations);
    return newBadges;
  }

  private static getCurrentValue(metric: string, userStats: any, user: any): number {
    const metricMap: Record<string, () => number> = {
      mentorshipSessions: () => userStats.mentorshipSessions,
      mentorRating: () => user.mentorRating,
      projectsCreated: () => userStats.projectsCreated,
      projectsCompleted: () => userStats.projectsCompleted,
      eventsAttended: () => userStats.eventsAttended,
      skillCount: () => user.skills?.length || 0,
      skillEndorsements: () => userStats.skillEndorsements,
      teamsJoined: () => user.teamStats?.teamsJoined || 0,
      teamsLed: () => user.teamStats?.teamsLed || 0,
      hackathonWins: () => user.teamStats?.hackathonWins || 0,
      competitionWins: () => user.teamStats?.competitionWins || 0,
      perfectTeamRatings: () => user.teamStats?.perfectTeamRatings || 0,
      level: () => userStats.level,
      currentStreak: () => userStats.streaks.current
    };

    return metricMap[metric]?.() || 0;
  }

  private static checkBadgeRequirement(badge: any, currentValue: number): boolean {
    switch (badge.criteria.type) {
      case 'count':
      case 'completion':
      case 'milestone':
      case 'streak':
        return currentValue >= badge.criteria.target;
      case 'rating':
        return currentValue >= badge.criteria.target;
      default:
        return false;
    }
  }

  private static updateCategoryScore(userStats: any, category: string, points: number) {
    switch (category) {
      case 'project':
        userStats.projectScore = (userStats.projectScore || 0) + points;
        break;
      case 'mentorship':
        userStats.mentorshipScore = (userStats.mentorshipScore || 0) + points;
        break;
      case 'collaboration':
        userStats.contributionScore += points;
        break;
    }
  }

  private static async sendBadgeNotification(userId: string, badge: any) {
    await Notification.create({
      recipient: userId,
      type: 'general',
      title: `Badge Earned: ${badge.name}`,
      message: `Congratulations! You've earned the ${badge.name} badge. ${badge.description}`
    });
  }

  static async getUserProgress(userId: string) {
    const [userStats, achievements, user] = await Promise.all([
      UserStats.findOne({ user: userId }),
      Achievement.find({ user: userId, isCompleted: true }).populate('badge'),
      User.findById(userId)
    ]);

    if (!userStats) return null;

    return {
      level: userStats.level,
      totalPoints: userStats.totalPoints,
      nextLevelPoints: (userStats.level * 100) - userStats.totalPoints,
      badges: achievements.map(a => a.badge),
      streak: userStats.streaks.current,
      stats: {
        projects: { created: userStats.projectsCreated, completed: userStats.projectsCompleted },
        mentorship: { sessions: userStats.mentorshipSessions, rating: user?.mentorRating || 0 },
        events: { attended: userStats.eventsAttended },
        skills: { count: user?.skills?.length || 0, endorsements: userStats.skillEndorsements }
      }
    };
  }

  static async getBadgeProgress(userId: string, badgeId: string) {
    const [badge, achievement, userStats, user] = await Promise.all([
      Badge.findById(badgeId),
      Achievement.findOne({ user: userId, badge: badgeId }),
      UserStats.findOne({ user: userId }),
      User.findById(userId)
    ]);

    if (!badge) return null;

    if (achievement?.isCompleted) {
      return { badge, progress: 100, earned: true, earnedAt: achievement.earnedAt };
    }

    const currentValue = userStats && user ? this.getCurrentValue(badge.criteria.metric, userStats, user) : 0;
    const progress = Math.min((currentValue / badge.criteria.target) * 100, 100);

    return { badge, progress, earned: false, currentValue, targetValue: badge.criteria.target };
  }
}