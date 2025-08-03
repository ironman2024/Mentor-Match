import User from '../models/User';
import { calculateSkillCompatibility } from '../utils/skillUtils';

export class TeamMatchingService {
  static async findTeamMembers(requirements: {
    requiredSkills: string[];
    teamSize: number;
    projectType: string;
    excludeUsers?: string[];
  }) {
    const { requiredSkills, teamSize, projectType, excludeUsers = [] } = requirements;

    // Find users with matching skills
    const potentialMembers = await User.find({
      _id: { $nin: excludeUsers },
      skills: { 
        $elemMatch: { 
          name: { $in: requiredSkills },
          proficiency: { $gte: 3 }
        }
      }
    }).select('name skills mentorshipStats teamStats');

    // Score each potential member
    const scoredMembers = potentialMembers.map(member => ({
      user: member,
      score: this.calculateMemberScore(member, requiredSkills, projectType)
    }));

    // Sort by score and get top matches
    return scoredMembers
      .sort((a, b) => b.score - a.score)
      .slice(0, teamSize - 1);
  }

  private static calculateMemberScore(user: any, requiredSkills: string[], projectType: string) {
    const skillScore = calculateSkillCompatibility(user.skills, requiredSkills);
    const experienceScore = user.teamStats.projectsCompleted * 0.3;
    const ratingScore = user.teamStats.averageTeamRating * 0.2;
    
    return skillScore + experienceScore + ratingScore;
  }
}