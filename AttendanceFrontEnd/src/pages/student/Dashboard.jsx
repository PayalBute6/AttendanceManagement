import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  // Removed attendance stats state
  const [recentAttendance, setRecentAttendance] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Get the current student data using the profile endpoint
      const studentRecord = await studentService.getCurrentStudent();
      
      if (!studentRecord) {
        console.error('No student record found');
        return;
      }
      
      console.log('Student record:', studentRecord);
      
      setStudentData({
        id: studentRecord.id,
        name: studentRecord.name,
        email: studentRecord.email,
        studentId: studentRecord.id?.toString() || '',
        class: studentRecord.className,
        rollNumber: studentRecord.rollNo,
        contactNumber: studentRecord.contactNumber,
        address: studentRecord.address,
        joinDate: studentRecord.joinDate || new Date().toISOString().split('T')[0]
      });
      
      // Removed attendance statistics section
      
      // Get recent attendance for the student
      try {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        const startDate = sevenDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        console.log(`Fetching attendance from ${startDate} to ${endDate} for student ID ${studentRecord.id}`);
        
        const attendanceResponse = await attendanceService.getAttendanceByDateRange(
          studentRecord.id,
          startDate,
          endDate
        );
        
        console.log('Recent attendance response:', attendanceResponse);
        
        // Normalize and validate the attendance response
        let recentAttendance = [];
        if (attendanceResponse && Array.isArray(attendanceResponse)) {
          recentAttendance = attendanceResponse.map(record => {
            const recordDate = new Date(record.date);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[recordDate.getDay()];
            
            return {
              date: record.date,
              day: dayName,
              status: record.status,
              timestamp: record.timestamp || new Date(record.date).toISOString()
            };
          });
          
          // Sort by date (newest first)
          recentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          // Limit to 10 most recent records
          recentAttendance = recentAttendance.slice(0, 10);
        }
        
        setRecentAttendance(recentAttendance);
      } catch (attendanceError) {
        console.error('Error fetching recent attendance:', attendanceError);
        setRecentAttendance([]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Show a fallback UI with the user data from auth store
      const { user } = useAuthStore.getState();
      if (user) {
        setStudentData({
          id: user.id || '',
          name: user.fullName || user.name || '',
          email: user.email || '',
          studentId: user.id?.toString() || '',
          class: user.className || '',
          rollNumber: user.rollNo || '',
          contactNumber: user.contactNumber || user.phoneNumber || '',
          address: user.address || '',
          joinDate: user.joinDate || new Date().toISOString().split('T')[0]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        Digital Attendance - Student
      </Typography>
      
      {/* Student Profile Card */}
      <Card elevation={3} sx={{ mb: 4, overflow: 'visible', position: 'relative', borderRadius: 2 }}>
        <Box sx={{ 
          height: 100, 
          bgcolor: 'primary.main', 
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8 
        }} />
        <CardContent sx={{ pt: 0, pb: 3, px: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, mb: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                bgcolor: 'primary.main',
                fontSize: '3rem',
                mt: -8,
                boxShadow: 3,
                mb: { xs: 2, sm: 0 }
              }}
            >
              {studentData?.name?.charAt(0) || <SchoolIcon fontSize="large" />}
            </Avatar>
            <Box sx={{ ml: { xs: 0, sm: 3 }, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {studentData?.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Chip 
                  icon={<ClassIcon />} 
                  label={`Class ${studentData?.class}`} 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                />
                <Chip 
                  icon={<BadgeIcon />} 
                  label={`Roll No: ${studentData?.rollNumber}`} 
                  color="secondary" 
                  variant="outlined" 
                  size="small" 
                />
              </Stack>
              <Typography variant="body1" color="text.secondary">
                Student ID: {studentData?.studentId}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Student Information */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Personal Information</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom fontWeight="medium">{studentData?.email}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">Contact Number</Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom fontWeight="medium">{studentData?.contactNumber || 'Not provided'}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HomeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom fontWeight="medium">{studentData?.address || 'Not provided'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BadgeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">Student ID</Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom fontWeight="medium">{studentData?.studentId}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom fontWeight="medium">{studentData?.dob || 'Not provided'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ClassIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Academic Information</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Class</Typography>
                  <Typography variant="h6" color="primary.main" gutterBottom>{studentData?.class}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Section</Typography>
                  <Typography variant="h6" color="primary.main" gutterBottom>A</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Roll Number</Typography>
                  <Typography variant="h6" color="primary.main" gutterBottom>{studentData?.rollNumber}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Joined On</Typography>
                  <Typography variant="body1" gutterBottom fontWeight="medium">{formatDate(studentData?.joinDate)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent Attendance */}
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Recent Attendance</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {recentAttendance.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">No recent attendance records found</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {recentAttendance.slice(0, 5).map((record, index) => (
                <Grid item xs={12} key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: record.status === 'present' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)',
                      borderColor: record.status === 'present' ? 'success.light' : 'error.light'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {record.day}, {formatDate(record.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        icon={record.status === 'present' ? <CheckCircleIcon /> : <CancelIcon />}
                        label={record.status.toUpperCase()}
                        color={record.status === 'present' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </Card>
                </Grid>
              ))}
              {recentAttendance.length > 5 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="body2" color="primary">
                      + {recentAttendance.length - 5} more records
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentDashboard;
