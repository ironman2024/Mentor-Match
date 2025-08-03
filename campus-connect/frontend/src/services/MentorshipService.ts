import axios from 'axios';

const API_URL = 'http://localhost:5002/api/mentorship';

export class MentorshipService {
  static async getMentorAvailability(mentorId: string) {
    const response = await axios.get(`${API_URL}/availability/${mentorId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  static async updateAvailability(schedule: any) {
    const response = await axios.post(`${API_URL}/availability/update`, schedule, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  static async scheduleSession(sessionData: any) {
    const response = await axios.post(`${API_URL}/sessions/schedule`, sessionData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  static async getMentorshipHistory() {
    const response = await axios.get(`${API_URL}/history`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  static async submitReview(sessionId: string, reviewData: any) {
    const response = await axios.post(`${API_URL}/reviews/${sessionId}`, reviewData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  static async sendMentorshipRequest(mentorId: string, requestData: any) {
    const response = await axios.post(`${API_URL}/requests/${mentorId}`, requestData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }

  static async getMentorDashboard() {
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }
}
