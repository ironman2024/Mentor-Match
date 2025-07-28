import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../config/axios';

type UserRole = 'student' | 'alumni' | 'faculty' | 'club';

interface User {
  _id: string;  // Change from id to _id to match MongoDB
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  skills: string[];
  reputation: number;
  badges: string[];
  needsMentorSetup?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const API_URL = 'http://localhost:5002/api'; // Update API URL to point directly to backend

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update token management
  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${API_URL}/auth/me`);
          setUser(response.data);
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Update user state with proper user data
        const userData = {
          _id: response.data.user._id || response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          avatar: response.data.user.avatar,
          skills: response.data.user.skills || [],
          reputation: response.data.user.reputation || 0,
          badges: response.data.user.badges || [],
          needsMentorSetup: response.data.user.needsMentorSetup
        };
        
        setUser(userData);
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      // Throw a more descriptive error
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  };

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Update axios interceptors
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.withCredentials = true;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser,
      isAuthenticated: !!user, 
      loading,
      error 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
function setIsAuthenticated(arg0: boolean) {
  throw new Error('Function not implemented.');
}

