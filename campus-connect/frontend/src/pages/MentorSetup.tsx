import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

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
  url: string;
  startDate: string;
  endDate: string;
}

const DOMAIN_OPTIONS = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'Artificial Intelligence', 'Cloud Computing', 'DevOps', 'Cybersecurity',
  'UI/UX Design', 'Product Management', 'Software Architecture', 'Database Design',
  'Blockchain', 'IoT', 'Game Development', 'Quality Assurance'
];

const SKILL_OPTIONS = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
  'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'HTML/CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker',
  'Kubernetes', 'Git', 'Linux', 'TensorFlow', 'PyTorch', 'Figma', 'Adobe XD'
];

const MentorSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [resume, setResume] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([{
    title: '', company: '', startDate: '', endDate: '', description: ''
  }]);
  const [projects, setProjects] = useState<Project[]>([{
    title: '', description: '', technologies: [], url: '', startDate: '', endDate: ''
  }]);

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Resume file size must be less than 10MB');
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setError('Resume must be a PDF, DOC, or DOCX file');
        return;
      }
      setResume(file);
      setError(null);
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      title: '', company: '', startDate: '', endDate: '', description: ''
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addProject = () => {
    setProjects([...projects, {
      title: '', description: '', technologies: [], url: '', startDate: '', endDate: ''
    }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (resume) {
        formData.append('resume', resume);
      }
      
      formData.append('bio', bio);
      formData.append('linkedin', linkedin);
      formData.append('github', github);
      formData.append('areasOfExpertise', JSON.stringify(areasOfExpertise));
      formData.append('skills', JSON.stringify(skills));
      formData.append('experiences', JSON.stringify(experiences.filter(exp => exp.title && exp.company)));
      formData.append('projects', JSON.stringify(projects.filter(proj => proj.title && proj.description)));

      const response = await axios.post('http://localhost:5002/api/mentorship/setup-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      // Update user to remove needsMentorSetup flag
      updateUser({ needsMentorSetup: false });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/mentorship/dashboard');
      }, 2000);

    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to setup mentor profile');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="success" sx={{ maxWidth: 400 }}>
          <Typography variant="h6">Profile Setup Complete!</Typography>
          <Typography>Redirecting to mentor dashboard...</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          <SchoolIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Setup Your Mentor Profile
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" mb={4}>
          Help students by sharing your expertise, experience, and knowledge. Complete your mentor profile to start connecting with students.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Resume Upload */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <UploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Resume Upload
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                {resume ? resume.name : 'Upload Resume (PDF, DOC, DOCX)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                />
              </Button>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Professional Bio"
                    multiline
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students about your background, experience, and what you can help them with..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn Profile"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="GitHub Profile"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/yourusername"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Areas of Expertise */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Areas of Expertise</Typography>
              <FormControl fullWidth>
                <InputLabel>Select your domains</InputLabel>
                <Select
                  multiple
                  value={areasOfExpertise}
                  onChange={(e) => setAreasOfExpertise(e.target.value as string[])}
                  input={<OutlinedInput label="Select your domains" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {DOMAIN_OPTIONS.map((domain) => (
                    <MenuItem key={domain} value={domain}>
                      {domain}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Technical Skills
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select your skills</InputLabel>
                <Select
                  multiple
                  value={skills}
                  onChange={(e) => setSkills(e.target.value as string[])}
                  input={<OutlinedInput label="Select your skills" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" color="primary" />
                      ))}
                    </Box>
                  )}
                >
                  {SKILL_OPTIONS.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Work Experience
                </Typography>
                <Button startIcon={<AddIcon />} onClick={addExperience}>
                  Add Experience
                </Button>
              </Box>
              
              {experiences.map((exp, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1">Experience {index + 1}</Typography>
                      {experiences.length > 1 && (
                        <IconButton onClick={() => removeExperience(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Job Title"
                          value={exp.title}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          placeholder="Describe your role, responsibilities, and achievements..."
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Notable Projects</Typography>
                <Button startIcon={<AddIcon />} onClick={addProject}>
                  Add Project
                </Button>
              </Box>
              
              {projects.map((project, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1">Project {index + 1}</Typography>
                      {projects.length > 1 && (
                        <IconButton onClick={() => removeProject(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Project Title"
                          value={project.title}
                          onChange={(e) => updateProject(index, 'title', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={project.description}
                          onChange={(e) => updateProject(index, 'description', e.target.value)}
                          placeholder="Describe the project, your role, and impact..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Technologies Used</InputLabel>
                          <Select
                            multiple
                            value={project.technologies}
                            onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                            input={<OutlinedInput label="Technologies Used" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                          >
                            {SKILL_OPTIONS.map((tech) => (
                              <MenuItem key={tech} value={tech}>
                                {tech}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Project URL"
                          value={project.url}
                          onChange={(e) => updateProject(index, 'url', e.target.value)}
                          placeholder="https://github.com/user/project or live demo URL"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          value={project.startDate}
                          onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          value={project.endDate}
                          onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || areasOfExpertise.length === 0 || skills.length === 0 || !bio.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </Box>
          
          {/* Requirements Info */}
          <Box mt={2} p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Required:</strong> Bio, at least one area of expertise, and at least one skill
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Optional:</strong> Resume, work experience, projects, social links
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default MentorSetup;