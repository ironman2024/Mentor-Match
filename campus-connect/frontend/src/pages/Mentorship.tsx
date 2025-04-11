import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Rating,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper as MuiPaper,
  styled
} from '@mui/material';
import {
  Search as SearchIcon,
  Mail as MailIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Mentor {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  rating: number;
  reviews: number;
  available: boolean;
  avatar?: string;
}

const Mentorship: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [openRequest, setOpenRequest] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentorLeaderboard, setMentorLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetchMentorLeaderboard();
  }, []);

  const fetchMentorLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/users/mentors/leaderboard');
      setMentorLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleRateMentor = async (mentorId: string, rating: number) => {
    try {
      await axios.post(`http://localhost:5002/api/users/mentors/${mentorId}/rate`, { rating });
      fetchMentorLeaderboard();
    } catch (error) {
      console.error('Error rating mentor:', error);
    }
  };

  const mockMentors: Mentor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'Faculty',
      expertise: ['Machine Learning', 'Data Science', 'Python'],
      rating: 4.8,
      reviews: 24,
      available: true
    },
    {
      id: '2',
      name: 'Alex Chen',
      role: 'Alumni',
      expertise: ['Web Development', 'React', 'Node.js'],
      rating: 4.5,
      reviews: 15,
      available: true
    }
  ];

  const handleRequestMentorship = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setOpenRequest(true);
  };

  const handleSubmitRequest = () => {
    // TODO: Implement mentorship request API call
    setOpenRequest(false);
    setSelectedMentor(null);
  };

  const filteredMentors = mockMentors.filter(mentor =>
    mentor.name.toLowerCase().includes(search.toLowerCase()) ||
    mentor.expertise.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Find a Mentor
      </Typography>

      {/* Mentor Leaderboard */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Top Mentors
        </Typography>
        <TableContainer component={MuiPaper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Mentor</TableCell>
                <TableCell align="center">Rating</TableCell>
                <TableCell align="center">Total Ratings</TableCell>
                <TableCell align="center">Messages</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mentorLeaderboard.map((mentor, index) => (
                <TableRow key={mentor._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar src={mentor.avatar} sx={{ mr: 2 }}>
                        {mentor.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{mentor.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {mentor.role} • {mentor.department}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Rating
                      value={mentor.mentorRating}
                      precision={0.5}
                      readOnly
                    />
                    ({mentor.mentorRating.toFixed(1)})
                  </TableCell>
                  <TableCell align="center">{mentor.totalRatings}</TableCell>
                  <TableCell align="center">{mentor.messageCount}</TableCell>
                  <TableCell align="center">
                    {user?.role === 'student' && (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleRequestMentorship(mentor)}
                          sx={{ mr: 1 }}
                        >
                          Request
                        </Button>
                        <Rating
                          size="small"
                          onChange={(_, value) => {
                            if (value) handleRateMentor(mentor._id, value);
                          }}
                        />
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search mentors by name or expertise..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredMentors.map((mentor) => (
          <Grid item xs={12} md={6} key={mentor.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={mentor.avatar}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{mentor.name}</Typography>
                    <Typography color="textSecondary">{mentor.role}</Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  {mentor.expertise.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Rating value={mentor.rating} readOnly precision={0.5} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({mentor.reviews} reviews)
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={mentor.available ? 'Available' : 'Unavailable'}
                    color={mentor.available ? 'success' : 'default'}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    startIcon={<MailIcon />}
                    onClick={() => handleRequestMentorship(mentor)}
                    disabled={!mentor.available}
                  >
                    Request Mentorship
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openRequest} onClose={() => setOpenRequest(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Mentorship</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Why would you like to connect with this mentor?"
            multiline
            rows={4}
            margin="normal"
          />
          <TextField
            fullWidth
            label="What specific areas would you like guidance in?"
            multiline
            rows={2}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequest(false)}>Cancel</Button>
          <Button onClick={handleSubmitRequest} variant="contained" color="primary">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Mentorship;
