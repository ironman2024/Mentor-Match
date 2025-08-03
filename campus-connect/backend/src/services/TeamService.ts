import User from '../models/User';
import Team from '../models/Team';
import TeamRequest from '../models/TeamRequest';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

export class TeamService {
  static async createTeam(teamData: {
    name: string;
    description: string;
    category: string;
    requiredSkills: string[];
    maxMembers: number;
    leaderId: string;
  }) {
    const team = new Team({
      ...teamData,
      leader: teamData.leaderId,
      members: [teamData.leaderId],
      status: 'forming'
    });

    await team.save();
    return team.populate('leader members', 'name email avatar skills');
  }

  static async getTeams(filters: {
    category?: string;
    skills?: string[];
    status?: string;
  }) {
    let query: any = {};
    
    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;
    if (filters.skills?.length) {
      query.requiredSkills = { $in: filters.skills };
    }

    return Team.find(query)
      .populate('leader members', 'name email avatar skills')
      .sort({ createdAt: -1 });
  }

  static async joinTeam(teamId: string, userId: string, message?: string) {
    const team = await Team.findById(teamId);
    if (!team) throw new Error('Team not found');
    
    if (team.members.length >= team.maxMembers) {
      throw new Error('Team is full');
    }

    if (team.members.includes(new mongoose.Types.ObjectId(userId))) {
      throw new Error('Already a member of this team');
    }

    // Create join request
    const request = new TeamRequest({
      team: teamId,
      requester: userId,
      message,
      status: 'pending'
    });

    await request.save();

    // Notify team leader
    await Notification.create({
      recipient: team.leader,
      type: 'team_join_request',
      title: 'New Team Join Request',
      message: `Someone wants to join your team "${team.name}"`,
      read: false
    });

    return request;
  }

  static async handleJoinRequest(requestId: string, action: 'accept' | 'reject', leaderId: string) {
    const request = await TeamRequest.findById(requestId).populate('team');
    if (!request) throw new Error('Request not found');

    const team = await Team.findById(request.team);
    if (!team) throw new Error('Team not found');

    if (team.leader.toString() !== leaderId) {
      throw new Error('Only team leader can handle requests');
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    await request.save();

    if (action === 'accept') {
      team.members.push(request.requester);
      await team.save();
    }

    // Notify requester
    await Notification.create({
      recipient: request.requester,
      type: `team_request_${action}ed`,
      title: `Team Request ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
      message: `Your request to join "${team.name}" has been ${action}ed`,
      read: false
    });

    return request;
  }

  static async getUserTeams(userId: string) {
    return Team.find({ members: userId })
      .populate('leader members', 'name email avatar skills')
      .sort({ createdAt: -1 });
  }

  static async getTeamRequests(teamId: string) {
    return TeamRequest.find({ team: teamId, status: 'pending' })
      .populate('requester', 'name email avatar skills');
  }

  static async leaveTeam(teamId: string, userId: string) {
    const team = await Team.findById(teamId);
    if (!team) throw new Error('Team not found');

    if (team.leader.toString() === userId) {
      throw new Error('Team leader cannot leave. Transfer leadership first.');
    }

    team.members = team.members.filter((member: any) => member.toString() !== userId);
    await team.save();

    return team;
  }

  static async getTeamProgress(teamId: string) {
    const team = await Team.findById(teamId);
    if (!team) throw new Error('Team not found');

    return {
      milestones: team.progress?.milestones || [],
      completionPercentage: team.progress?.completionPercentage || 0
    };
  }

  static async updateTeamProgress(teamId: string, progressData: {
    milestones?: Array<{
      title: string;
      description: string;
      completed: boolean;
      dueDate?: Date;
    }>;
    completionPercentage?: number;
  }) {
    const team = await Team.findById(teamId);
    if (!team) throw new Error('Team not found');

    if (!team.progress) {
      team.progress = { milestones: [], completionPercentage: 0 };
    }

    if (progressData.milestones) {
      team.progress.milestones = progressData.milestones;
    }

    if (progressData.completionPercentage !== undefined) {
      team.progress.completionPercentage = progressData.completionPercentage;
    }

    await team.save();
    return team.progress;
  }

  static async matchTeamMembers(requirements: any) {
    const { requiredSkills, projectType, teamSize } = requirements;

    const matchedUsers = await User.aggregate([
      {
        $match: {
          'skills.name': { $in: requiredSkills },
          role: 'student'
        }
      },
      {
        $addFields: {
          matchScore: {
            $sum: [
              { $multiply: [{ $size: { $setIntersection: ['$skills.name', requiredSkills] } }, 2] },
              { $multiply: [{ $ifNull: ['$teamStats.averageTeamRating', 0] }, 1.5] },
              { $multiply: [{ $size: { $ifNull: ['$completedProjects', []] } }, 1] }
            ]
          }
        }
      },
      { $sort: { matchScore: -1 } },
      { $limit: teamSize }
    ]);

    return matchedUsers;
  }

  static async calculateTeamCompatibility(members: string[]) {
    const users = await User.find({ _id: { $in: members } });
    
    const skillOverlap = this.calculateSkillOverlap(users);
    const experienceBalance = this.calculateExperienceBalance(users);
    const roleCompatibility = this.calculateRoleCompatibility(users);

    return {
      overall: (skillOverlap + experienceBalance + roleCompatibility) / 3,
      details: {
        skillOverlap,
        experienceBalance,
        roleCompatibility
      }
    };
  }

  private static calculateSkillOverlap(users: any[]) {
    if (users.length < 2) return 100;
    
    const allSkills = users.flatMap(user => user.skills?.map((s: any) => s.name) || []);
    const uniqueSkills = [...new Set(allSkills)];
    const overlapScore = (allSkills.length - uniqueSkills.length) / allSkills.length * 100;
    
    return Math.max(0, Math.min(100, overlapScore));
  }

  private static calculateExperienceBalance(users: any[]) {
    if (users.length < 2) return 100;
    
    const experiences = users.map(user => user.experiences?.length || 0);
    const avg = experiences.reduce((a, b) => a + b, 0) / experiences.length;
    const variance = experiences.reduce((acc, exp) => acc + Math.pow(exp - avg, 2), 0) / experiences.length;
    
    return Math.max(0, 100 - variance * 10);
  }

  private static calculateRoleCompatibility(users: any[]) {
    const roles = users.map(user => user.role);
    const uniqueRoles = new Set(roles);
    
    return uniqueRoles.size === roles.length ? 100 : 50;
  }
}
