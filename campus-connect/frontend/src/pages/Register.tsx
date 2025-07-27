import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { authStyles } from '../theme/theme';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Registration attempt:', formData); // Debugging log
      const response = await axios.post('http://localhost:5002/api/auth/register', formData);
      console.log('Registration attempt:', formData); // Add logging
      
      if (response.status === 201) {
        navigate('/login', { 
          state: { message: 'Registration successful! Please login.' }
        });
      }
    } catch (err) {
      console.error('Registration error details:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to register. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  return (
    <Box sx={authStyles.container}>
      <Container maxWidth="sm">
        <Paper sx={authStyles.paper}>
          <Typography variant="h4" align="center" sx={authStyles.title}>
            Create Account
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
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={authStyles.input}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={authStyles.input}
            />
            <FormControl fullWidth sx={authStyles.input}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleSelectChange}
                required
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="alumni">Alumni</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="club">Club</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={authStyles.input}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={authStyles.button}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#B5BBC9' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#585E6C', textDecoration: 'none', fontWeight: 500 }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;