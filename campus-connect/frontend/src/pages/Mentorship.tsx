import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Grid, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar,
  Button, Rating, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Card, CardContent, Chip, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import MentorshipRequestPreviewDialog from '../components/dialogs/MentorshipRequestPreviewDialog';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

interface Mentor {
  _id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  expertise: string[];
  mentorRating: number;
  totalRatings: number;
  avatar?: string;
  available: boolean;
  responseRate: number;
  studentsHelped: number;
  bio?: string;
}

const Mentorship: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [openRequest, setOpenRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    department: '',
    expertise: ''
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [mentorToRate, setMentorToRate] = useState<Mentor | null>(null);

  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
    if (user?.role === 'faculty' || user?.role === 'alumni') {
      fetchPendingRequests();
    }
  }, [user]);

  const fetchMentors = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/users/mentors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Sort mentors by rating
      const sortedMentors = response.data.sort((a: Mentor, b: Mentor) => 
        (b.mentorRating || 0) - (a.mentorRating || 0)
      );
      setMentors(sortedMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/mentorship/requests', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleRequestMentorship = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setOpenRequest(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedMentor || !requestMessage.trim()) return;

    try {
      const requestData = {
        mentorId: selectedMentor._id,
        topic: 'Mentorship Request',
        message: requestMessage.trim(),
        details: {
          mentor: selectedMentor.name,
          department: selectedMentor.department,
          studentMessage: requestMessage.trim()
        }
      };

      const response = await axios.post(
        'http://localhost:5002/api/mentorship/request',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        enqueueSnackbar('Mentorship request sent successfully', { variant: 'success' });
        setOpenRequest(false);
        setSelectedMentor(null);
        setRequestMessage('');
      }
    } catch (error) {
      console.error('Error details:', error);
      enqueueSnackbar('Failed to send mentorship request', { variant: 'error' });
    }
  };

  const handlePreviewRequest = (request: any) => {
    setSelectedRequest(request);
    setPreviewOpen(true);
  };

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const response = await axios.patch(
        `http://localhost:5002/api/mentorship/requests/${requestId}`,
        { status: action },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPreviewOpen(false);
        await fetchPendingRequests();

        const message = action === 'accepted' ? 'Request accepted successfully' : 'Request declined';
        enqueueSnackbar(message, { 
          variant: action === 'accepted' ? 'success' : 'info' 
        });

        if (action === 'accepted' && response.data.chat) {
          navigate('/inbox');
        }
      }
    } catch (error: any) {
      console.error('Error handling request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process request';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleRateMentor = async (mentorId: string, rating: number) => {
    try {
      const response = await axios.post(
        `http://localhost:5002/api/mentorship/rate/${mentorId}`,
        { 
          rating,
          comment: 'Rating submitted from mentorship platform' // Add default comment
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      // Update local state with new rating
      setMentors(prev => prev.map(mentor => 
        mentor._id === mentorId 
          ? { 
              ...mentor, 
              mentorRating: response.data.newRating,
              totalRatings: mentor.totalRatings + 1
            }
          : mentor
      ));

      enqueueSnackbar('Rating submitted successfully', { variant: 'success' });
    } catch (error: any) {
      console.error('Error rating mentor:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit rating';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const searchTerms = search.toLowerCase().split(' ');
    const mentorText = `${mentor.name} ${mentor.department} ${mentor.expertise.join(' ')}`.toLowerCase();
    
    const matchesSearch = searchTerms.every(term => mentorText.includes(term));
    const matchesRole = filters.role === 'all' || mentor.role.toLowerCase() === filters.role;
    const matchesDepartment = !filters.department || 
      mentor.department.toLowerCase().includes(filters.department.toLowerCase());

    return matchesSearch && matchesRole && matchesDepartment;
  });

  return (
    <Box sx={{ 
      background: '#F8F9FB',
      minHeight: 'calc(100vh - 64px)',
      margin: -3,
      padding: 4
    }}>
      <Box maxWidth="1400px" margin="0 auto">
        {/* Header Section */}
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#585E6C',
            fontWeight: 700,
            mb: 4
          }}
        >
          Mentorship Hub
        </Typography>

        {/* Pending Requests Section */}
        {(user?.role === 'faculty' || user?.role === 'alumni') && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              mb: 4,
              background: 'white',
              border: '1px solid #B5BBC9',
              borderRadius: '8px'
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                color: '#2D3E50',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              Pending Requests
            </Typography>
            {pendingRequests.length === 0 ? (
              <Typography sx={{ color: '#596273' }}>No pending requests</Typography>
            ) : (
              <List>
                {pendingRequests.map((request: any) => (
                  <ListItem key={request._id} divider>
                    <ListItemAvatar>
                      <Avatar src={request.mentee?.avatar}>
                        {request.mentee?.name?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={request.mentee?.name}
                      secondary={
                        <>
                          <Typography variant="body2">
                            Topic: {request.topic}
                          </Typography>
                          <Typography variant="caption">
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handlePreviewRequest(request)}
                        sx={{
                          mr: 1,
                          color: '#1ABC9C',
                          borderColor: '#1ABC9C',
                          '&:hover': {
                            borderColor: '#1ABC9C',
                            background: 'rgba(26,188,156,0.05)'
                          }
                        }}
                      >
                        Preview
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}

        {/* Search and Filter Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4,
            background: 'white',
            border: '1px solid #B5BBC9',
            borderRadius: '8px'
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search mentors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#B5BBC9' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&:hover fieldset': {
                      borderColor: '#585E6C',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#B5BBC9',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#596273' }}>Role</InputLabel>
                <Select
                  value={filters.role}
                  label="Role"
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#F8F9FB'
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="alumni">Alumni</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Mentors Grid */}
        <Grid container spacing={3}>
          {filteredMentors.map((mentor) => (
            <Grid item xs={12} md={6} lg={4} key={mentor._id}>
              <Card 
                elevation={0}
                sx={{ 
                  border: '1px solid #B5BBC9',
                  borderRadius: '8px',
                  background: 'white',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(88,94,108,0.1)',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar 
                      src={mentor.avatar} 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mr: 2,
                        border: '2px solid #E74C3C'
                      }}
                    >
                      {mentor.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{mentor.name}</Typography>
                      <Typography color="textSecondary" sx={{ color: '#596273' }}>
                        {mentor.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" gutterBottom sx={{ color: '#596273' }}>
                    Department: {mentor.department || 'Not specified'}
                  </Typography>

                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" sx={{ color: '#585E6C', fontWeight: 600 }}>
                        Expertise:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {mentor.expertise.map((skill, index) => (
                          <Chip 
                            key={index}
                            label={skill}
                            size="small"
                            sx={{ 
                              borderRadius: '4px',
                              background: '#585E6C',
                              color: 'white'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Rating 
                        value={mentor.mentorRating || 0} 
                        readOnly 
                        precision={0.5}
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1, color: '#596273' }}>
                        {mentor.mentorRating?.toFixed(1) || 'No ratings'} ({mentor.totalRatings || 0})
                      </Typography>
                    </Box>
                    {user?.role === 'student' && (
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMentorToRate(mentor);
                          setRatingDialogOpen(true);
                        }}
                        sx={{
                          color: '#585E6C',
                          '&:hover': {
                            bgcolor: 'rgba(88,94,108,0.08)',
                          }
                        }}
                      >
                        Rate
                      </Button>
                    )}
                  </Box>

                  {user?.role === 'student' && (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleRequestMentorship(mentor)}
                      sx={{
                        mt: 2,
                        py: 1.5,
                        borderRadius: '8px',
                        background: '#585E6C',
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          background: '#474D59',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(88,94,108,0.25)',
                        }
                      }}
                    >
                      Request Mentorship
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Request Dialog */}
      <Dialog 
        open={openRequest} 
        onClose={() => setOpenRequest(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: { xs: 2, sm: 3 },
            border: '1px solid #B5BBC9',
            boxShadow: '0 4px 20px rgba(88,94,108,0.1)',
            background: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#585E6C', 
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '1.8rem' }
        }}>
          Request Mentorship from {selectedMentor?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ color: '#596273', mb: 2 }}>
            Send a message explaining why you'd like to connect with {selectedMentor?.name} and what you hope to learn.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your message"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Introduce yourself and describe your learning goals..."
            sx={{ 
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#585E6C',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#B5BBC9',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setOpenRequest(false)}
            sx={{ 
              color: '#B5BBC9',
              '&:hover': { bgcolor: 'rgba(88,94,108,0.05)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitRequest} 
            variant="contained"
            sx={{
              py: 1,
              px: 3,
              borderRadius: '30px',
              background: '#585E6C',
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                background: '#474D59',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(88,94,108,0.25)',
              }
            }}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      <MentorshipRequestPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        request={selectedRequest}
        onAccept={(requestId) => handleRequestAction(requestId, 'accepted')}
        onReject={(requestId) => handleRequestAction(requestId, 'rejected')}
      />

      <Dialog
        open={ratingDialogOpen}
        onClose={() => {
          setRatingDialogOpen(false);
          setMentorToRate(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 3
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          Rate {mentorToRate?.name}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
          <Typography variant="body1" gutterBottom>
            How would you rate your experience with this mentor?
          </Typography>
          <Rating
            size="large"
            onChange={(_, value) => value && handleRateMentor(mentorToRate?._id || '', value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRatingDialogOpen(false);
            setMentorToRate(null);
          }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Mentorship;