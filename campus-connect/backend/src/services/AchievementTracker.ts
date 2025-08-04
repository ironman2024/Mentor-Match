import { BadgeService } from './BadgeService';
import LeaderboardService from './LeaderboardService';

class AchievementTracker {
  // Track project-related achievements
  static async trackProjectCreated(userId: string, projectId: string) {
    await BadgeService.processUserActivity(userId, { type: 'project_created', metadata: { projectId } });
    await LeaderboardService.updateLeaderboards();
  }

  static async trackProjectCompleted(userId: string, projectId: string) {
    await BadgeService.processUserActivity(userId, { type: 'project_completed', metadata: { projectId } });
    await LeaderboardService.updateLeaderboards();
  }

  // Track event-related achievements
  static async trackEventAttended(userId: string, eventId: string) {
    await BadgeService.processUserActivity(userId, { type: 'event_attended', metadata: { eventId } });
    await LeaderboardService.updateLeaderboards();
  }

  // Track mentorship-related achievements
  static async trackMentorshipSession(userId: string, sessionId: string) {
    await BadgeService.processUserActivity(userId, { type: 'mentorship_session', metadata: { sessionId } });
    await LeaderboardService.updateLeaderboards();
  }

  // Track skill endorsements
  static async trackSkillEndorsement(userId: string) {
    await BadgeService.processUserActivity(userId, { type: 'skill_endorsed' });
    await LeaderboardService.updateLeaderboards();
  }

  // Initialize user stats for new users
  static async initializeUserStats(userId: string) {
    // No need for initialization call as processUserActivity handles user stats creation
  }
}

export default AchievementTracker;