import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemAvatar, ListItemText, 
  Avatar, Chip, Card, CardContent, Button, Tabs, Tab, Divider,
  LinearProgress, IconButton, Collapse
} from '@mui/material';
import { 
  EmojiEvents, TrendingUp, ExpandMore, ExpandLess, 
  Star, School, WorkOutline, Leaderboard
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LeaderboardDialog from '../dialogs/LeaderboardDialog';

interface LeaderboardEntry {
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
    department?: string;
    role?: string;
  };
  score: number;
  rank: number;
  metadata?: {
    mentorshipRating?: number;
    totalMentees?: number;
    completedSessions?: number;
  };
}

interface UserRank {
  rank: number;
  score: number;
}

const LeaderboardSection: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [period, setPeriod] = useState('all-time');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
    fetchUserRank();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5002/api/mentorship/leaderboard?period=${period}&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLeaderboard(response.data.rankings || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#585E6C';
  };

  const handlePeriodChange = (event: React.SyntheticEvent, newValue: string) => {
    setPeriod(newValue);
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        border: '1px solid #B5BBC9',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEvents sx={{ mr: 1.5, fontSize: 28, color: '#FFD700' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                Mentorship Leaderboard
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Leaderboard />}
                onClick={() => setDialogOpen(true)}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                View Full
              </Button>
              <IconButton 
                onClick={() => setExpanded(!expanded)}
                sx={{ color: 'white' }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>

          {/* User Rank Card */}
          {userRank && (
            <Box sx={{ 
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              p: 2,
              mb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1, color: '#FFD700' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
                    Your Rank
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFD700' }}>
                    {userRank.rank ? `#${userRank.rank}` : 'Unranked'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {userRank.score} points
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Period Tabs */}
          <Tabs 
            value={period} 
            onChange={handlePeriodChange}
            sx={{ 
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'none',
                fontWeight: 600,
                minWidth: 'auto',
                '&.Mui-selected': {
                  color: 'white'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700',
                height: 3
              }
            }}
          >
            <Tab label="All Time" value="all-time" />
            <Tab label="Monthly" value="monthly" />
            <Tab label="Weekly" value="weekly" />
          </Tabs>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ background: 'white', color: '#585E6C' }}>
            {loading && <LinearProgress sx={{ color: '#667eea' }} />}
            
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center', color: '#585E6C' }}>
                  🏆 Top Mentors
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 2 }}>
                  {/* Second Place */}
                  {leaderboard[1] && (
                    <Box sx={{ textAlign: 'center', transform: 'translateY(10px)' }}>
                      <Avatar 
                        src={leaderboard[1].user.profilePicture}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mx: 'auto', 
                          mb: 1,
                          border: '3px solid #C0C0C0'
                        }}
                      >
                        {leaderboard[1].user.name[0]}
                      </Avatar>
                      <Typography variant="h4" sx={{ color: '#C0C0C0', mb: 1 }}>🥈</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#585E6C' }}>
                        {leaderboard[1].user.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#596273' }}>
                        {leaderboard[1].score} pts
                      </Typography>
                    </Box>
                  )}

                  {/* First Place */}
                  {leaderboard[0] && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar 
                        src={leaderboard[0].user.profilePicture}
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          mx: 'auto', 
                          mb: 1,
                          border: '4px solid #FFD700'
                        }}
                      >
                        {leaderboard[0].user.name[0]}
                      </Avatar>
                      <Typography variant="h3" sx={{ color: '#FFD700', mb: 1 }}>🥇</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#585E6C' }}>
                        {leaderboard[0].user.name}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#596273', fontWeight: 600 }}>
                        {leaderboard[0].score} pts
                      </Typography>
                      <Chip 
                        label="Champion" 
                        size="small" 
                        sx={{ 
                          mt: 1, 
                          background: '#FFD700', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </Box>
                  )}

                  {/* Third Place */}
                  {leaderboard[2] && (
                    <Box sx={{ textAlign: 'center', transform: 'translateY(20px)' }}>
                      <Avatar 
                        src={leaderboard[2].user.profilePicture}
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          mx: 'auto', 
                          mb: 1,
                          border: '3px solid #CD7F32'
                        }}
                      >
                        {leaderboard[2].user.name[0]}
                      </Avatar>
                      <Typography variant="h5" sx={{ color: '#CD7F32', mb: 1 }}>🥉</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#585E6C' }}>
                        {leaderboard[2].user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#596273' }}>
                        {leaderboard[2].score} pts
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            <Divider />

            {/* Full Leaderboard List */}
            <List sx={{ p: 0 }}>
              {leaderboard.length === 0 ? (
                <ListItem sx={{ py: 4, textAlign: 'center' }}>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ color: '#596273' }}>
                        🎯 No rankings available
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: '#B5BBC9', mt: 1 }}>
                        Start mentoring to appear on the leaderboard!
                      </Typography>
                    }
                  />
                </ListItem>
              ) : (
                leaderboard.map((entry, index) => (
                  <ListItem 
                    key={entry.user._id} 
                    divider={index < leaderboard.length - 1}
                    sx={{ 
                      py: 2,
                      background: index < 3 ? 'rgba(255,215,0,0.05)' : 'transparent',
                      '&:hover': {
                        background: 'rgba(88,94,108,0.05)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mr: 2, 
                            minWidth: '50px',
                            fontWeight: 700,
                            color: getRankColor(entry.rank),
                            fontSize: entry.rank <= 3 ? '1.5rem' : '1.2rem'
                          }}
                        >
                          {getRankIcon(entry.rank)}
                        </Typography>
                        <Avatar 
                          src={entry.user.profilePicture}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            border: entry.rank <= 3 ? `2px solid ${getRankColor(entry.rank)}` : 'none'
                          }}
                        >
                          {entry.user.name[0]}
                        </Avatar>
                      </Box>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#585E6C' }}>
                            {entry.user.name}
                          </Typography>
                          {entry.rank <= 3 && (
                            <Chip
                              label="Top Mentor"
                              size="small"
                              sx={{
                                backgroundColor: getRankColor(entry.rank),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                          {entry.user.role && (
                            <Chip
                              icon={entry.user.role === 'faculty' ? <School /> : <WorkOutline />}
                              label={entry.user.role}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: '#585E6C',
                                color: '#585E6C',
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#596273', mb: 0.5 }}>
                            {entry.user.department && `${entry.user.department} • `}
                            <strong>{entry.score} points</strong>
                          </Typography>
                          {entry.metadata && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {entry.metadata.mentorshipRating && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Star sx={{ fontSize: 14, color: '#FFD700', mr: 0.5 }} />
                                  <Typography variant="caption" sx={{ color: '#F39C12', fontWeight: 600 }}>
                                    {entry.metadata.mentorshipRating.toFixed(1)}
                                  </Typography>
                                </Box>
                              )}
                              {entry.metadata.totalMentees && (
                                <Typography variant="caption" sx={{ color: '#596273' }}>
                                  {entry.metadata.totalMentees} mentees
                                </Typography>
                              )}
                              {entry.metadata.completedSessions && (
                                <Typography variant="caption" sx={{ color: '#596273' }}>
                                  {entry.metadata.completedSessions} sessions
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>

            {leaderboard.length > 0 && (
              <Box sx={{ p: 2, textAlign: 'center', background: '#F8F9FB' }}>
                <Typography variant="body2" sx={{ color: '#596273', mb: 2 }}>
                  🎯 Keep mentoring to climb the ranks!
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Leaderboard />}
                    onClick={() => setDialogOpen(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                      }
                    }}
                  >
                    View Full Leaderboard
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#585E6C',
                      color: '#585E6C',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#474D59',
                        color: '#474D59',
                        background: 'rgba(88,94,108,0.05)'
                      }
                    }}
                    onClick={() => setExpanded(false)}
                  >
                    Collapse
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
        
        {!expanded && leaderboard.length > 0 && (
          <Box sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.1)' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Leaderboard />}
              onClick={() => setDialogOpen(true)}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              View Full Leaderboard
            </Button>
          </Box>
        )}
      </CardContent>
      
      <LeaderboardDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
      />
    </Card>
  );
};

export default LeaderboardSection;