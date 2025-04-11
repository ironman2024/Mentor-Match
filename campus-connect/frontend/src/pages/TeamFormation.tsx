import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Card,
  CardContent,
  Grid,
  Chip,
  Rating,
  Avatar
} from '@mui/material';
import axios from 'axios';

const TeamFormation: React.FC = () => {
  const [projectRequirements, setProjectRequirements] = useState({
    title: '',
    description: '',
    requiredSkills: [] as string[],
    teamSize: 4,
    projectType: ''
  });
  const [matchedMembers, setMatchedMembers] = useState([]);

  const handleFindTeam = async () => {
    try {
      const response = await axios.post('/api/teams/match', projectRequirements);
      setMatchedMembers(response.data);
    } catch (error) {
      console.error('Error finding team members:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Form Your Dream Team
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Requirements
              </Typography>
              <TextField
                fullWidth
                label="Project Title"
                value={projectRequirements.title}
                onChange={(e) => setProjectRequirements(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                margin="normal"
              />
              <Autocomplete
                multiple
                options={['React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX']}
                value={projectRequirements.requiredSkills}
                onChange={(e, newValue) => setProjectRequirements(prev => ({
                  ...prev,
                  requiredSkills: newValue
                }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Required Skills"
                    margin="normal"
                  />
                )}
              />
              <TextField
                fullWidth
                label="Team Size"
                type="number"
                value={projectRequirements.teamSize}
                onChange={(e) => setProjectRequirements(prev => ({
                  ...prev,
                  teamSize: parseInt(e.target.value)
                }))}
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={handleFindTeam}
                fullWidth
                sx={{ mt: 2 }}
              >
                Find Team Members
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Matched Team Members
          </Typography>
          {matchedMembers.map((member: any) => (
            <Card key={member._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src={member.avatar} sx={{ mr: 2 }}>
                    {member.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{member.name}</Typography>
                    <Typography color="textSecondary">
                      {member.role}
                    </Typography>
                  </Box>
                </Box>
                <Box mb={2}>
                  {member.skills.map((skill: any) => (
                    <Chip
                      key={skill.name}
                      label={`${skill.name} (${skill.proficiency})`}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Project Success Rate:
                  </Typography>
                  <Rating
                    value={member.mentorshipStats.successfulMentorships / 5}
                    readOnly
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeamFormation;
