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
import AchievementSection from '../components/mentorship/AchievementSection';
import LeaderboardSection from '../components/mentorship/LeaderboardSection';
import BadgeSection from '../components/mentorship/BadgeSection';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

interface Mentor {
  _id: string;
  name: string;
  role: string;
  email: string;
  department?: string;
  yearOfGraduation?: number;
  areasOfExpertise: string[];
  skills: string[];
  rating: number;
  totalRatings: number;
  avatar?: string;
  bio?: string;
  resume?: string;
  experiences?: Experience[];
  projects?: Project[];
  linkedin?: string;
  github?: string;
}

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate: string;
  endDate: string;
}

const Mentorship: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [openRequest, setOpenRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestDetails, setRequestDetails] = useState({
    domain: '',
    projectDescription: '',
    specificHelp: '',
    timeCommitment: '',
    preferredMeetingType: 'online'
  });
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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMentorDetails, setSelectedMentorDetails] = useState<Mentor | null>(null);

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
      const response = await axios.get('http://localhost:5002/api/mentorship/mentors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Sort mentors by rating
      const sortedMentors = response.data.sort((a: Mentor, b: Mentor) => 
        (b.rating || 0) - (a.rating || 0)
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
    if (!selectedMentor || !requestMessage.trim() || !requestDetails.domain || !requestDetails.specificHelp) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    try {
      const requestData = {
        mentorId: selectedMentor._id,
        topic: `${requestDetails.domain} Mentorship`,
        message: requestMessage.trim(),
        domain: requestDetails.domain,
        projectDescription: requestDetails.projectDescription,
        specificHelp: requestDetails.specificHelp,
        timeCommitment: requestDetails.timeCommitment,
        preferredMeetingType: requestDetails.preferredMeetingType
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
        setRequestDetails({
          domain: '',
          projectDescription: '',
          specificHelp: '',
          timeCommitment: '',
          preferredMeetingType: 'online'
        });
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
        `http://localhost:5002/api/mentorship/requests/${requestId}/update`,
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

        if (action === 'accepted') {
          enqueueSnackbar('Request accepted! A chat has been created with your mentee.', { 
            variant: 'success' 
          });
          // Navigate to inbox/chat
          navigate('/inbox');
        } else {
          enqueueSnackbar('Request declined', { variant: 'info' });
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
              rating: response.data.newRating,
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

  const handleViewDetails = async (mentorId: string) => {
    try {
      const response = await axios.get(`http://localhost:5002/api/mentorship/mentor/${mentorId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedMentorDetails(response.data);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching mentor details:', error);
      enqueueSnackbar('Failed to load mentor details', { variant: 'error' });
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const searchTerms = search.toLowerCase().split(' ');
    const mentorText = `${mentor.name} ${mentor.department || ''} ${mentor.areasOfExpertise.join(' ')}`.toLowerCase();
    
    const matchesSearch = searchTerms.every(term => mentorText.includes(term));
    const matchesRole = filters.role === 'all' || mentor.role.toLowerCase() === filters.role;
    const matchesDepartment = !filters.department || 
      (mentor.department && mentor.department.toLowerCase().includes(filters.department.toLowerCase()));

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

        {/* Gamification Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <AchievementSection />
          </Grid>
          <Grid item xs={12} md={4}>
            <LeaderboardSection />
          </Grid>
          <Grid item xs={12} md={4}>
            <BadgeSection />
          </Grid>
        </Grid>

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

                  {mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" sx={{ color: '#585E6C', fontWeight: 600 }}>
                        Areas of Expertise:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {mentor.areasOfExpertise.slice(0, 3).map((area, index) => (
                          <Chip 
                            key={index}
                            label={area}
                            size="small"
                            sx={{ 
                              borderRadius: '4px',
                              background: '#585E6C',
                              color: 'white'
                            }}
                          />
                        ))}
                        {mentor.areasOfExpertise.length > 3 && (
                          <Chip 
                            label={`+${mentor.areasOfExpertise.length - 3} more`}
                            size="small"
                            sx={{ 
                              borderRadius: '4px',
                              background: '#B5BBC9',
                              color: 'white'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Rating 
                        value={mentor.rating || 0} 
                        readOnly 
                        precision={0.5}
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1, color: '#596273' }}>
                        {mentor.rating?.toFixed(1) || 'No ratings'} ({mentor.totalRatings || 0})
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

                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleViewDetails(mentor._id)}
                      sx={{
                        py: 1.5,
                        borderRadius: '8px',
                        borderColor: '#585E6C',
                        color: '#585E6C',
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#474D59',
                          color: '#474D59',
                          background: 'rgba(88,94,108,0.05)',
                        }
                      }}
                    >
                      View Details
                    </Button>
                    {user?.role === 'student' && (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleRequestMentorship(mentor)}
                        sx={{
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
                  </Box>
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
          <Typography variant="subtitle1" sx={{ color: '#596273', mb: 3 }}>
            Please provide detailed information about your mentorship needs
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Domain/Field</InputLabel>
                <Select
                  value={requestDetails.domain}
                  label="Domain/Field"
                  onChange={(e) => setRequestDetails(prev => ({ ...prev, domain: e.target.value }))}
                >
                  <MenuItem value="Web Development">Web Development</MenuItem>
                  <MenuItem value="Mobile Development">Mobile Development</MenuItem>
                  <MenuItem value="Data Science">Data Science</MenuItem>
                  <MenuItem value="Machine Learning">Machine Learning</MenuItem>
                  <MenuItem value="DevOps">DevOps</MenuItem>
                  <MenuItem value="UI/UX Design">UI/UX Design</MenuItem>
                  <MenuItem value="Career Guidance">Career Guidance</MenuItem>
                  <MenuItem value="Research">Research</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Meeting Type</InputLabel>
                <Select
                  value={requestDetails.preferredMeetingType}
                  label="Preferred Meeting Type"
                  onChange={(e) => setRequestDetails(prev => ({ ...prev, preferredMeetingType: e.target.value }))}
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">In-Person</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="What specific help do you need?"
                value={requestDetails.specificHelp}
                onChange={(e) => setRequestDetails(prev => ({ ...prev, specificHelp: e.target.value }))}
                placeholder="e.g., Code review, career advice, project guidance..."
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Description (Optional)"
                value={requestDetails.projectDescription}
                onChange={(e) => setRequestDetails(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Describe your project or what you're working on..."
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Time Commitment (Optional)"
                value={requestDetails.timeCommitment}
                onChange={(e) => setRequestDetails(prev => ({ ...prev, timeCommitment: e.target.value }))}
                placeholder="e.g., 1 hour per week, one-time session..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Personal Message"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you'd like to connect with this mentor..."
              />
            </Grid>
          </Grid>
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
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Click on the stars to rate (1-5 stars)
          </Typography>
          <Rating
            size="large"
            onChange={(_, value) => {
              if (value) {
                handleRateMentor(mentorToRate?._id || '', value);
                setRatingDialogOpen(false);
                setMentorToRate(null);
              }
            }}
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

      {/* Mentor Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedMentorDetails(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '1px solid #E0E0E0',
          pb: 2
        }}>
          {selectedMentorDetails && (
            <>
              <Avatar 
                src={selectedMentorDetails.avatar} 
                sx={{ width: 60, height: 60 }}
              >
                {selectedMentorDetails.name[0]}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {selectedMentorDetails.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {selectedMentorDetails.role} • {selectedMentorDetails.department}
                </Typography>
              </Box>
            </>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedMentorDetails && (
            <Box>
              {/* Bio Section */}
              {selectedMentorDetails.bio && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    About
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#596273' }}>
                    {selectedMentorDetails.bio}
                  </Typography>
                </Box>
              )}

              {/* Areas of Expertise */}
              {selectedMentorDetails.areasOfExpertise?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Areas of Expertise
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedMentorDetails.areasOfExpertise.map((area, index) => (
                      <Chip 
                        key={index}
                        label={area}
                        sx={{ 
                          background: '#585E6C',
                          color: 'white'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Skills */}
              {selectedMentorDetails.skills?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Skills
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedMentorDetails.skills.map((skill, index) => (
                      <Chip 
                        key={index}
                        label={skill}
                        variant="outlined"
                        sx={{ 
                          borderColor: '#585E6C',
                          color: '#585E6C'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Experience */}
              {selectedMentorDetails.experiences?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Experience
                  </Typography>
                  {selectedMentorDetails.experiences.map((exp, index) => (
                    <Box key={index} mb={2} p={2} sx={{ border: '1px solid #E0E0E0', borderRadius: '8px' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {exp.title}
                      </Typography>
                      <Typography variant="body2" color="primary" gutterBottom>
                        {exp.company}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        {new Date(exp.startDate).toLocaleDateString()} - {new Date(exp.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {exp.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Projects */}
              {selectedMentorDetails.projects?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Projects
                  </Typography>
                  {selectedMentorDetails.projects.map((project, index) => (
                    <Box key={index} mb={2} p={2} sx={{ border: '1px solid #E0E0E0', borderRadius: '8px' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {project.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                        {project.description}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                        {project.technologies.map((tech, techIndex) => (
                          <Chip 
                            key={techIndex}
                            label={tech}
                            size="small"
                            sx={{ 
                              background: '#F0F0F0',
                              fontSize: '0.75rem'
                            }}
                          />
                        ))}
                      </Box>
                      {project.url && (
                        <Button 
                          size="small" 
                          href={project.url} 
                          target="_blank"
                          sx={{ color: '#585E6C' }}
                        >
                          View Project
                        </Button>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {/* Resume */}
              {selectedMentorDetails.resume && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Resume
                  </Typography>
                  <Button
                    variant="outlined"
                    href={`http://localhost:5002${selectedMentorDetails.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderColor: '#585E6C',
                      color: '#585E6C',
                      '&:hover': {
                        borderColor: '#474D59',
                        color: '#474D59',
                        background: 'rgba(88,94,108,0.05)'
                      }
                    }}
                  >
                    View Resume (PDF)
                  </Button>
                </Box>
              )}

              {/* Rating */}
              <Box display="flex" alignItems="center" mb={2}>
                <Rating 
                  value={selectedMentorDetails.rating || 0} 
                  readOnly 
                  precision={0.5}
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {selectedMentorDetails.rating?.toFixed(1) || 'No ratings'} ({selectedMentorDetails.totalRatings || 0} reviews)
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setDetailsDialogOpen(false);
              setSelectedMentorDetails(null);
            }}
            sx={{ color: '#B5BBC9' }}
          >
            Close
          </Button>
          {user?.role === 'student' && selectedMentorDetails && (
            <>
              <Button 
                onClick={() => {
                  setMentorToRate(selectedMentorDetails);
                  setRatingDialogOpen(true);
                }}
                variant="outlined"
                sx={{
                  borderColor: '#585E6C',
                  color: '#585E6C',
                  mr: 1,
                  '&:hover': {
                    borderColor: '#474D59',
                    color: '#474D59'
                  }
                }}
              >
                Rate Mentor
              </Button>
              <Button 
                onClick={() => {
                  setDetailsDialogOpen(false);
                  handleRequestMentorship(selectedMentorDetails);
                }}
                variant="contained"
                sx={{
                  background: '#585E6C',
                  '&:hover': {
                    background: '#474D59'
                  }
                }}
              >
                Request Mentorship
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Mentorship;