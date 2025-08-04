import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Code as CodeIcon,
  Work as WorkIcon,
  Star as StarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  School as SchoolIcon,
  EmojiEvents as AchievementIcon,
  Timeline as ExperienceIcon,
} from '@mui/icons-material';

interface ProjectApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  project: any;
  onSubmit: (applicationData: any) => void;
}

const steps = ['Personal Pitch', 'Skills & Experience', 'Portfolio & Achievements', 'Commitment & Availability'];

const ProjectApplicationDialog: React.FC<ProjectApplicationDialogProps> = ({
  open,
  onClose,
  project,
  onSubmit
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [applicationData, setApplicationData] = useState({
    personalPitch: '',
    motivation: '',
    relevantExperience: '',
    skills: [] as { name: string; level: number; yearsOfExperience: number }[],
    portfolioItems: [] as { title: string; description: string; url: string; technologies: string[] }[],
    achievements: [] as { title: string; description: string; date: string }[],
    availability: {
      hoursPerWeek: 10,
      startDate: '',
      duration: '',
      timezone: ''
    },
    whyBestFit: '',
    additionalNotes: ''
  });

  const [newSkill, setNewSkill] = useState({ name: '', level: 3, yearsOfExperience: 1 });
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    url: '',
    technologies: [] as string[]
  });
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: ''
  });
  const [techInput, setTechInput] = useState('');

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setApplicationData(prev => ({
        ...prev,
        skills: [...prev.skills, { ...newSkill }]
      }));
      setNewSkill({ name: '', level: 3, yearsOfExperience: 1 });
    }
  };

  const handleAddPortfolioItem = () => {
    if (newPortfolioItem.title.trim()) {
      setApplicationData(prev => ({
        ...prev,
        portfolioItems: [...prev.portfolioItems, { ...newPortfolioItem }]
      }));
      setNewPortfolioItem({ title: '', description: '', url: '', technologies: [] });
    }
  };

  const handleAddAchievement = () => {
    if (newAchievement.title.trim()) {
      setApplicationData(prev => ({
        ...prev,
        achievements: [...prev.achievements, { ...newAchievement }]
      }));
      setNewAchievement({ title: '', description: '', date: '' });
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim()) {
      setNewPortfolioItem(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleSubmit = () => {
    onSubmit(applicationData);
    onClose();
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              Tell us about yourself
            </Typography>
            
            <TextField
              fullWidth
              label="Personal Pitch"
              placeholder="Introduce yourself in 2-3 sentences. What makes you unique?"
              multiline
              rows={3}
              value={applicationData.personalPitch}
              onChange={(e) => setApplicationData(prev => ({ ...prev, personalPitch: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Why are you interested in this project?"
              placeholder="What excites you about this project? How does it align with your goals?"
              multiline
              rows={4}
              value={applicationData.motivation}
              onChange={(e) => setApplicationData(prev => ({ ...prev, motivation: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Relevant Experience"
              placeholder="Describe any relevant experience, projects, or coursework that relates to this project"
              multiline
              rows={4}
              value={applicationData.relevantExperience}
              onChange={(e) => setApplicationData(prev => ({ ...prev, relevantExperience: e.target.value }))}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
              Your Skills & Expertise
            </Typography>

            <Card sx={{ mb: 3, p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>Add a Skill</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Skill Name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  sx={{ minWidth: 200 }}
                />
                <Box>
                  <Typography variant="body2" gutterBottom>Proficiency Level</Typography>
                  <Rating
                    value={newSkill.level}
                    onChange={(e, newValue) => setNewSkill(prev => ({ ...prev, level: newValue || 1 }))}
                    max={5}
                  />
                </Box>
                <TextField
                  label="Years of Experience"
                  type="number"
                  value={newSkill.yearsOfExperience}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                  sx={{ width: 150 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  startIcon={<AddIcon />}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  Add
                </Button>
              </Box>
            </Card>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Your Skills</Typography>
              {applicationData.skills.map((skill, index) => (
                <Card key={index} sx={{ mb: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{skill.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Rating value={skill.level} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} experience
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={() => setApplicationData(prev => ({
                        ...prev,
                        skills: prev.skills.filter((_, i) => i !== index)
                      }))}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              ))}
              {applicationData.skills.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No skills added yet. Add your relevant skills above.
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
              Portfolio & Achievements
            </Typography>

            <Card sx={{ mb: 3, p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>Add Portfolio Item</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Project Title"
                  value={newPortfolioItem.title}
                  onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Description"
                  multiline
                  rows={2}
                  value={newPortfolioItem.description}
                  onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="URL (GitHub, Demo, etc.)"
                  value={newPortfolioItem.url}
                  onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, url: e.target.value }))}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    label="Add Technology"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    size="small"
                  />
                  <Button onClick={handleAddTechnology} variant="outlined" size="small">
                    Add
                  </Button>
                </Box>
                <Box>
                  {newPortfolioItem.technologies.map((tech, index) => (
                    <Chip
                      key={index}
                      label={tech}
                      onDelete={() => setNewPortfolioItem(prev => ({
                        ...prev,
                        technologies: prev.technologies.filter((_, i) => i !== index)
                      }))}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  onClick={handleAddPortfolioItem}
                  startIcon={<AddIcon />}
                >
                  Add Portfolio Item
                </Button>
              </Box>
            </Card>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Portfolio Items</Typography>
              {applicationData.portfolioItems.map((item, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.description}
                      </Typography>
                      {item.url && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <LinkIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                        </Typography>
                      )}
                      <Box>
                        {item.technologies.map((tech, techIndex) => (
                          <Chip key={techIndex} label={tech} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </Box>
                    </Box>
                    <IconButton
                      onClick={() => setApplicationData(prev => ({
                        ...prev,
                        portfolioItems: prev.portfolioItems.filter((_, i) => i !== index)
                      }))}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>

            <Card sx={{ mb: 3, p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>Add Achievement</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Achievement Title"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Description"
                  multiline
                  rows={2}
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Date"
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddAchievement}
                  startIcon={<AddIcon />}
                >
                  Add Achievement
                </Button>
              </Box>
            </Card>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Achievements</Typography>
              {applicationData.achievements.map((achievement, index) => (
                <Card key={index} sx={{ mb: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{achievement.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{achievement.description}</Typography>
                      <Typography variant="caption" color="text.secondary">{achievement.date}</Typography>
                    </Box>
                    <IconButton
                      onClick={() => setApplicationData(prev => ({
                        ...prev,
                        achievements: prev.achievements.filter((_, i) => i !== index)
                      }))}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ExperienceIcon sx={{ mr: 1, color: 'primary.main' }} />
              Commitment & Final Pitch
            </Typography>

            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Availability</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Hours per week you can commit"
                  type="number"
                  value={applicationData.availability.hoursPerWeek}
                  onChange={(e) => setApplicationData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, hoursPerWeek: parseInt(e.target.value) || 0 }
                  }))}
                  InputProps={{ inputProps: { min: 1, max: 40 } }}
                />
                <TextField
                  label="When can you start?"
                  type="date"
                  value={applicationData.availability.startDate}
                  onChange={(e) => setApplicationData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, startDate: e.target.value }
                  }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="How long can you commit?"
                  placeholder="e.g., 3 months, until completion, etc."
                  value={applicationData.availability.duration}
                  onChange={(e) => setApplicationData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, duration: e.target.value }
                  }))}
                />
                <TextField
                  label="Your timezone"
                  placeholder="e.g., EST, PST, GMT+5:30"
                  value={applicationData.availability.timezone}
                  onChange={(e) => setApplicationData(prev => ({
                    ...prev,
                    availability: { ...prev.availability, timezone: e.target.value }
                  }))}
                />
              </Box>
            </Card>

            <TextField
              fullWidth
              label="Why are you the best fit for this project?"
              placeholder="Summarize why you should be selected. What unique value will you bring?"
              multiline
              rows={4}
              value={applicationData.whyBestFit}
              onChange={(e) => setApplicationData(prev => ({ ...prev, whyBestFit: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              placeholder="Any additional information you'd like to share"
              multiline
              rows={3}
              value={applicationData.additionalNotes}
              onChange={(e) => setApplicationData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            />
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return applicationData.personalPitch.trim() && applicationData.motivation.trim();
      case 1:
        return applicationData.skills.length > 0;
      case 2:
        return true; // Optional step
      case 3:
        return applicationData.availability.hoursPerWeek > 0 && applicationData.whyBestFit.trim();
      default:
        return false;
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    for (let i = 0; i < steps.length; i++) {
      if (isStepComplete(i)) completed++;
    }
    return (completed / steps.length) * 100;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>Apply for Project</Typography>
            <Typography variant="subtitle1" color="text.secondary">{project?.title}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Application Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={getCompletionPercentage()}
              sx={{ width: 120, mt: 0.5 }}
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={isStepComplete(index)}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, backgroundColor: 'grey.50' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isStepComplete(activeStep)}
            sx={{ px: 4 }}
          >
            Submit Application
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepComplete(activeStep)}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProjectApplicationDialog;