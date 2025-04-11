import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, AppBar, Toolbar, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LoginIcon from '@mui/icons-material/Login';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ChatIcon from '@mui/icons-material/Chat';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MessageIcon from '@mui/icons-material/Message';

const Homepage = () => {
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  return (
    <>
      {/* Navbar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(181,187,201,0.12)',
          transition: 'transform 0.3s ease-in-out',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          '&:hover': {
            background: 'rgba(255,255,255,1)',
          }
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          maxWidth: 'lg',
          mx: 'auto',
          width: '100%',
          py: 1.5,
          px: { xs: 2, sm: 4, md: 6 }
        }}>
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '1.5rem', md: '1.8rem' }, 
              color: '#585E6C', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.85
              }
            }}
          >
            <SchoolIcon sx={{ 
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: '#585E6C'
            }} />
            MatchMentor
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            alignItems: 'center'
          }}>
            <Button
              variant="outlined"
              component={Link}
              to="/login"
              sx={{
                borderColor: '#585E6C',
                color: '#585E6C',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '30px',
                px: { xs: 2, sm: 3 },
                py: 1,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'rgba(88,94,108,0.08)',
                  borderColor: '#585E6C',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              component={Link}
              to="/register"
              sx={{
                background: '#585E6C',
                color: 'white',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '30px',
                px: { xs: 2, sm: 3 },
                py: 1,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.2s',
                '&:hover': {
                  background: '#474D59',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(88,94,108,0.25)',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed navbar */}

      {/* Hero Section */}
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, background: '#F8F9FB', px: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { xs: 'center', md: 'flex-start' }, p: 4 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.2rem', md: '3.8rem' },
              maxWidth: '800px',
              mb: 3,
              color: '#585E6C',
            }}
          >
            Find your perfect mentor & unlock your academic potential
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#B5BBC9',
              mb: 5,
              maxWidth: '600px',
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            Explore one-on-one mentoring to build clarity, confidence, and career direction.
          </Typography>

          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/register"
            sx={{
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              borderRadius: '30px',
              background: '#585E6C',
              color: 'white',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(88,94,108,0.3)',
              '&:hover': {
                background: '#474D59',
              },
            }}
          >
            Get Started
          </Button>
        </Box>
        <Box sx={{ flex: 1, position: 'relative', minHeight: { xs: '300px', md: '600px' } }}>
          <Box
            component="img"
            src="./src/images/Professor-pana.svg"
            alt="Mentor and Student Illustration"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' },
              }
            }}
          />
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, background: '#585E6C' }}>
        <Typography variant="h4" fontWeight={600} textAlign="center" mb={8} sx={{ color: 'white' }}>
          Why MatchMentor?
        </Typography>
        <Grid container spacing={4} maxWidth="lg" mx="auto" px={3}>
          {[
            {
              title: 'Smart Matching',
              description: 'Our AI-powered system connects you with the most compatible mentors based on your skills and goals.',
              image: './src/images/Collaboration-rafiki.svg'
            },
            {
              title: 'Project Collaboration',
              description: 'Form compatible project teams and work together on innovative engineering projects.',
              image: './src/images/Connecting teams-cuate.svg'
            },
            {
              title: 'Skill Showcase',
              description: 'Build and showcase your portfolio of skills, projects, and achievements.',
              image: './src/images/Resume-bro.svg'
            },
            {
              title: 'Smart Dashboard',
              description: 'Track your progress, manage certifications, and view insights all in one place.',
              image: './src/images/Control Panel-rafiki.svg'
            },
            {
              title: 'Real-time Communication',
              description: 'Connect seamlessly with mentors and team members through integrated chat and video calls.',
              image: './src/images/Live collaboration-bro.svg'
            },
            {
              title: 'Gamified Learning',
              description: 'Earn rewards, badges, and recognition as you progress in your learning journey.',
              image: './src/images/Game analytics-rafiki.svg'
            }
          ].map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Box
                sx={{
                  background: '#F8F9FB',
                  borderRadius: '24px',
                  p: 4,
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid #B5BBC9',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                    background: 'white',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  component="img"
                  src={feature.image}
                  alt={feature.title}
                  sx={{
                    width: '200px',
                    height: '160px',
                    objectFit: 'contain',
                    mb: 4
                  }}
                />
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  mb={2}
                  sx={{ color: '#585E6C' }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  sx={{ 
                    color: '#585E6C',
                    lineHeight: 1.6,
                    opacity: 0.8
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works Section - Updated */}
      <Box textAlign="center" sx={{ py: 10, background: '#F8F9FB' }}>
        <Typography variant="h4" fontWeight={600} mb={6} sx={{ color: '#585E6C' }}>
          How It Works
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            { 
              step: '1', 
              title: 'Login/Register', 
              description: 'Create your account or login to get started',
              icon: <LoginIcon sx={{ fontSize: 40, color: '#585E6C' }} />,
              image: '/images/login-illustration.svg'
            },
            { 
              step: '2', 
              title: 'Select Mentor', 
              description: 'Browse and choose from our verified mentors',
              icon: <PersonSearchIcon sx={{ fontSize: 40, color: '#585E6C' }} />,
              image: '/images/select-mentor.svg'
            },
            { 
              step: '3', 
              title: 'Start Chat', 
              description: 'Connect and schedule sessions with your mentor',
              icon: <ChatIcon sx={{ fontSize: 40, color: '#585E6C' }} />,
              image: '/images/start-chat.svg'
            },
          ].map(({ step, title, description, icon, image }) => (
            <Grid item xs={12} sm={4} key={step}>
              <Box sx={{ 
                px: 3,
                py: 4,
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(88,94,108,0.1)',
              }}>
                <Box
                  component="img"
                  src={image}
                  alt={title}
                  sx={{
                    width: '180px',
                    height: '140px',
                    objectFit: 'contain',
                    mb: 3
                  }}
                />
                {icon}
                <Typography variant="h2" sx={{ color: '#B5BBC9', fontWeight: 700, my: 2 }}>
                  {step}
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ color: '#585E6C', mb: 1 }}>
                  {title}
                </Typography>
                <Typography sx={{ color: '#B5BBC9' }}>
                  {description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 10, background: 'white' }}>
        <Typography variant="h4" textAlign="center" fontWeight={600} mb={6} sx={{ color: '#585E6C' }}>
          Frequently Asked Questions
        </Typography>
        <Box maxWidth="800px" mx="auto" px={3}>
          {[
            {
              question: 'How do I get started with MatchMentor?',
              answer: 'Simply create an account, complete your profile, and start browsing our mentor directory.'
            },
            {
              question: 'How are mentors verified?',
              answer: 'All mentors go through a thorough verification process including academic credentials check and interview.'
            },
            {
              question: 'Is mentoring free?',
              answer: 'While basic matching is free, mentors set their own rates for one-on-one sessions.'
            },
            {
              question: 'Can I change my mentor?',
              answer: 'Yes, you can switch mentors at any time if you feel the current match isn\'t working for you.'
            },
          ].map((faq, index) => (
            <Accordion 
              key={index}
              sx={{
                mb: 2,
                borderRadius: '8px',
                '&:before': { display: 'none' },
                boxShadow: '0 2px 8px rgba(88,94,108,0.1)',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={500} sx={{ color: '#585E6C' }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: '#B5BBC9' }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      {/* About Us Section */}
      <Box sx={{ py: 10, background: '#585E6C' }}>
        <Grid container maxWidth="lg" mx="auto" px={3} spacing={6}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={600} mb={3} sx={{ color: 'white' }}>
              About MatchMentor
            </Typography>
            <Typography sx={{ color: '#B5BBC9', mb: 2, lineHeight: 1.8 }}>
              MatchMentor was founded with a simple mission: to make quality mentorship accessible to every student. We believe in the power of guidance and how it can transform academic journeys.
            </Typography>
            <Typography sx={{ color: '#B5BBC9', lineHeight: 1.8 }}>
              Our platform connects students with experienced mentors who have walked the path before them, providing invaluable insights and direction for academic and career success.
            </Typography>
            <Button
              variant="outlined"
              sx={{
                mt: 4,
                color: 'white',
                borderColor: 'white',
                borderRadius: '30px',
                px: 4,
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Learn More
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
                height: '100%',
                minHeight: 400,
              }}
            >
              {[
                '/images/about-1.jpg',
                '/images/about-2.jpg',
                '/images/about-3.jpg',
                '/images/about-4.jpg'
              ].map((img, index) => (
                <Box
                  key={index}
                  component="img"
                  src={img}
                  alt={`About us ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    transform: index % 2 ? 'translateY(20px)' : 'translateY(0)',
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Homepage;