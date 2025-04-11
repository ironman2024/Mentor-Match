import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';
import theme from './theme';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Projects = React.lazy(() => import('./pages/Projects'));
const Mentorship = React.lazy(() => import('./pages/Mentorship'));
const Events = React.lazy(() => import('./pages/Events'));
const MentorshipDashboard = React.lazy(() => import('./pages/Mentorship/Dashboard'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Opportunities = React.lazy(() => import('./pages/Opportunities'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
              <CircularProgress />
            </Box>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/projects/*" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/mentorship/*" element={<ProtectedRoute><Mentorship /></ProtectedRoute>} />
                <Route path="/events/*" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                <Route 
                  path="/mentorship" 
                  element={
                    <ProtectedRoute>
                      <MentorshipDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
