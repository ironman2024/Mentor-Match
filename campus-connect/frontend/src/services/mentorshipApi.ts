import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const mentorshipApi = {
  // Basic mentorship
  getMentors: () => axios.get(`${API_BASE}/mentorship/mentors`, { headers: getAuthHeaders() }),
  requestMentorship: (data: any) => axios.post(`${API_BASE}/mentorship/request`, data, { headers: getAuthHeaders() }),
  rateMentor: (mentorId: string, data: any) => axios.post(`${API_BASE}/mentorship/rate/${mentorId}`, data, { headers: getAuthHeaders() }),
  
  // Enhanced mentorship
  discoverMentors: (filters: any) => axios.get(`${API_BASE}/mentorship-enhanced/discover`, { params: filters, headers: getAuthHeaders() }),
  getMentorCalendar: (mentorId: string, month: number, year: number) => 
    axios.get(`${API_BASE}/mentorship-enhanced/mentor/${mentorId}/calendar`, { params: { month, year }, headers: getAuthHeaders() }),
  scheduleEnhancedSession: (data: any) => axios.post(`${API_BASE}/mentorship-enhanced/schedule-session`, data, { headers: getAuthHeaders() }),
  getAnalytics: (role: string) => axios.get(`${API_BASE}/mentorship-enhanced/analytics`, { params: { role }, headers: getAuthHeaders() }),
  
  // Availability
  getAvailability: () => axios.get(`${API_BASE}/mentor-availability`, { headers: getAuthHeaders() }),
  updateAvailability: (data: any) => axios.put(`${API_BASE}/mentor-availability`, data, { headers: getAuthHeaders() }),
  getAvailableSlots: (mentorId: string, date: string) => 
    axios.get(`${API_BASE}/mentor-availability/${mentorId}/slots/${date}`, { headers: getAuthHeaders() }),
  
  // Reviews
  getMentorReviews: (mentorId: string, params?: any) => 
    axios.get(`${API_BASE}/mentor-reviews/mentor/${mentorId}`, { params, headers: getAuthHeaders() }),
  submitReview: (data: any) => axios.post(`${API_BASE}/mentor-reviews`, data, { headers: getAuthHeaders() }),
  
  // Session scheduling
  scheduleSessions: (data: any) => axios.post(`${API_BASE}/session-scheduling`, data, { headers: getAuthHeaders() }),
  getMySessions: (params?: any) => axios.get(`${API_BASE}/session-scheduling/my-sessions`, { params, headers: getAuthHeaders() }),
  updateSessionStatus: (sessionId: string, data: any) => 
    axios.patch(`${API_BASE}/session-scheduling/${sessionId}/status`, data, { headers: getAuthHeaders() }),
};