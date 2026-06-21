import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import teacherService from '../../services/teacherService';
import attendanceService from '../../services/attendanceService';
import dashboardService from '../../services/dashboardService';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });
  const [classes, setClasses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        console.log('Fetching teacher dashboard data...');
        setLoading(true);
        
        // Fetch teacher's classes using the correct method
        // We use getAssignedClasses which gets classes for the current logged-in teacher
        const classesResponse = await teacherService.getAssignedClasses();
        console.log('Fetched teacher classes:', classesResponse);
        
        if (!Array.isArray(classesResponse)) {
          console.warn('Classes response is not an array:', classesResponse);
          setClasses([]);
        } else {
          setClasses(classesResponse);
        }

        // Fetch attendance statistics for teacher's classes
        // We don't pass userId since the service will use the current logged-in teacher
        const attendanceStats = await dashboardService.getTeacherAttendanceStats();
        console.log('Fetched attendance stats:', attendanceStats);
        
        if (typeof attendanceStats !== 'object') {
          console.warn('Attendance stats is not an object:', attendanceStats);
          setStats({
            totalStudents: 0,
            presentToday: 0,
            absentToday: 0,
            attendanceRate: 0
          });
        } else {
          setStats(attendanceStats);
        }

        // Fetch recent activity related to teacher
        // We don't pass userId since the service will use the current logged-in teacher
        const activity = await dashboardService.getTeacherRecentActivity();
        console.log('Fetched teacher activity:', activity);
        
        if (!Array.isArray(activity)) {
          console.warn('Activity is not an array:', activity);
          setRecentActivity([]);
        } else {
          setRecentActivity(activity);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        setError(error.message || 'Failed to fetch dashboard data');
        setStats({
          totalStudents: 0,
          presentToday: 0,
          absentToday: 0,
          attendanceRate: 0
        });
        setRecentActivity([]);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            setError(null);
            fetchTeacherData();
          }}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Digital Attendance - Teacher
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Overview of your classes and student attendance
      </Typography>

{/* Stats Cards */}
<Grid container spacing={3} sx={{ mt: 2 }}>
  <Grid item xs={12} sm={6} md={3}>
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        },
        borderLeft: '4px solid',
        borderColor: 'primary.main'
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
            Total Students
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.totalStudents}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
          <PeopleIcon sx={{ fontSize: 32, color: 'primary.dark' }} />
        </Avatar>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        },
        borderLeft: '4px solid',
        borderColor: 'success.main'
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
            Present Today
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'success.main' }}>{stats.presentToday}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
          <EventAvailableIcon sx={{ fontSize: 32, color: 'success.dark' }} />
        </Avatar>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        },
        borderLeft: '4px solid',
        borderColor: 'error.main'
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
            Absent Today
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'error.main' }}>{stats.absentToday}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'error.light', width: 56, height: 56 }}>
          <EventBusyIcon sx={{ fontSize: 32, color: 'error.dark' }} />
        </Avatar>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        },
        borderLeft: '4px solid',
        borderColor: 'info.main'
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
            Attendance Rate
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'info.main' }}>{stats.attendanceRate}%</Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'info.light', width: 56, height: 56 }}>
          <SchoolIcon sx={{ fontSize: 32, color: 'info.dark' }} />
        </Avatar>
      </CardContent>
    </Card>
  </Grid>
</Grid>


      {/* Recent Activity */}
      <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Divider />
        <List>
          {recentActivity.map((activity) => (
            <ListItem key={activity.id} divider>
              <ListItemText
                primary={activity.action}
                secondary={formatDate(activity.timestamp)}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default TeacherDashboard;
