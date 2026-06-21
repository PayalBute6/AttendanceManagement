import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Class as ClassIcon,
  Person as PersonIcon,
  Book as BookIcon 
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import teacherService from '../../services/teacherService';

const MyClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch classes data for the teacher
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Current user:', user);
        
        // Use the teacherService to fetch assigned classes
        console.log('Calling teacherService.getAssignedClasses()');
        const classesData = await teacherService.getAssignedClasses();
        console.log('API Response for assigned classes:', classesData);
        
        if (Array.isArray(classesData)) {
          console.log(`Found ${classesData.length} assigned classes`);
          setClasses(classesData);
          
          if (classesData.length === 0) {
            // Get current teacher profile to verify identity
            try {
              const teacherProfile = await teacherService.getCurrentTeacher();
              console.log('Current teacher profile:', teacherProfile);
              console.log('Teacher ID that should have classes assigned:', teacherProfile.id);
            } catch (profileError) {
              console.error('Error fetching teacher profile:', profileError);
            }
          }
        } else {
          console.error('API returned non-array data:', classesData);
          setClasses([]);
          setError('No classes found or invalid data format');
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        console.error('Error details:', error.response?.data || error.message);
        setError(error.message || 'Failed to fetch assigned classes');
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      console.log('User is logged in, fetching classes');
      fetchClasses();
    } else {
      console.log('No user found, cannot fetch classes');
    }
  }, [user]);

  const handleClassClick = (classId) => {
    // Navigate to class details page (adjust the route to match your setup)
    navigate(`/teacher/classes/${classId}`);
  };

  const handleAddClass = () => {
    // Navigate to the "add class" page or handle adding a class
    navigate('/teacher/classes/add');
  };

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        My Classes
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View and manage your assigned classes
      </Typography>
      
      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ClassIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                          {classItem.name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={classItem.section || 'No Section'} 
                          size="small" 
                          color="secondary" 
                          sx={{ mr: 1, fontWeight: 'medium' }}
                        />
                        <Chip 
                          label={classItem.subject || 'No Subject'} 
                          size="small" 
                          color="info"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          <strong>{classItem.numberOfStudents || 0}</strong> Students
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                      <Button 
                        size="medium" 
                        variant="outlined"
                        onClick={() => handleClassClick(classItem.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="medium" 
                        variant="contained" 
                        color="primary" 
                        onClick={() => navigate(`/teacher/attendance/mark?classId=${classItem.id}`)}
                      >
                        Mark Attendance
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" paragraph>
                    No classes have been assigned to you yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please contact the administrator to get classes assigned to your account.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MyClasses;
