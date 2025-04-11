import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  IconButton,
  Divider,
  Typography
} from '@mui/material';
import {
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  Assignment as CertificateIcon
} from '@mui/icons-material';

interface PostCreatorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (image?: File) => void;
  onCertificateClick: () => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({
  value,
  onChange,
  onSubmit,
  onCertificateClick
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Share an update, achievement or ask a question..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ mb: 2 }}
        />
        {selectedImage && (
          <Box mb={2}>
            <Typography variant="caption">Selected: {selectedImage.name}</Typography>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <IconButton onClick={() => fileInputRef.current?.click()}>
              <ImageIcon />
            </IconButton>
            <IconButton>
              <EmojiIcon />
            </IconButton>
            <IconButton onClick={onCertificateClick}>
              <CertificateIcon />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            disabled={!value.trim()}
            onClick={() => onSubmit(selectedImage || undefined)}
          >
            Post
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostCreator;
