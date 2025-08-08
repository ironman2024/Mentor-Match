import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';
import { authStyles } from '../theme/theme';
import axios from 'axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');
    
    if (oauthError) {
      setError('Google authentication failed. Please try again.');
    }
    
    if (token) {
      // Handle OAuth success
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user info and redirect
      axios.get('http://localhost:5002/api/auth/me')
        .then(response => {
          updateUser(response.data);
          navigate('/dashboard');
        })
        .catch(err => {
          console.error('Error fetching user:', err);
          setError('Authentication failed. Please try again.');
        });
    }
  }, [searchParams, navigate, updateUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      const response = await login(email, password);
      
      // Check if mentor setup is needed
      if (response.user.needsMentorSetup && (response.user.role === 'alumni' || response.user.role === 'faculty')) {
        navigate('/mentor-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <Box sx={authStyles.container}>
      <Container maxWidth="sm">
        <Paper sx={authStyles.paper}>
          <Typography variant="h4" align="center" sx={authStyles.title}>
            Welcome Back
          </Typography>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                '& .MuiAlert-icon': { color: '#585E6C' }
              }}
            >
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={authStyles.input}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={authStyles.input}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={authStyles.button}
            >
              Sign In
            </Button>
            
            <Divider sx={{ my: 3, color: '#B5BBC9' }}>or</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => {
                // Check if Google OAuth is configured
                if (process.env.NODE_ENV === 'development') {
                  alert('Google OAuth is not configured yet. Please set up Google OAuth credentials in the backend .env file.');
                  return;
                }
                window.location.href = 'http://localhost:5002/api/auth/google';
              }}
              sx={{
                py: 1.5,
                borderRadius: '30px',
                borderColor: '#B5BBC9',
                color: '#585E6C',
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#585E6C',
                  background: 'rgba(88,94,108,0.05)',
                }
              }}
            >
              Continue with Google
            </Button>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#B5BBC9' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#585E6C', textDecoration: 'none', fontWeight: 500 }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;