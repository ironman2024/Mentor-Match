import React, { useState, useRef } from 'react';
import { Box, IconButton, CircularProgress } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from '../../config/axios';
import { useAuth } from '../../contexts/AuthContext';
import UserAvatar from '../common/UserAvatar';

interface AvatarUploadProps {
  currentAvatar?: string;
  size?: number;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  editable?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  size = 120,
  onAvatarUpdate,
  editable = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateUser } = useAuth();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newAvatarUrl = `http://localhost:5002${response.data.url}`;
      setAvatar(newAvatarUrl);
      
      // Update auth context
      if (user && updateUser) {
        updateUser({ ...user, avatar: response.data.url });
      }
      
      // Notify parent component
      if (onAvatarUpdate) {
        onAvatarUpdate(response.data.url);
      }

    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <UserAvatar
        avatar={avatar}
        name={user?.name}
        size={size}
        sx={{
          border: '4px solid #fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      />
      
      {editable && (
        <>
          <IconButton
            onClick={handleFileSelect}
            disabled={uploading}
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: '#0084ff',
              color: 'white',
              width: 36,
              height: 36,
              '&:hover': {
                bgcolor: '#0066cc'
              }
            }}
          >
            {uploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PhotoCamera sx={{ fontSize: 18 }} />
            )}
          </IconButton>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </>
      )}
    </Box>
  );
};

export default AvatarUpload;