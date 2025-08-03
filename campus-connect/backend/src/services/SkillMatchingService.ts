import { Skill, UserSkill, IUserSkill } from '../models/Skill';
import User from '../models/User';
import Team from '../models/Team';
import mongoose from 'mongoose';

interface SkillCompatibility {
  userId: string;
  compatibilityScore: number;
  matchingSkills: string[];
  complementarySkills: string[];
  overallRating: number;
}

interface TeamRecommendation {
  teamId: string;
  teamName: string;
  compatibilityScore: number;
  requiredSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
}

class SkillMatchingService {
  private static readonly PROFICIENCY_WEIGHTS = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4
  };

  static async calculateSkillCompatibility(
    userId: string, 
    targetUserId: string
  ): Promise<SkillCompatibility> {
    const [userSkills, targetSkills] = await Promise.all([
      UserSkill.find({ user: userId }).populate('skill'),
      UserSkill.find({ user: targetUserId }).populate('skill')
    ]);

    const userSkillMap = new Map(userSkills.map(us => [us.skill._id.toString(), us]));
    const targetSkillMap = new Map(targetSkills.map(us => [us.skill._id.toString(), us]));

    let totalScore = 0;
    let matchingSkills: string[] = [];
    let complementarySkills: string[] = [];

    // Calculate matching skills score
    for (const [skillId, userSkill] of userSkillMap) {
      const targetSkill = targetSkillMap.get(skillId);
      if (targetSkill) {
        const userWeight = this.PROFICIENCY_WEIGHTS[userSkill.proficiencyLevel];
        const targetWeight = this.PROFICIENCY_WEIGHTS[targetSkill.proficiencyLevel];
        const skillScore = Math.min(userWeight, targetWeight) / 4 * 100;
        totalScore += skillScore;
        matchingSkills.push((userSkill.skill as any).name);
      }
    }

    // Find complementary skills
    for (const [skillId, targetSkill] of targetSkillMap) {
      if (!userSkillMap.has(skillId)) {
        complementarySkills.push((targetSkill.skill as any).name);
      }
    }

    const compatibilityScore = matchingSkills.length > 0 
      ? totalScore / matchingSkills.length 
      : 0;

    return {
      userId: targetUserId,
      compatibilityScore,
      matchingSkills,
      complementarySkills,
      overallRating: Math.min(compatibilityScore, 100)
    };
  }

  static async findSkillBasedMentors(
    userId: string, 
    requiredSkills: string[]
  ): Promise<SkillCompatibility[]> {
    const skillIds = await Skill.find({ 
      name: { $in: requiredSkills } 
    }).distinct('_id');

    const mentorSkills = await UserSkill.find({
      skill: { $in: skillIds },
      proficiencyLevel: { $in: ['advanced', 'expert'] }
    }).populate('user skill');

    const mentorMap = new Map<string, IUserSkill[]>();
    
    mentorSkills.forEach(skill => {
      const userId = skill.user._id.toString();
      if (!mentorMap.has(userId)) {
        mentorMap.set(userId, []);
      }
      mentorMap.get(userId)!.push(skill);
    });

    const recommendations: SkillCompatibility[] = [];

    for (const [mentorId, skills] of mentorMap) {
      if (mentorId === userId) continue;

      const matchingSkills = skills
        .filter(s => requiredSkills.includes((s.skill as any).name))
        .map(s => (s.skill as any).name);

      const compatibilityScore = skills.reduce((acc, skill) => {
        return acc + this.PROFICIENCY_WEIGHTS[skill.proficiencyLevel] * 25;
      }, 0) / skills.length;

      recommendations.push({
        userId: mentorId,
        compatibilityScore,
        matchingSkills,
        complementarySkills: [],
        overallRating: Math.min(compatibilityScore, 100)
      });
    }

    return recommendations.sort((a, b) => b.overallRating - a.overallRating);
  }

  static async recommendTeams(
    userId: string, 
    userSkills: string[]
  ): Promise<TeamRecommendation[]> {
    const teams = await Team.find({ 
      status: 'recruiting',
      'members.user': { $ne: userId }
    }).populate('members.user requiredSkills');

    const recommendations: TeamRecommendation[] = [];

    for (const team of teams) {
      const requiredSkills = team.requiredSkills || [];
      const matchingSkills = userSkills.filter(skill => 
        requiredSkills.includes(skill)
      );
      
      const missingSkills = requiredSkills.filter(skill => 
        !userSkills.includes(skill)
      );

      const compatibilityScore = requiredSkills.length > 0 
        ? (matchingSkills.length / requiredSkills.length) * 100 
        : 0;

      if (compatibilityScore > 30) {
        recommendations.push({
          teamId: team._id.toString(),
          teamName: team.name,
          compatibilityScore,
          requiredSkills,
          matchingSkills,
          missingSkills
        });
      }
    }

    return recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  static async endorseSkill(
    skillId: string, 
    userId: string, 
    endorserId: string, 
    comment?: string
  ): Promise<boolean> {
    const userSkill = await UserSkill.findOne({ 
      user: userId, 
      skill: skillId 
    });

    if (!userSkill) return false;

    const existingEndorsement = userSkill.endorsements.find(
      e => e.endorser.toString() === endorserId
    );

    if (existingEndorsement) return false;

    userSkill.endorsements.push({
      endorser: new mongoose.Types.ObjectId(endorserId),
      comment,
      createdAt: new Date()
    });

    await userSkill.save();
    return true;
  }

  static async validateSkill(skillId: string, userId: string): Promise<boolean> {
    const userSkill = await UserSkill.findOne({ 
      user: userId, 
      skill: skillId 
    });

    if (!userSkill) return false;

    // Auto-validate if user has 3+ endorsements
    if (userSkill.endorsements.length >= 3) {
      userSkill.verified = true;
      await userSkill.save();
      return true;
    }

    return false;
  }
}

export default SkillMatchingService;