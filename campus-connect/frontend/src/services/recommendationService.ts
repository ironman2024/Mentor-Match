import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

export interface RecommendationFilters {
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  projectType?: 'software' | 'hardware' | 'hybrid';
  skills?: string[];
  limit?: number;
}

class RecommendationService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getProjectRecommendations(filters?: RecommendationFilters) {
    try {
      const params = new URLSearchParams();
      if (filters?.complexity) params.append('complexity', filters.complexity);
      if (filters?.projectType) params.append('projectType', filters.projectType);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.skills) {
        filters.skills.forEach(skill => params.append('skills', skill));
      }

      const response = await axios.get(
        `${API_BASE_URL}/projects/recommendations?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching project recommendations:', error);
      throw error;
    }
  }

  async getMentorRecommendations(filters?: { skills?: string[]; limit?: number }) {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.skills) {
        filters.skills.forEach(skill => params.append('skills', skill));
      }

      const response = await axios.get(
        `${API_BASE_URL}/mentors/recommendations?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching mentor recommendations:', error);
      throw error;
    }
  }

  async getTeamRecommendations(projectId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/teams/recommendations/${projectId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching team recommendations:', error);
      throw error;
    }
  }

  async recordInteraction(type: 'view' | 'apply' | 'like', itemId: string, itemType: 'project' | 'mentor' | 'opportunity') {
    try {
      await axios.post(
        `${API_BASE_URL}/recommendations/interaction`,
        { type, itemId, itemType },
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }
}

export default new RecommendationService();