import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, LinearProgress,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import axios from 'axios';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points: number;
  earned: boolean;
  earnedAt?: Date;
  progress: number;
}

const BadgeSection: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/mentorship/badges', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#95A5A6';
      case 'rare': return '#3498DB';
      case 'epic': return '#9B59B6';
      case 'legendary': return '#F39C12';
      default: return '#95A5A6';
    }
  };

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setDialogOpen(true);
  };

  return (
    <>
      <Card sx={{ borderRadius: '12px', border: '1px solid #E0E0E0', height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#585E6C' }}>
            Badge Progress
          </Typography>
          <Grid container spacing={1}>
            {badges.slice(0, 6).map((badge) => (
              <Grid item xs={6} key={badge._id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: `1px solid ${badge.earned ? getRarityColor(badge.rarity) : '#E0E0E0'}`,
                    borderRadius: '8px',
                    opacity: badge.earned ? 1 : 0.7,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                  onClick={() => handleBadgeClick(badge)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      {badge.icon}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      {badge.name}
                    </Typography>
                    {!badge.earned && (
                      <LinearProgress
                        variant="determinate"
                        value={badge.progress}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: '#E0E0E0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getRarityColor(badge.rarity)
                          }
                        }}
                      />
                    )}
                    {badge.earned && (
                      <Typography variant="caption" sx={{ color: 'green', fontWeight: 600 }}>
                        ✓
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedBadge && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {selectedBadge.icon}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {selectedBadge.name}
              </Typography>
              <Chip
                label={selectedBadge.rarity}
                sx={{
                  backgroundColor: getRarityColor(selectedBadge.rarity),
                  color: 'white',
                  mt: 1
                }}
              />
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                {selectedBadge.description}
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  Points: {selectedBadge.points}
                </Typography>
                {selectedBadge.earned ? (
                  <Typography variant="body2" sx={{ color: 'green', fontWeight: 600 }}>
                    ✓ Earned on {new Date(selectedBadge.earnedAt!).toLocaleDateString()}
                  </Typography>
                ) : (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={selectedBadge.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 1,
                        backgroundColor: '#E0E0E0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getRarityColor(selectedBadge.rarity)
                        }
                      }}
                    />
                    <Typography variant="body2">
                      Progress: {selectedBadge.progress}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default BadgeSection;