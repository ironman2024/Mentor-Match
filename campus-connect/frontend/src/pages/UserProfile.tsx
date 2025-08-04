import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Message as MessageIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PostFeed from '../components/posts/PostFeed';
import MessageDialog from '../components/dialogs/MessageDialog';
import UserAvatar from '../components/common/UserAvatar';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const UserProfile: React.FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);
  const [openMessage, setOpenMessage] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/profile/${userId}`);
      setProfile(response.data.profile);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const isOwnProfile = user?.id === userId;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box display="flex" gap={3}>
            <UserAvatar
              user={profile?.user}
              size={120}
            />
            <Box>
              <Typography variant="h4">{profile?.user?.name}</Typography>
              <Typography color="textSecondary">{profile?.headline}</Typography>
              <Box display="flex" gap={1} mt={1}>
                {profile?.socialLinks?.linkedin && (
                  <IconButton href={profile.socialLinks.linkedin} target="_blank">
                    <LinkedInIcon />
                  </IconButton>
                )}
                {profile?.socialLinks?.github && (
                  <IconButton href={profile.socialLinks.github} target="_blank">
                    <GitHubIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
          <Box>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setOpenEdit(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<MessageIcon />}
                onClick={() => setOpenMessage(true)}
              >
                Message
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
        <Tab label="About" />
        <Tab label="Experience" />
        <Tab label="Education" />
        <Tab label="Posts" />
        <Tab label="Achievements" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>About</Typography>
          <Typography paragraph>{profile?.bio}</Typography>
          <Typography variant="h6" gutterBottom>Skills</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {profile?.skills.map((skill: string) => (
              <Chip key={skill} label={skill} />
            ))}
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <List>
            {profile?.experiences.map((exp: any, index: number) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={exp.title}
                    secondary={
                      <>
                        <Typography variant="body2">{exp.company}</Typography>
                        <Typography variant="caption">
                          {new Date(exp.startDate).toLocaleDateString()} - 
                          {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">{exp.description}</Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < profile.experiences.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <PostFeed posts={posts} />
      </TabPanel>



      {openMessage && (
        <MessageDialog
          open={openMessage}
          onClose={() => setOpenMessage(false)}
          recipientId={userId}
          recipientName={profile?.user?.name}
        />
      )}
    </Box>
  );
};

export default UserProfile;
