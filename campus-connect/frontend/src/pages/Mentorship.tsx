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
      console.log('Fetched mentors:', response.data); // Debug log
      setMentors(response.data);
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
    if (!selectedMentor) return;

    try {
      const response = await axios.post(
        'http://localhost:5002/api/mentorship/request',
        {
          mentorId: selectedMentor._id,
          topic: 'Mentorship Request',
          message: requestMessage
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data) {
        setOpenRequest(false);
        setSelectedMentor(null);
        setRequestMessage('');
        // Add success notification here
      }
    } catch (error) {
      console.error('Error details:', error);
      // Add error notification here
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
    <Box p={3}>
      {/* Show pending requests section for mentors */}
      {(user?.role === 'faculty' || user?.role === 'alumni') && (
        <Box mb={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pending Mentorship Requests
            </Typography>
            {pendingRequests.length === 0 ? (
              <Typography color="textSecondary">No pending requests</Typography>
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
                        color="primary"
                        size="small"
                        onClick={() => handlePreviewRequest(request)}
                        sx={{ mr: 1 }}
                      >
                        Preview
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      )}

      <Typography variant="h4" gutterBottom>
        Available Mentors
      </Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search mentors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="alumni">Alumni</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {mentors.length === 0 ? (
        <Typography>No mentors found</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredMentors.map((mentor) => (
            <Grid item xs={12} md={6} lg={4} key={mentor._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar src={mentor.avatar} sx={{ width: 56, height: 56, mr: 2 }}>
                      {mentor.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{mentor.name}</Typography>
                      <Typography color="textSecondary">{mentor.role}</Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" gutterBottom>
                    Department: {mentor.department || 'Not specified'}
                  </Typography>

                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Expertise:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {mentor.expertise.map((skill, index) => (
                          <Chip 
                            key={index}
                            label={skill}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" mb={2}>
                    <Rating 
                      value={mentor.mentorRating} 
                      readOnly 
                      precision={0.5}
                      size="small"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({mentor.totalRatings} ratings)
                    </Typography>
                  </Box>

                  {user?.role === 'student' && (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleRequestMentorship(mentor)}
                    >
                      Request Mentorship
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Request Dialog */}
      <Dialog open={openRequest} onClose={() => setOpenRequest(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Mentorship</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message to mentor"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Explain why you'd like to connect with this mentor and what you hope to learn..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequest(false)}>Cancel</Button>
          <Button onClick={handleSubmitRequest} variant="contained" color="primary">
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
    </Box>
  );
};

export default Mentorship;
