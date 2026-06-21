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
  Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login attempt with:', { username: email });
      const data = await authService.login(email, password);
      console.log('Login response from server:', data);
      
      // Check if role exists in the response
      if (!data.role) {
        console.error('No role found in response:', data);
        setError('Login successful but no role information received from server');
        setLoading(false);
        return;
      }
      
      // Log the original role from backend
      console.log('Original role from backend:', data.role);
      
      // Create a user object from the response
      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: data.role.replace('ROLE_', '').toLowerCase() // Convert ROLE_ADMIN or ROLE_TEACHER to admin or teacher
      };
      
      // Log the processed role
      console.log('Processed role for frontend:', userData.role);
      
      // Store in auth store
      login(userData, data.token, userData.role);
      console.log('Stored in auth store with role:', userData.role);
      
      // Redirect based on user role with explicit logging
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
      setError(err.message || 'Invalid email or password');
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

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={6}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            color={getRoleColor()}
          >
            Back to Home
          </Button>
        </Box>
        
        <Avatar sx={{ m: 1, bgcolor: `${getRoleColor()}.main` }}>
          {getRoleIcon()}
        </Avatar>
        <Typography component="h1" variant="h5">
          Digital Attendance
        </Typography>
        
        {selectedRole && (
          <Chip 
            label={`Login as ${getRoleTitle()}`} 
            color={getRoleColor()} 
            sx={{ mt: 1 }} 
            icon={getRoleIcon()} 
          />
        )}
        
        <Typography component="h2" variant="h6" sx={{ mt: 1 }}>
          Sign In
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
