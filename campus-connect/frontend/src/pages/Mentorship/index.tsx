import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MentorshipDashboard from './Dashboard';
import Mentorship from '../Mentorship';

const MentorshipRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === 'faculty' || user.role === 'alumni') {
    return <Navigate to="/mentorship/dashboard" />;
  }

  return <Mentorship />;
};

export default MentorshipRouter;
