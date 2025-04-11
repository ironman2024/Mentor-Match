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
  IconButton,
  createTheme,
  ThemeProvider,
  styled
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';

// Define custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2D3E50', // Navy blue - conveys trust and professionalism
      light: '#3E5971',
      dark: '#1A2530',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E74C3C', // Coral red - for accents and highlights
      light: '#F5675A',
      dark: '#C0392B',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA', // Light gray for backgrounds
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3E50', // Dark navy for primary text
      secondary: '#596273', // Slate gray for secondary text
    },
    info: {
      main: '#1ABC9C', // Teal - complementary to coral for additional accents
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      color: '#2D3E50',
    },
    subtitle1: {
      color: '#2D3E50',
    },
    subtitle2: {
      color: '#596273',
      fontWeight: 500,
    },
    body1: {
      color: '#2D3E50',
    },
    body2: {
      color: '#596273',
    },
  },
});

// Custom styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const MessageTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const CategoryHeader = styled(Typography)(({ theme }) => ({
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontSize: '0.85rem',
  fontWeight: 600,
  paddingLeft: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 8,
  margin: '4px 0',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#F5F7FA',
    transform: 'translateY(-1px)',
  },
  '&.Mui-selected': {
    backgroundColor: '#E8F0FE',
    '&:hover': {
      backgroundColor: '#D8E5FC',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 600,
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: '#F5F7FA',
  },
}));

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
      setSearch('');
      setSelectedUser(null);
      setMessage('');
    }
  }, [open]);

  useEffect(() => {
    if (search) {
      searchUsers();
    } else {
      setSearchResults([]);
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
    <Box sx={{ mb: 2 }}>
      <CategoryHeader color="textSecondary">
        {title}
      </CategoryHeader>
      <List disablePadding>
        {users.map((user) => (
          <StyledListItem
            button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            selected={selectedUser?._id === user._id}
          >
            <ListItemAvatar>
              <Avatar 
                src={user.avatar} 
                sx={{ 
                  bgcolor: !user.avatar ? '#1ABC9C' : undefined,
                  width: 40, 
                  height: 40 
                }}
              >
                {user.name[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" fontWeight={500}>
                  {user.name}
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="textSecondary">
                  {`${user.role}${user.department ? ` • ${user.department}` : ''}`}
                </Typography>
              }
            />
          </StyledListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <StyledDialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ px: 3, py: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedUser ? 'Send Message' : 'New Message'}
            </Typography>
            <CloseButton onClick={onClose} size="small">
              <CloseIcon />
            </CloseButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1 }}>
          {!selectedUser ? (
            <>
              <SearchTextField
                fullWidth
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: loading && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} color="primary" />
                    </InputAdornment>
                  )
                }}
              />
              <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
                {search ? (
                  searchResults.length > 0 ? (
                    renderUserList(searchResults, 'Search Results')
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="textSecondary">
                        No results found for "{search}"
                      </Typography>
                    </Box>
                  )
                ) : (
                  <>
                    {recommendations.mentors && recommendations.mentors.length > 0 && 
                      renderUserList(recommendations.mentors, 'Faculty & Alumni')}
                    
                    {recommendations.clubs && recommendations.clubs.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        {renderUserList(recommendations.clubs, 'Clubs')}
                      </>
                    )}
                    
                    {recommendations.students && recommendations.students.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        {renderUserList(recommendations.students, 'Students')}
                      </>
                    )}
                  </>
                )}
              </Box>
            </>
          ) : (
            <Box>
              <Box 
                display="flex" 
                alignItems="center" 
                mb={3} 
                p={2} 
                sx={{ 
                  backgroundColor: '#F5F7FA',
                  borderRadius: 2
                }}
              >
                <Avatar 
                  src={selectedUser.avatar} 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    mr: 2,
                    bgcolor: !selectedUser.avatar ? '#1ABC9C' : undefined
                  }}
                >
                  {selectedUser.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedUser.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {`${selectedUser.role}${selectedUser.department ? ` • ${selectedUser.department}` : ''}`}
                  </Typography>
                </Box>
              </Box>
              <MessageTextField
                fullWidth
                multiline
                rows={6}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: selectedUser ? 'space-between' : 'flex-end' }}>
          {selectedUser && (
            <>
              <ActionButton 
                startIcon={<ArrowBackIcon />}
                onClick={() => setSelectedUser(null)}
              >
                Back
              </ActionButton>
              <ActionButton
                variant="contained"
                color="secondary"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                Send Message
              </ActionButton>
            </>
          )}
        </DialogActions>
      </StyledDialog>
    </ThemeProvider>
  );
};

export default SendMessageDialog;