import BadgeService from './BadgeService';
import LeaderboardService from './LeaderboardService';

class AchievementTracker {
  // Track project-related achievements
  static async trackProjectCreated(userId: string, projectId: string) {
    await BadgeService.updateUserStats(userId, 'projectCreated', 1, { projectId });
    await LeaderboardService.updateLeaderboards();
  }

  static async trackProjectCompleted(userId: string, projectId: string) {
    await BadgeService.updateUserStats(userId, 'projectCompleted', 1, { projectId });
    await LeaderboardService.updateLeaderboards();
  }

  // Track event-related achievements
  static async trackEventAttended(userId: string, eventId: string) {
    await BadgeService.updateUserStats(userId, 'eventAttended', 1, { eventId });
    await LeaderboardService.updateLeaderboards();
  }

  // Track mentorship-related achievements
  static async trackMentorshipSession(userId: string, sessionId: string) {
    await BadgeService.updateUserStats(userId, 'mentorshipSession', 1, { mentorshipId: sessionId });
    await LeaderboardService.updateLeaderboards();
  }

  // Track skill endorsements
  static async trackSkillEndorsement(userId: string) {
    await BadgeService.updateUserStats(userId, 'skillEndorsement', 1);
    await LeaderboardService.updateLeaderboards();
  }

  // Initialize user stats for new users
  static async initializeUserStats(userId: string) {
    await BadgeService.updateUserStats(userId, 'initialization', 0);
  }
}

export default AchievementTracker;