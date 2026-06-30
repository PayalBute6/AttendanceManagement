import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  InputAdornment,
  Zoom,
  CssBaseline
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  ArrowBack as ArrowBackIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Visibility,
  VisibilityOff,
  AccountCircle
} from '@mui/icons-material';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  useEffect(() => {
    // Get the selected role from session storage
    const role = sessionStorage.getItem('selectedRole');
    if (role) {
      setSelectedRole(role);
    }
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login attempt with:', { username: email });
      const data = await authService.login(email, password);
      console.log('Login response from server:', data);
      
      if (!data.role) {
        console.error('No role found in response:', data);
        setError('Login successful but no role information received from server');
        setLoading(false);
        return;
      }
      
      console.log('Original role from backend:', data.role);
      
      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: data.role.replace('ROLE_', '').toLowerCase()
      };
      
      console.log('Processed role for frontend:', userData.role);
      
      login(userData, data.token, userData.role);
      console.log('Stored in auth store with role:', userData.role);
      
      if (userData.role === 'admin') {
        console.log('Role is admin, navigating to admin dashboard');
        navigate('/admin/dashboard');
      } else if (userData.role === 'teacher') {
        console.log('Role is teacher, navigating to teacher dashboard');
        navigate('/teacher/dashboard');
      } else {
        console.log('Role is not admin or teacher, navigating to student dashboard. Role:', userData.role);
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  // Get the appropriate icon and color based on selected role
  const getRoleIcon = () => {
    switch(selectedRole) {
      case 'admin':
        return <AdminPanelSettingsIcon />;
      case 'teacher':
        return <PersonIcon />;
      case 'student':
        return <SchoolIcon />;
      default:
        return <LockOutlinedIcon />;
    }
  };
  
  const getRoleColor = () => {
    switch(selectedRole) {
      case 'admin':
        return 'primary';
      case 'teacher':
        return 'secondary';
      case 'student':
        return 'info';
      default:
        return 'primary';
    }
  };
  
  const getRoleTitle = () => {
    switch(selectedRole) {
      case 'admin':
        return 'Administrator';
      case 'teacher':
        return 'Teacher';
      case 'student':
        return 'Student';
      default:
        return '';
    }
  };

  const getButtonGradient = () => {
    switch(selectedRole) {
      case 'admin':
        return 'linear-gradient(135deg, #1976d2 0%, #115293 100%)';
      case 'teacher':
        return 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)';
      case 'student':
        return 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)';
      default:
        return 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)';
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Container component="main" maxWidth="xs">
          <Zoom in={true} timeout={500}>
            <Paper 
              elevation={12}
              sx={{
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <Button
                  component={Link}
                  to="/"
                  startIcon={<ArrowBackIcon />}
                  color={getRoleColor()}
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                  Back to Home
                </Button>
              </Box>
              
              <Avatar sx={{ m: 1, bgcolor: `${getRoleColor()}.main`, width: 56, height: 56, boxShadow: 3 }}>
                {getRoleIcon()}
              </Avatar>
              
              <Typography component="h1" variant="h4" fontWeight="bold" color="text.primary" sx={{ mt: 1 }}>
                Digital Attendance
              </Typography>
              
              {selectedRole && (
                <Chip 
                  label={`Sign In as ${getRoleTitle()}`} 
                  color={getRoleColor()} 
                  sx={{ mt: 1.5, fontWeight: 'bold', px: 1 }} 
                  icon={getRoleIcon()} 
                />
              )}
              
              {error && (
                <Alert severity="error" sx={{ width: '100%', mt: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Username"
                  name="email"
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    mt: 4, 
                    mb: 2, 
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textTransform: 'none',
                    background: getButtonGradient(),
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                      background: getButtonGradient(),
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : `Log In as ${getRoleTitle() || 'User'}`}
                </Button>
              </Box>
            </Paper>
          </Zoom>
        </Container>
      </Box>
    </>
  );
};

export default Login;
