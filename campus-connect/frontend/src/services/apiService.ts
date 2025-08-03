import axios from '../config/axios';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const apiService = {
  // Mentorship APIs
  mentorship: {
    getMentors: (filters?: any) => axios.get('/mentorship-enhanced/discover', { params: filters, headers: getAuthHeaders() }),
    requestMentorship: (data: any) => axios.post('/mentorship/request', data, { headers: getAuthHeaders() }),
    rateMentor: (mentorId: string, data: any) => axios.post(`/mentorship/rate/${mentorId}`, data, { headers: getAuthHeaders() }),
    getAnalytics: (role: string) => axios.get('/mentorship-enhanced/analytics', { params: { role }, headers: getAuthHeaders() }),
    getRequests: () => axios.get('/mentorship/requests', { headers: getAuthHeaders() }),
    updateRequestStatus: (requestId: string, status: string) => 
      axios.patch(`/mentorship/request/${requestId}/status`, { status }, { headers: getAuthHeaders() }),
    getDashboardStats: () => axios.get('/mentorship-enhanced/dashboard-stats', { headers: getAuthHeaders() }),
  },

  // Calendar & Availability APIs
  calendar: {
    getMentorCalendar: (mentorId: string, month: number, year: number) => 
      axios.get(`/mentorship-enhanced/mentor/${mentorId}/calendar`, { params: { month, year }, headers: getAuthHeaders() }),
    getAvailability: () => axios.get('/mentor-availability', { headers: getAuthHeaders() }),
    updateAvailability: (data: any) => axios.put('/mentor-availability', data, { headers: getAuthHeaders() }),
    getAvailableSlots: (mentorId: string, date: string) => 
      axios.get(`/mentor-availability/${mentorId}/slots/${date}`, { headers: getAuthHeaders() }),
    deleteSlot: (slotId: string) => axios.delete(`/mentor-availability/slot/${slotId}`, { headers: getAuthHeaders() }),
  },

  // Session Scheduling APIs
  sessions: {
    schedule: (data: any) => axios.post('/session-scheduling', data, { headers: getAuthHeaders() }),
    getMySessions: (params?: any) => axios.get('/session-scheduling/my-sessions', { params, headers: getAuthHeaders() }),
    updateStatus: (sessionId: string, data: any) => 
      axios.patch(`/session-scheduling/${sessionId}/status`, data, { headers: getAuthHeaders() }),
    getUpcoming: () => axios.get('/session-scheduling/upcoming', { headers: getAuthHeaders() }),
    getHistory: () => axios.get('/session-scheduling/history', { headers: getAuthHeaders() }),
    reschedule: (sessionId: string, data: any) => 
      axios.patch(`/session-scheduling/${sessionId}/reschedule`, data, { headers: getAuthHeaders() }),
    cancel: (sessionId: string, reason?: string) => 
      axios.patch(`/session-scheduling/${sessionId}/cancel`, { reason }, { headers: getAuthHeaders() }),
  },

  // Notifications APIs
  notifications: {
    getAll: () => axios.get('/notifications', { headers: getAuthHeaders() }),
    markAsRead: (id: string) => axios.patch(`/notifications/${id}`, { read: true }, { headers: getAuthHeaders() }),
    markAllAsRead: () => axios.patch('/notifications/mark-all-read', {}, { headers: getAuthHeaders() }),
    getUnreadCount: () => axios.get('/notifications/unread-count', { headers: getAuthHeaders() }),
  },

  // Reviews APIs
  reviews: {
    getMentorReviews: (mentorId: string, params?: any) => 
      axios.get(`/mentor-reviews/mentor/${mentorId}`, { params, headers: getAuthHeaders() }),
    submitReview: (data: any) => axios.post('/mentor-reviews', data, { headers: getAuthHeaders() }),
  },

  // Analytics APIs
  analytics: {
    getDashboardMetrics: () => axios.get('/analytics/dashboard', { headers: getAuthHeaders() }),
    getMentorshipMetrics: () => axios.get('/analytics/mentorship', { headers: getAuthHeaders() }),
    getSessionMetrics: () => axios.get('/analytics/sessions', { headers: getAuthHeaders() }),
    getEngagementMetrics: () => axios.get('/analytics/engagement', { headers: getAuthHeaders() }),
    getComprehensiveMetrics: () => axios.get('/analytics/comprehensive', { headers: getAuthHeaders() }),
  },
};

// Export for backward compatibility
export { apiService as mentorshipApi };
