import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import useAuthStore from '../../store/authStore';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Zoom,
  CssBaseline
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [loaded, setLoaded] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  
  useEffect(() => {
    // Trigger animations after component mount
    setLoaded(true);
    
    // If user is authenticated, show logout button
    if (isAuthenticated) {
      console.log('User is already authenticated');
    }
  }, [isAuthenticated]);
  
  const handleRoleSelect = (role) => {
    // Store the selected role in session storage
    sessionStorage.setItem('selectedRole', role);
    navigate('/login');
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          maxWidth: '100%',
          background: 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: '60px 16px 16px', sm: '70px 24px 24px', md: '80px 32px 32px' },
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          margin: 0,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
        }}
      >
      {/* Top Wave */}
      <Box
        className="wave-animation"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '120px',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'0.15\' d=\'M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,170.7C960,160,1056,96,1152,74.7C1248,53,1344,75,1392,85.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z\'%3E%3C/path%3E%3C/svg%3E")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          opacity: 0.8
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Header */}
        <Fade in={loaded} timeout={800}>
          <Paper
            elevation={6}
            sx={{
              padding: { xs: 3, sm: 4, md: 5 },
              marginTop: { xs: 2, sm: 3, md: 4 },
              marginBottom: { xs: 3, sm: 4, md: 5 },
              textAlign: 'center',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            fontWeight="bold" 
            color="primary"
            sx={{ 
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
              letterSpacing: '0.5px',
              textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Digital Attendance Management System
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph
            sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
          >
            Select your role to continue to the login page
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              my: 2 
            }}
          >
            <Divider sx={{ width: '40%', borderColor: theme.palette.primary.main, borderWidth: 1 }} />
            <SecurityIcon sx={{ mx: 2, color: theme.palette.primary.main }} />
            <Divider sx={{ width: '40%', borderColor: theme.palette.primary.main, borderWidth: 1 }} />
          </Box>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            This system helps manage student attendance efficiently, providing different features based on your role.
          </Typography>
          </Paper>
        </Fade>

        {/* Role Selection Cards */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
          {/* Admin Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Grow in={loaded} timeout={1000} style={{ transformOrigin: '0 0 0' }}>
              <Card 
                elevation={6}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(63, 81, 181, 0.3)'
                  }
                }}
            >
              <Box 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  display: 'flex', 
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(63, 81, 181, 0.05) 100%)',
                  borderBottom: '1px solid rgba(63, 81, 181, 0.1)'
                }}
              >
                <AdminIcon 
                  className="card-icon floating-icon"
                  sx={{ 
                    fontSize: { xs: 60, sm: 70, md: 80 }, 
                    color: 'primary.main',
                    filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))'
                  }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h2" 
                  align="center" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
                >
                  Administrator
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: 'primary.light' }} />
                <Typography variant="body2" color="text.secondary">
                  • Manage all teachers and students
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Create and assign classes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • View comprehensive attendance reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Configure system settings
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleRoleSelect('admin')}
                  fullWidth
                  sx={{ 
                    py: 1.2, 
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 10px rgba(63, 81, 181, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(63, 81, 181, 0.4)'
                    }
                  }}
                >
                  Login as Admin
                </Button>
              </CardActions>
            </Card>
            </Grow>
          </Grid>

          {/* Teacher Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Grow in={loaded} timeout={1200} style={{ transformOrigin: '0 0 0' }}>
              <Card 
                elevation={6}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(156, 39, 176, 0.3)'
                  }
                }}
            >
              <Box 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  display: 'flex', 
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)',
                  borderBottom: '1px solid rgba(156, 39, 176, 0.1)'
                }}
              >
                <PersonIcon 
                  className="card-icon floating-icon"
                  sx={{ 
                    fontSize: { xs: 60, sm: 70, md: 80 }, 
                    color: 'secondary.main',
                    filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))'
                  }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h2" 
                  align="center" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
                >
                  Teacher
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: 'secondary.light' }} />
                <Typography variant="body2" color="text.secondary">
                  • Mark attendance for assigned classes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • View and manage your students
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Generate attendance reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Track student attendance trends
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleRoleSelect('teacher')}
                  fullWidth
                  sx={{ 
                    py: 1.2, 
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 10px rgba(156, 39, 176, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(156, 39, 176, 0.4)'
                    }
                  }}
                >
                  Login as Teacher
                </Button>
              </CardActions>
            </Card>
            </Grow>
          </Grid>

          {/* Student Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Grow in={loaded} timeout={1400} style={{ transformOrigin: '0 0 0' }}>
              <Card 
                elevation={6}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(3, 169, 244, 0.3)'
                  }
                }}
            >
              <Box 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  display: 'flex', 
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(3, 169, 244, 0.1) 0%, rgba(3, 169, 244, 0.05) 100%)',
                  borderBottom: '1px solid rgba(3, 169, 244, 0.1)'
                }}
              >
                <SchoolIcon 
                  className="card-icon floating-icon"
                  sx={{ 
                    fontSize: { xs: 60, sm: 70, md: 80 }, 
                    color: 'info.main',
                    filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))'
                  }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h2" 
                  align="center" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
                >
                  Student
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: 'info.light' }} />
                <Typography variant="body2" color="text.secondary">
                  • View your attendance history
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Check attendance statistics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Update your personal information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Track your attendance performance
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  variant="contained" 
                  color="info" 
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleRoleSelect('student')}
                  fullWidth
                  sx={{ 
                    py: 1.2, 
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 10px rgba(3, 169, 244, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(3, 169, 244, 0.4)'
                    }
                  }}
                >
                  Login as Student
                </Button>
              </CardActions>
            </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Logout Button (only shown if user is authenticated) */}
        {isAuthenticated && (
          <Fade in={loaded} timeout={1400}>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  logout();
                  window.location.reload(); // Force reload to clear any cached state
                }}
                sx={{
                  py: 1,
                  px: 3,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                Logout & Clear Session
              </Button>
            </Box>
          </Fade>
        )}
        
        {/* Footer */}
        <Fade in={loaded} timeout={1600}>
          <Box sx={{ mt: { xs: 4, sm: 5, md: 6 }, textAlign: 'center', color: 'white' }}>
            <Typography variant="body2" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              © {new Date().getFullYear()} Digital Attendance Management System
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              Secure, Efficient, and User-Friendly
            </Typography>
          </Box>
        </Fade>
        
        {/* Bottom Wave */}
        <Box
          className="wave-animation"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '150px',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'0.15\' d=\'M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
          }}
        />
      </Container>
    </Box>
    </>
  );
};

export default LandingPage;
