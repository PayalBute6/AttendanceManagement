import { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import teacherService from '../../services/teacherService';
import attendanceService from '../../services/attendanceService';
import dashboardService from '../../services/dashboardService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    totalTeachers: 0,
    totalClasses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard statistics from the API
        const dashboardStats = await dashboardService.getDashboardStats();
        setStats(dashboardStats);

        // Fetch recent activity from the API
        const activity = await dashboardService.getRecentActivity();
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values if API calls fail
        setStats({
          totalStudents: 0,
          presentToday: 0,
          absentToday: 0,
          attendanceRate: 0,
          totalTeachers: 0,
          totalClasses: 0
        });
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Overview of student attendance and system activities
      </Typography>

{/* Stats Cards */}
<Grid container spacing={3} sx={{ mt: 1 }}>
  <Grid item xs={12} sm={6} md={2}>
    <Card elevation={3}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            Total Teachers
          </Typography>
          <Typography variant="h4">{stats.totalTeachers}</Typography>
        </Box>
        <PersonIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Card elevation={3}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            Total Students
          </Typography>
          <Typography variant="h4">{stats.totalStudents}</Typography>
        </Box>
        <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Card elevation={3}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            Present Today
          </Typography>
          <Typography variant="h4">{stats.presentToday}</Typography>
        </Box>
        <EventAvailableIcon sx={{ fontSize: 40, color: 'success.main' }} />
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Card elevation={3}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            Absent Today
          </Typography>
          <Typography variant="h4">{stats.absentToday}</Typography>
        </Box>
        <EventBusyIcon sx={{ fontSize: 40, color: 'error.main' }} />
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Card elevation={3}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            Attendance Rate
          </Typography>
          <Typography variant="h4">{stats.attendanceRate}%</Typography>
        </Box>
        <SchoolIcon sx={{ fontSize: 40, color: 'info.main' }} />
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Card elevation={3}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            Total Classes
          </Typography>
          <Typography variant="h4">{stats.totalClasses}</Typography>
        </Box>
        <ClassIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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

export default AdminDashboard;
