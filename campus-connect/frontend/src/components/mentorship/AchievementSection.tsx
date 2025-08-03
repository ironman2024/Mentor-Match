import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, LinearProgress,
  List, ListItem, ListItemText, Chip
} from '@mui/material';
import { EmojiEvents, TrendingUp, Star } from '@mui/icons-material';
import axios from 'axios';

interface Achievement {
  badge: {
    _id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    rarity: string;
  };
  earnedAt: Date;
}

interface AchievementData {
  achievements: Achievement[];
  mentorshipScore: number;
  totalPoints: number;
}

const AchievementSection: React.FC = () => {
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/mentorship/achievements', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAchievementData(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
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

  if (!achievementData) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#585E6C' }}>
          Your Achievements
        </Typography>
        <Card sx={{ borderRadius: '12px' }}>
          <CardContent>
            <Typography>Loading achievements...</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Card sx={{ borderRadius: '12px', border: '1px solid #E0E0E0', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Star sx={{ mr: 1, color: '#F39C12' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#585E6C' }}>
            Your Achievements
          </Typography>
        </Box>

        {/* Stats Summary */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#585E6C', mb: 1 }}>
            {achievementData.achievements.length}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Badges Earned
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#3498DB' }}>
                {achievementData.mentorshipScore}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Score
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#E74C3C' }}>
                {achievementData.totalPoints}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Points
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Recent Achievements */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Badges
          </Typography>
          {achievementData.achievements.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                No badges earned yet
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                Start mentoring to earn badges!
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {achievementData.achievements
                .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
                .slice(0, 3)
                .map((achievement, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="h6" sx={{ mr: 1 }}>
                        {achievement.badge.icon}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {achievement.badge.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {achievement.badge.points} points
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
            </List>
          )}
        </Box>

      </CardContent>
    </Card>
  );
};

export default AchievementSection;