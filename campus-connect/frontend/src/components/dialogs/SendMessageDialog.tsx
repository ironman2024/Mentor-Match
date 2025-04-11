import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  InputAdornment,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

interface SendMessageDialogProps {
  open: boolean;
  onClose: () => void;
}

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({ open, onClose }) => {
  const [search, setSearch] = useState('');
  const [recommendations, setRecommendations] = useState<any>({
    mentors: [],
    students: [],
    clubs: []
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      fetchRecommendations();
    }
  }, [open]);

  useEffect(() => {
    if (search) {
      searchUsers();
    }
  }, [search]);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/users/recommendations');
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const searchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5002/api/users/search?q=${search}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      await axios.post('http://localhost:5002/api/messages', {
        recipientId: selectedUser._id,
        content: message
      });
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderUserList = (users: any[], title: string) => (
    <Box>
      <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2, mb: 1 }}>
        {title}
      </Typography>
      <List>
        {users.map((user) => (
          <ListItem
            button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            selected={selectedUser?._id === user._id}
          >
            <ListItemAvatar>
              <Avatar src={user.avatar}>{user.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={user.name}
              secondary={`${user.role}${user.department ? ` • ${user.department}` : ''}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {selectedUser ? 'Send Message' : 'New Message'}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {!selectedUser ? (
          <>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: loading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                )
              }}
            />
            {search ? (
              renderUserList(searchResults, 'Search Results')
            ) : (
              <>
                {renderUserList(recommendations.mentors, 'Faculty & Alumni')}
                <Divider />
                {renderUserList(recommendations.clubs, 'Clubs')}
                <Divider />
                {renderUserList(recommendations.students, 'Students')}
              </>
            )}
          </>
        ) : (
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar src={selectedUser.avatar} sx={{ mr: 1 }}>
                {selectedUser.name[0]}
              </Avatar>
              <Typography>{selectedUser.name}</Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {selectedUser && (
          <>
            <Button onClick={() => setSelectedUser(null)}>Back</Button>
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              Send
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SendMessageDialog;
