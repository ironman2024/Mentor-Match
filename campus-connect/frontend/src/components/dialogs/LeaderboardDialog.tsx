import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, List, ListItem, 
  ListItemAvatar, ListItemText, Avatar, Chip, Tabs, Tab, Card, CardContent
} from '@mui/material';
import { EmojiEvents, TrendingUp, Close } from '@mui/icons-material';
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
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [period, setPeriod] = useState('all-time');

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
      fetchUserRank();
    }
  }, [open, period]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`http://localhost:5002/api/mentorship/leaderboard?period=${period}&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLeaderboard(response.data.rankings || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '80vh'
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
        <Tabs value={period} onChange={handlePeriodChange} sx={{ mb: 2 }}>
          <Tab label="All Time" value="all-time" />
          <Tab label="Monthly" value="monthly" />
          <Tab label="Weekly" value="weekly" />
        </Tabs>

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

        <Card sx={{ borderRadius: '12px' }}>
          <CardContent sx={{ p: 0 }}>
            <List>
              {leaderboard.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="No rankings available"
                    secondary="Start mentoring to appear on the leaderboard!"
                  />
                </ListItem>
              ) : (
                leaderboard.map((entry) => (
                  <ListItem key={entry.user._id} divider>
                    <ListItemAvatar>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <Typography variant="h6" sx={{ mr: 1, minWidth: '40px' }}>
                          {getRankIcon(entry.rank)}
                        </Typography>
                        <Avatar src={entry.user.profilePicture}>
                          {entry.user.name[0]}
                        </Avatar>
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {entry.user.name}
                          </Typography>
                          {entry.rank <= 3 && (
                            <Chip
                              label="Top Mentor"
                              size="small"
                              sx={{
                                backgroundColor: entry.rank === 1 ? '#F39C12' : entry.rank === 2 ? '#95A5A6' : '#CD7F32',
                                color: 'white'
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
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardDialog;