import { Request, Response } from 'express';
import { MentorshipDashboardService } from '../services/mentorshipDashboard';

const dashboardService = new MentorshipDashboardService();

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [stats, mentorships, events, activities] = await Promise.all([
      dashboardService.getDashboardStats(userId),
      dashboardService.getMentorshipOverview(userId),
      dashboardService.getUpcomingEvents(),
      dashboardService.getRecentActivity(userId)
    ]);

    res.json({
      stats,
      mentorships,
      upcomingEvents: events,
      recentActivity: activities
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMentorshipStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const stats = await dashboardService.getDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch mentorship stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMentorshipOverview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const mentorships = await dashboardService.getMentorshipOverview(userId, limit);
    res.json(mentorships);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch mentorship overview',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};