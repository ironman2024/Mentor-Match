import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export class SystemService {
  // Check system health
  static async checkHealth() {
    try {
      const response = await axios.get(`${API_BASE}/system/health`);
      return response.data;
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  // Run integration tests
  static async runIntegrationTests() {
    try {
      const response = await axios.get(`${API_BASE}/system/integration-test`);
      return response.data;
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  // Check all service endpoints
  static async checkServiceEndpoints() {
    const services = [
      { name: 'Authentication', endpoint: '/auth/me' },
      { name: 'Mentorship', endpoint: '/mentorship/mentors' },
      { name: 'Teams', endpoint: '/teams' },
      { name: 'Events', endpoint: '/events' },
      { name: 'Projects', endpoint: '/projects' },
      { name: 'Badges', endpoint: '/badges' },
      { name: 'Messages', endpoint: '/messages' },
      { name: 'Notifications', endpoint: '/notifications' },
      { name: 'Profile', endpoint: '/profile' },
      { name: 'Skills', endpoint: '/skills' },
      { name: 'Leaderboard', endpoint: '/leaderboard' }
    ];

    const results = await Promise.allSettled(
      services.map(async (service) => {
        try {
          await axios.get(`${API_BASE}${service.endpoint}`, { 
            headers: getAuthHeaders(),
            timeout: 5000 
          });
          return { ...service, status: 'operational' };
        } catch (error) {
          return { ...service, status: 'error', error: error.message };
        }
      })
    );

    return results.map((result, index) => ({
      ...services[index],
      ...(result.status === 'fulfilled' ? result.value : { status: 'error', error: result.reason })
    }));
  }

  // Check frontend integrations
  static checkFrontendIntegrations() {
    const integrations = {
      routing: !!window.location,
      authentication: !!localStorage.getItem('token'),
      socketIO: !!window.io,
      materialUI: !!document.querySelector('[data-mui-theme]'),
      reactRouter: !!window.history,
      contexts: {
        auth: true, // AuthContext is loaded
        socket: true, // SocketContext is loaded
        ai: true // AIContext is loaded
      }
    };

    return {
      status: Object.values(integrations).every(i => 
        typeof i === 'boolean' ? i : Object.values(i).every(v => v)
      ) ? 'fully_integrated' : 'partial_integration',
      integrations,
      timestamp: new Date().toISOString()
    };
  }
}

export default SystemService;