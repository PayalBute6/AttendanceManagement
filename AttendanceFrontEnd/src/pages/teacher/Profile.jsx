import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import teacherService from '../../services/teacherService';
import userService from '../../services/userService';

const TeacherProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    username: '',
    phoneNumber: '',
    department: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',
        department: user.department || ''
      });
    }
  }, [user]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Use teacherService to get the current teacher's profile
      const userData = await teacherService.getCurrentTeacher();
      console.log('Loaded teacher profile:', userData);
      
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        username: userData.username || '',
        phoneNumber: userData.phoneNumber || '',
        department: userData.department || ''
      });
      updateUser(userData);
    } catch (error) {
      console.error('Failed to load teacher profile:', error);
      showAlert('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // For profile updates, we'll use the userService.updateProfile method
      // This is a more generic endpoint that doesn't require specific teacher ID permissions
      console.log('Updating teacher profile with data:', profileData);
      const updatedUser = await userService.updateProfile(profileData);
      updateUser(updatedUser);
      showAlert('Profile updated successfully', 'success');
      
      // Refresh the profile data to ensure we have the latest information
      await loadUserProfile();
    } catch (error) {
      console.error('Failed to update teacher profile:', error);
      showAlert(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }

    setSaving(true);
    try {
      await userService.changePassword(passwordData);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showAlert('Password changed successfully', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Typography variant="h4" gutterBottom>
            Teacher Profile
          </Typography>

          <Grid container spacing={3}>
            {/* Profile Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{
                borderRadius: 2,
                boxShadow: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 3,
                      bgcolor: 'primary.main',
                      boxShadow: 2,
                      border: '4px solid #fff'
                    }}
                  >
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>{profileData.name}</Typography>
                  <Typography color="textSecondary" gutterBottom>{profileData.email}</Typography>
                  <Typography variant="body2" sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    px: 2,
                    py: 0.5,
                    borderRadius: 10,
                    fontWeight: 'medium',
                    mt: 1
                  }}>
                    Role: Teacher
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Profile Form */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Personal Information</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <form onSubmit={handleProfileSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={profileData.name}
                        disabled
                        variant="outlined"
                        InputProps={{
                          sx: { borderRadius: 1, bgcolor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={profileData.email}
                        disabled
                        variant="outlined"
                        InputProps={{
                          sx: { borderRadius: 1, bgcolor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={profileData.username}
                        disabled
                        variant="outlined"
                        InputProps={{
                          sx: { borderRadius: 1 }
                        }}
                      />
                    </Grid>
                    {/* Phone number field removed as requested */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Department"
                        name="department"
                        value={profileData.department}
                        disabled
                        variant="outlined"
                        InputProps={{
                          sx: { borderRadius: 1, bgcolor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      />
                    </Grid>
                    {/* <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={saving}
                        sx={{ mt: 2, borderRadius: 1, px: 4 }}
                      >
                        {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                    </Grid> */}
                  </Grid>
                </form>
              </Paper>

              {/* Password Form */}
              <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Change Password</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        variant="outlined"
                        InputProps={{
                          sx: { borderRadius: 1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        variant="outlined"
                        InputProps={{
                          sx: { borderRadius: 1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        variant="outlined"
                        InputProps={{
                          sx: { borderRadius: 1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={saving}
                        sx={{ mt: 2, borderRadius: 1, px: 4 }}
                      >
                        {saving ? <CircularProgress size={24} /> : 'Change Password'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
          </Grid>

          <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
              {alert.message}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </Box>
  );
};

export default TeacherProfile;
