import express from 'express';
import auth from '../middleware/auth';
import UserAchievement from '../models/UserAchievement';
import LeaderboardService from '../services/LeaderboardService';
import { AchievementTrackingService } from '../services/AchievementTrackingService';

const router = express.Router();

// Get projects leaderboard
router.get('/projects', async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;
    const leaderboard = await LeaderboardService.getLeaderboard(
      'projects', 
      period as string, 
      parseInt(limit as string)
    );
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects leaderboard' });
  }
});

// Get contributions leaderboard
router.get('/contributions', async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;
    const leaderboard = await LeaderboardService.getLeaderboard(
      'contributions', 
      period as string, 
      parseInt(limit as string)
    );
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contributions leaderboard' });
  }
});

// Get mentorship leaderboard
router.get('/mentorship', async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;
    const leaderboard = await LeaderboardService.getLeaderboard(
      'mentorship', 
      period as string, 
      parseInt(limit as string)
    );
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentorship leaderboard' });
  }
});

// Get overall leaderboard
router.get('/overall', async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;
    const leaderboard = await LeaderboardService.getLeaderboard(
      'overall', 
      period as string, 
      parseInt(limit as string)
    );
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch overall leaderboard' });
  }
});

// Get monthly leaderboard
router.get('/monthly', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const leaderboard = await LeaderboardService.getLeaderboard(
      'monthly', 
      'monthly', 
      parseInt(limit as string)
    );
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly leaderboard' });
  }
});

// Get achievement-specific leaderboards
router.get('/achievements/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const { limit = 50 } = req.query;
    
    const leaderboard = await AchievementTrackingService.getAchievementLeaderboard(
      metric, 
      parseInt(limit as string)
    );
    
    res.json({ rankings: leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievement leaderboard' });
  }
});

// Get top performers across all categories
router.get('/top-performers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topPerformers = await LeaderboardService.getTopPerformers(parseInt(limit as string));
    res.json(topPerformers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
});

// Get user's position across all leaderboards
router.get('/my-rankings', auth, async (req: any, res) => {
  try {
    const userId = req.user._id.toString();
    const [projectsRank, contributionsRank, mentorshipRank, overallRank] = await Promise.all([
      LeaderboardService.getUserRank(userId, 'projects'),
      LeaderboardService.getUserRank(userId, 'contributions'),
      LeaderboardService.getUserRank(userId, 'mentorship'),
      LeaderboardService.getUserRank(userId, 'overall')
    ]);

    res.json({
      projects: projectsRank,
      contributions: contributionsRank,
      mentorship: mentorshipRank,
      overall: overallRank
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user rankings' });
  }
});

// Get leaderboard with user context
router.get('/:type/with-user', auth, async (req: any, res) => {
  try {
    const { type } = req.params;
    const { period = 'all-time', limit = 50 } = req.query;
    const userId = req.user._id.toString();
    
    const [leaderboard, userRank] = await Promise.all([
      LeaderboardService.getLeaderboard(type, period as string, parseInt(limit as string)),
      LeaderboardService.getUserRank(userId, type, period as string)
    ]);
    
    res.json({
      ...leaderboard,
      userRank
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard with user context' });
  }
});

// Get weekly leaderboards for all types
router.get('/weekly/all', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const [projects, contributions, mentorship] = await Promise.all([
      LeaderboardService.getLeaderboard('projects', 'weekly', parseInt(limit as string)),
      LeaderboardService.getLeaderboard('contributions', 'weekly', parseInt(limit as string)),
      LeaderboardService.getLeaderboard('mentorship', 'weekly', parseInt(limit as string))
    ]);

    res.json({
      projects: projects.rankings,
      contributions: contributions.rankings,
      mentorship: mentorship.rankings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly leaderboards' });
  }
});

// Compare achievements between users
router.get('/compare/:userId1/:userId2', auth, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const comparison = await AchievementTrackingService.compareAchievements(userId1, userId2);
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: 'Failed to compare achievements' });
  }
});

// Legacy category-specific leaderboard (fallback)
router.get('/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const scoreField = `${category}Score`;

    const leaderboard = await UserAchievement.find()
      .sort({ [scoreField]: -1 })
      .limit(100)
      .populate('user', 'name avatar role')
      .lean();

    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
