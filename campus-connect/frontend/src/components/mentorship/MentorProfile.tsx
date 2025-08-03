import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Rating,
  Grid,
  Button,
  Dialog
} from '@mui/material';
import { MentorshipService } from '../../services/MentorshipService';
import { ScheduleSession, AvailabilityCalendar } from './index';
import UserAvatar from '../common/UserAvatar';

interface MentorProfileProps {
  mentorId: string;
}

const MentorProfile: React.FC<MentorProfileProps> = ({ mentorId }) => {
  const [mentor, setMentor] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [openSchedule, setOpenSchedule] = useState(false);

  useEffect(() => {
    fetchMentorData();
  }, [mentorId]);

  const fetchMentorData = async () => {
    try {
      const [mentorData, availabilityData] = await Promise.all([
        MentorshipService.getMentorDashboard(),
        MentorshipService.getMentorAvailability(mentorId)
      ]);
      setMentor(mentorData);
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Mentor Info Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <UserAvatar
            user={mentor}
            size={100}
          />
          <Box>
            <Typography variant="h5">{mentor?.name}</Typography>
            <Typography color="textSecondary">{mentor?.department}</Typography>
            <Rating value={mentor?.mentorRating} readOnly />
            <Typography variant="caption">
              ({mentor?.totalReviews} reviews)
            </Typography>
          </Box>
        </Box>

        {/* Expertise Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Areas of Expertise</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {mentor?.areasOfExpertise?.map((area: string) => (
              <Chip key={area} label={area} />
            ))}
          </Box>
        </Box>

        {/* Availability Calendar */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Availability</Typography>
          <AvailabilityCalendar 
            availability={availability} 
            readOnly 
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => setOpenSchedule(true)}
          >
            Schedule Session
          </Button>
        </Box>

        {/* Schedule Session Dialog */}
        <Dialog
          open={openSchedule}
          onClose={() => setOpenSchedule(false)}
          maxWidth="md"
          fullWidth
        >
          <ScheduleSession
            mentorId={mentorId}
            availability={availability}
            onClose={() => setOpenSchedule(false)}
            onScheduled={fetchMentorData}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MentorProfile;
