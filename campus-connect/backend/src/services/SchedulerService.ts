// import cron from 'node-cron';
import LeaderboardService from './LeaderboardService';
import { BadgeService } from './BadgeService';

class SchedulerService {
  static init() {
    // TODO: Install node-cron package to enable scheduled tasks
    // Update leaderboards every hour
    // cron.schedule('0 * * * *', async () => {
    //   console.log('Updating leaderboards...');
    //   try {
    //     await LeaderboardService.updateLeaderboards();
    //     console.log('Leaderboards updated successfully');
    //   } catch (error) {
    //     console.error('Failed to update leaderboards:', error);
    //   }
    // });

    // Initialize badges on startup
    this.initializeBadges();
  }

  private static async initializeBadges() {
    try {
      await BadgeService.initializeBadges();
      console.log('Badges initialized successfully');
    } catch (error) {
      console.error('Failed to initialize badges:', error);
    }
  }
}

export default SchedulerService;