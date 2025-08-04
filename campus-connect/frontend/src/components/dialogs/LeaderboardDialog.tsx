import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, List, ListItem, 
  ListItemAvatar, ListItemText, Avatar, Chip, Tabs, Tab, Card, CardContent,
  TextField, InputAdornment, Pagination, CircularProgress, Alert
} from '@mui/material';
import { EmojiEvents, TrendingUp, Close, Search } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import axios from 'axios';

interface LeaderboardEntry {
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
    department?: string;
  };
  score: number;
  rank: number;
  metadata?: {
    mentorshipRating?: number;
  };
}

interface UserRank {
  rank: number;
  score: number;
}

interface LeaderboardDialogProps {
  open: boolean;
  onClose: () => void;
}

const LeaderboardDialog: React.FC<LeaderboardDialogProps> = ({ open, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [period, setPeriod] = useState('all-time');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
      fetchUserRank();
    }
  }, [open, period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5002/api/mentorship/leaderboard?period=${period}&limit=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const rankings = response.data.rankings || [];
      setLeaderboard(rankings);
      setFilteredLeaderboard(rankings);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const response = await axios.get(`http://localhost:5002/api/mentorship/rank?period=${period}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserRank(response.data);
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const handlePeriodChange = (event: React.SyntheticEvent, newValue: string) => {
    setPeriod(newValue);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1);
    
    if (term === '') {
      setFilteredLeaderboard(leaderboard);
    } else {
      const filtered = leaderboard.filter(entry => 
        entry.user.name.toLowerCase().includes(term) ||
        entry.user.department?.toLowerCase().includes(term)
      );
      setFilteredLeaderboard(filtered);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const paginatedData = filteredLeaderboard.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLeaderboard.length / itemsPerPage);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh',
          height: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEvents sx={{ mr: 1, color: '#F39C12' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#585E6C' }}>
            Mentorship Leaderboard
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Tabs value={period} onChange={handlePeriodChange} sx={{ mb: 2 }}>
            <Tab label="All Time" value="all-time" />
            <Tab label="Monthly" value="monthly" />
            <Tab label="Weekly" value="weekly" />
          </Tabs>
          
          <TextField
            fullWidth
            placeholder="Search by name or department..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#666' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />
        </Box>

        {userRank && (
          <Card sx={{ mb: 2, border: '2px solid #3498DB', borderRadius: '12px' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1, color: '#3498DB' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Your Rank
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#3498DB' }}>
                    {userRank.rank ? `#${userRank.rank}` : 'Unranked'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Score: {userRank.score}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Showing {paginatedData.length} of {filteredLeaderboard.length} mentors
              </Typography>
              {filteredLeaderboard.length > itemsPerPage && (
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
            
            <Card sx={{ borderRadius: '12px', flex: 1, overflow: 'auto' }}>
              <CardContent sx={{ p: 0 }}>
                <List>
                  {paginatedData.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary={searchTerm ? "No mentors found" : "No rankings available"}
                        secondary={searchTerm ? "Try adjusting your search terms" : "Start mentoring to appear on the leaderboard!"}
                      />
                    </ListItem>
                  ) : (
                    paginatedData.map((entry) => (
                      <ListItem key={entry.user._id} divider>
                        <ListItemAvatar>
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            <Typography variant="h6" sx={{ mr: 1, minWidth: '50px', textAlign: 'center' }}>
                              {getRankIcon(entry.rank)}
                            </Typography>
                            <Avatar src={entry.user.profilePicture} sx={{ width: 48, height: 48 }}>
                              {entry.user.name[0]}
                            </Avatar>
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {entry.user.name}
                              </Typography>
                              {entry.rank <= 3 && (
                                <Chip
                                  label="Top Mentor"
                                  size="small"
                                  sx={{
                                    backgroundColor: entry.rank === 1 ? '#F39C12' : entry.rank === 2 ? '#95A5A6' : '#CD7F32',
                                    color: 'white',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                              {entry.rank <= 10 && entry.rank > 3 && (
                                <Chip
                                  label="Top 10"
                                  size="small"
                                  sx={{
                                    backgroundColor: '#3498DB',
                                    color: 'white',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                {entry.user.department && `${entry.user.department} • `}
                                Score: {entry.score}
                              </Typography>
                              {entry.metadata?.mentorshipRating && (
                                <Typography variant="caption" sx={{ color: '#F39C12' }}>
                                  ⭐ {entry.metadata.mentorshipRating.toFixed(1)} rating
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
            
            {filteredLeaderboard.length > itemsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardDialog;