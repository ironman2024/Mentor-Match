import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { CloudUpload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';

interface CertificateUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (certificateData: any) => void;
}

const CertificateUploadDialog: React.FC<CertificateUploadDialogProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    verificationUrl: '',
    description: '',
    file: null as File | null
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: event.target.files![0]
      }));
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Upload Certificate
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={3}>
          <input
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            id="certificate-file"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="certificate-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Select Certificate File
            </Button>
          </label>
          {formData.file && (
            <Typography variant="caption" display="block" mt={1}>
              Selected: {formData.file.name}
            </Typography>
          )}
        </Box>

        <TextField
          fullWidth
          label="Certificate Title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Issuing Organization"
          value={formData.issuer}
          onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Issue Date"
          type="date"
          value={formData.issueDate}
          onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          fullWidth
          label="Verification URL (optional)"
          value={formData.verificationUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, verificationUrl: e.target.value }))}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.file || !formData.title || !formData.issuer || !formData.issueDate}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CertificateUploadDialog;
