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
  Alert,
  CircularProgress
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

interface OpportunityApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  opportunity: any;
  onApplicationSubmitted: () => void;
}

const OpportunityApplicationDialog: React.FC<OpportunityApplicationDialogProps> = ({
  open,
  onClose,
  opportunity,
  onApplicationSubmitted
}) => {
  const [formData, setFormData] = useState({
    coverLetter: ''
  });
  const [resume, setResume] = useState<File | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.coverLetter.trim()) {
      setError('Cover letter is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('opportunityId', opportunity._id);
      submitData.append('coverLetter', formData.coverLetter);
      
      if (resume) {
        submitData.append('resume', resume);
      }
      
      if (additionalDocs) {
        Array.from(additionalDocs).forEach(file => {
          submitData.append('additionalDocuments', file);
        });
      }

      await axios.post('http://localhost:5002/api/opportunity-applications', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onApplicationSubmitted();
      onClose();
      setFormData({ coverLetter: '' });
      setResume(null);
      setAdditionalDocs(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({ coverLetter: '' });
      setResume(null);
      setAdditionalDocs(null);
      setError('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Apply for: {opportunity?.title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Opportunity Details
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {opportunity?.description}
            </Typography>
            <Typography variant="body2">
              <strong>Type:</strong> {opportunity?.type}
            </Typography>
            {opportunity?.deadline && (
              <Typography variant="body2">
                <strong>Deadline:</strong> {new Date(opportunity.deadline).toLocaleDateString()}
              </Typography>
            )}
          </Box>

          <TextField
            label="Cover Letter"
            multiline
            rows={6}
            fullWidth
            required
            value={formData.coverLetter}
            onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
            placeholder="Explain why you're interested in this opportunity and what makes you a good fit..."
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Resume (Optional)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
            >
              {resume ? resume.name : 'Upload Resume'}
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
              />
            </Button>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Additional Documents (Optional)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
            >
              {additionalDocs ? `${additionalDocs.length} file(s) selected` : 'Upload Additional Documents'}
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setAdditionalDocs(e.target.files)}
              />
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpportunityApplicationDialog;