import express, { Request, Response } from 'express';
import Badge from '../models/Badge';
import Achievement from '../models/Achievement';
import UserStats from '../models/UserStats';
import { BadgeService } from '../services/BadgeService';
import LeaderboardService from '../services/LeaderboardService';
import { AchievementTrackingService } from '../services/AchievementTrackingService';
import AchievementNotificationService from '../services/AchievementNotificationService';
import auth from '../middleware/auth';

const router = express.Router();

// Get all badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find().sort({ category: 1, rarity: 1 });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Get user achievements
router.get('/achievements', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const achievements = await Achievement.find({ user: user._id })
      .populate('badge')
      .sort({ earnedAt: -1 });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get user stats
router.get('/stats', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const stats = await UserStats.findOne({ user: user._id });
    res.json(stats || { user: user._id, totalPoints: 0, level: 1 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get leaderboard
router.get('/leaderboard/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { period = 'all-time', limit = 50 } = req.query;
    
    const leaderboard = await LeaderboardService.getLeaderboard(
      type, 
      period as string, 
      parseInt(limit as string)
    );
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user rank
router.get('/rank/:type', auth, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { period = 'all-time' } = req.query;
    const user = (req as any).user;
    
    const rank = await LeaderboardService.getUserRank(
      user._id, 
      type, 
      period as string
    );
    
    res.json(rank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
});

// Initialize badges (admin only)
router.post('/initialize', auth, async (req: Request, res: Response) => {
  try {
    await BadgeService.initializeBadges();
    res.json({ message: 'Badges initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize badges' });
  }
});

// Get badge progress for user
router.get('/progress/:badgeId', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const progress = await BadgeService.getBadgeProgress(user._id, req.params.badgeId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch badge progress' });
  }
});

// Get all badge progress for user
router.get('/progress', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const badges = await Badge.find();
    const progressList = await Promise.all(
      badges.map(badge => BadgeService.getBadgeProgress(user._id, badge._id.toString()))
    );
    res.json(progressList.filter((p: any) => p !== null));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch badge progress' });
  }
});

// Get badges by category
router.get('/category/:category', async (req, res) => {
  try {
    const badges = await Badge.find({ category: req.params.category }).sort({ rarity: 1 });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch badges by category' });
  }
});

// Get user achievement analytics
router.get('/analytics', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const achievements = await Achievement.find({ user: user._id }).populate('badge');
    const stats = await UserStats.findOne({ user: user._id });
    
    const analytics = {
      totalBadges: achievements.length,
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
        .slice(0, 5),
      level: stats?.level || 1,
      totalPoints: stats?.totalPoints || 0,
      nextLevelPoints: ((stats?.level || 1) * 100) - (stats?.totalPoints || 0)
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get weekly leaderboard
router.get('/leaderboard/:type/weekly', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50 } = req.query;
    
    const leaderboard = await LeaderboardService.getLeaderboard(
      type, 
      'weekly', 
      parseInt(limit as string)
    );
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

// Update leaderboards (admin only)
router.post('/leaderboards/update', auth, async (req: Request, res: Response) => {
  try {
    await LeaderboardService.updateLeaderboards();
    res.json({ message: 'Leaderboards updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leaderboards' });
  }
});

// Get comprehensive achievement analytics
router.get('/analytics/comprehensive', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const analytics = await AchievementTrackingService.getAchievementAnalytics(user._id);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comprehensive analytics' });
  }
});

// Track achievement manually (for testing/admin)
router.post('/track/:type', auth, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { action, targetId, value } = req.body;
    const user = (req as any).user;
    
    const activityType = type === 'project' && action === 'created' ? 'project_created' :
                        type === 'project' && action === 'completed' ? 'project_completed' :
                        type === 'event' ? 'event_attended' :
                        type === 'mentorship' ? 'mentorship_session' :
                        type === 'skill' ? 'skill_endorsed' :
                        type === 'collaboration' && action === 'joined' ? 'team_joined' :
                        type === 'collaboration' && action === 'led' ? 'team_led' :
                        type === 'collaboration' && action === 'won_hackathon' ? 'hackathon_won' :
                        'project_created';
    
    await AchievementTrackingService.trackActivity(user._id, {
      type: activityType as any,
      value,
      metadata: { targetId }
    });
    
    res.json({ message: 'Achievement tracked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track achievement' });
  }
});

// Get achievement summary for different periods
router.get('/summary/:period', auth, async (req: Request, res: Response) => {
  try {
    const { period } = req.params;
    const user = (req as any).user;
    const summary = await AchievementNotificationService.getAchievementSummary(
      user._id, 
      period as 'week' | 'month' | 'all'
    );
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievement summary' });
  }
});

// Get badges available for earning (not yet earned)
router.get('/available', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const earnedAchievements = await Achievement.find({ 
      user: user._id, 
      isCompleted: true 
    }).select('badge');
    
    const earnedBadgeIds = earnedAchievements.map(a => a.badge.toString());
    const availableBadges = await Badge.find({ 
      _id: { $nin: earnedBadgeIds } 
    }).sort({ category: 1, rarity: 1 });
    
    // Get progress for each available badge
    const badgesWithProgress = await Promise.all(
      availableBadges.map(async (badge) => {
        const progress = await BadgeService.getBadgeProgress(user._id, badge._id.toString());
        return progress;
      })
    );
    
    res.json(badgesWithProgress.filter((b: any) => b !== null));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available badges' });
  }
});

// Get badge recommendations based on user activity
router.get('/recommendations', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userStats = await UserStats.findOne({ user: user._id });
    const earnedAchievements = await Achievement.find({ 
      user: user._id, 
      isCompleted: true 
    }).select('badge');
    
    const earnedBadgeIds = earnedAchievements.map(a => a.badge.toString());
    const availableBadges = await Badge.find({ 
      _id: { $nin: earnedBadgeIds } 
    });
    
    // Calculate recommendations based on user's current stats
    const recommendations: any[] = [];
    
    for (const badge of availableBadges) {
      const progress = await BadgeService.getBadgeProgress(user._id, badge._id.toString());
      if (progress && progress.progress > 50) {
        recommendations.push({
          ...progress,
          priority: progress.progress > 80 ? 'high' : 'medium'
        });
      }
    }
    
    // Sort by progress descending
    recommendations.sort((a, b) => b.progress - a.progress);
    
    res.json(recommendations.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch badge recommendations' });
  }
});

export default router;