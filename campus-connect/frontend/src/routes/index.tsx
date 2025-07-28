import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import CalendarComponent from '../pages/CalendarComponent';

// Lazy loaded components
const Home = React.lazy(() => import('../pages/Home'));
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Profile = React.lazy(() => import('../pages/Profile'));
const EditProfile = React.lazy(() => import('../pages/EditProfile'));
const Projects = React.lazy(() => import('../pages/Projects'));
const Events = React.lazy(() => import('../pages/Events'));
const Mentorship = React.lazy(() => import('../pages/Mentorship'));
const MentorshipDashboard = React.lazy(() => import('../pages/Mentorship/Dashboard'));
const MentorSetup = React.lazy(() => import('../pages/MentorSetup'));
const Opportunities = React.lazy(() => import('../pages/Opportunities'));
const Inbox = React.lazy(() => import('../pages/Inbox'));
const AIChat = React.lazy(() => import('../pages/AIChat'));

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes under MainLayout */}
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
          <Route
          path="/calender"
          element={
            <ProtectedRoute>
              <CalendarComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/*"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentorship"
          element={
            <ProtectedRoute>
              <Mentorship />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentorship/dashboard"
          element={
            <ProtectedRoute requiredRoles={['faculty', 'alumni']}>
              <MentorshipDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor-setup"
          element={
            <ProtectedRoute requiredRoles={['faculty', 'alumni']}>
              <MentorSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-chat"
          element={
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
