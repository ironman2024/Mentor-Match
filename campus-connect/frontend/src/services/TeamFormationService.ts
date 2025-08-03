import api from '../config/axios';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  skills: string[];
  role: string;
}

export interface Team {
  _id: string;
  name: string;
  description: string;
  category: string;
  requiredSkills: string[];
  maxMembers: number;
  currentMembers: TeamMember[];
  leader: TeamMember;
  status: 'forming' | 'active' | 'completed';
  createdAt: string;
}

export interface TeamRequest {
  _id: string;
  team: string;
  requester: TeamMember;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
}

class TeamFormationService {
  // Get all available teams
  async getTeams(filters?: {
    category?: string;
    skills?: string[];
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.skills) filters.skills.forEach(skill => params.append('skills', skill));
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get(`/teams?${params.toString()}`);
    return response.data;
  }

  // Create a new team
  async createTeam(teamData: {
    name: string;
    description: string;
    category: string;
    requiredSkills: string[];
    maxMembers: number;
  }) {
    const response = await api.post('/teams', teamData);
    return response.data;
  }

  // Join a team
  async joinTeam(teamId: string, message?: string) {
    const response = await api.post(`/teams/${teamId}/join`, { message });
    return response.data;
  }

  // Get user's teams
  async getMyTeams() {
    const response = await api.get('/teams/my-teams');
    return response.data;
  }

  // Get team details
  async getTeamDetails(teamId: string) {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  }

  // Handle team join requests (for team leaders)
  async handleJoinRequest(requestId: string, action: 'accept' | 'reject') {
    const response = await api.patch(`/teams/requests/${requestId}`, { action });
    return response.data;
  }

  // Get team join requests
  async getTeamRequests(teamId: string) {
    const response = await api.get(`/teams/${teamId}/requests`);
    return response.data;
  }

  // Leave a team
  async leaveTeam(teamId: string) {
    const response = await api.delete(`/teams/${teamId}/leave`);
    return response.data;
  }

  // Update team
  async updateTeam(teamId: string, updates: Partial<Team>) {
    const response = await api.patch(`/teams/${teamId}`, updates);
    return response.data;
  }

  // Get team progress
  async getTeamProgress(teamId: string) {
    const response = await api.get(`/teams/${teamId}/progress`);
    return response.data;
  }

  // Update team progress
  async updateTeamProgress(teamId: string, progressData: {
    milestones?: Array<{
      title: string;
      description: string;
      completed: boolean;
      dueDate?: string;
    }>;
    completionPercentage?: number;
  }) {
    const response = await api.patch(`/teams/${teamId}/progress`, progressData);
    return response.data;
  }
}

export default new TeamFormationService();