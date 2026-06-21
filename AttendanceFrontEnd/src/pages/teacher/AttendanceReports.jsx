import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import attendanceService from '../../services/attendanceService';
import teacherService from '../../services/teacherService';
import useAuthStore from '../../store/authStore';

const AttendanceReports = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1))); // First day of current month
  const [endDate, setEndDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDays: 0,
    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (user && user.id) {
      fetchAssignedClasses();
    }
  }, [user]);
  
  useEffect(() => {
    if (selectedClass && startDate && endDate) {
      fetchAttendanceReport();
    }
  }, [selectedClass, startDate, endDate]);

  const fetchAssignedClasses = async () => {
    try {
      setLoading(true);
      console.log('Fetching assigned classes for teacher');
      
      // Get classes assigned to the teacher using the correct method
      // The teacherService.getAssignedClasses() method doesn't take an ID parameter
      // as it gets the classes for the currently logged-in teacher
      const classesData = await teacherService.getAssignedClasses();
      console.log('Assigned classes data:', classesData);
      
      if (Array.isArray(classesData) && classesData.length > 0) {
        setAssignedClasses(classesData);
        console.log('Setting assigned classes:', classesData);
        
        // Set default class if available
        setSelectedClass(classesData[0].id);
        console.log(`Selected class ID: ${classesData[0].id}, name: ${classesData[0].name}`);
      } else {
        setAssignedClasses([]);
        console.warn('No classes assigned to this teacher');
        showSnackbar('No classes assigned to you', 'info');
      }
    } catch (error) {
      console.error('Error fetching assigned classes:', error);
      console.error('Error details:', error.response?.data);
      showSnackbar('Failed to fetch assigned classes', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      console.log(`Fetching attendance report for class ${selectedClass}`);
      
      // Format dates as ISO strings (YYYY-MM-DD)
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      console.log(`Date range: ${formattedStartDate} to ${formattedEndDate}`);
      
      // Get attendance report for the selected class and date range using our new service method
      const reportData = await attendanceService.getAttendanceReportByClass(
        selectedClass,
        formattedStartDate,
        formattedEndDate
      );
      
      console.log('Received attendance report data:', reportData);
      
      // Set attendance records for display in the table
      setAttendanceData(reportData.attendanceRecords || []);
      
      // Get statistics from the report data
      const totalStudents = reportData.totalStudents || 0;
      const totalDays = reportData.totalDays || 0;
      const presentCount = reportData.presentCount || 0;
      const absentCount = reportData.absentCount || 0;
      
      // Calculate attendance rate
      let attendanceRate = 0;
      if (presentCount + absentCount > 0) {
        attendanceRate = (presentCount / (presentCount + absentCount) * 100).toFixed(2);
      }
      
      console.log('Calculated statistics:', {
        totalStudents,
        totalDays,
        presentCount,
        absentCount,
        attendanceRate
      });
      
      // Update the stats state
      setStats({
        totalStudents,
        totalDays,
        presentCount,
        absentCount,
        attendanceRate
      });
      
      if (reportData.attendanceRecords && reportData.attendanceRecords.length > 0) {
        showSnackbar(`Found ${reportData.attendanceRecords.length} attendance records`, 'success');
      } else {
        showSnackbar('No attendance records found for the selected period', 'info');
      }
      
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      console.error('Error details:', error.response?.data);
      showSnackbar('Failed to fetch attendance report', 'error');
      
      // Reset data on error
      setAttendanceData([]);
      setStats({
        totalStudents: 0,
        totalDays: 0,
        presentCount: 0,
        absentCount: 0,
        attendanceRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
  };
  
  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
  };

  const handleRefresh = () => {
    if (selectedClass) {
      fetchAttendanceReport();
    }
  };

  const handleExportReport = () => {
  if (!attendanceData.length) {
    showSnackbar('No data to export', 'info');
    return;
  }

  const csvHeaders = ['Date', 'Student ID', 'Name', 'Status', 'Remarks'];
  const csvRows = attendanceData.map((record) => [
    formatDate(record.date),
    record.studentId,
    record.studentName,
    record.status,
    record.remarks || '-'
  ]);

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // File name with class or date can be more dynamic if needed
  link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showSnackbar('Report downloaded as CSV successfully', 'success');
};

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading && attendanceData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: 120 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Reports
      </Typography>
      
      {/* Filters and Date Selection */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Report Filters
          </Typography>
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="class-select-label">Class</InputLabel>
              <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClass}
                label="Class"
                onChange={handleClassChange}
                disabled={assignedClasses.length === 0}
                sx={{ borderRadius: 1 }}
              >
                {assignedClasses.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    <Typography sx={{ fontWeight: 'medium' }}>
                      {cls.name} {cls.section && `- ${cls.section}`} {cls.subject && `(${cls.subject})`}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                renderInput={(params) => 
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      sx: { borderRadius: 1 },
                      startAdornment: <CalendarIcon color="action" sx={{ ml: 1, mr: 1 }} />
                    }}
                  />
                }
                maxDate={endDate}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                renderInput={(params) => 
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      sx: { borderRadius: 1 },
                      startAdornment: <CalendarIcon color="action" sx={{ ml: 1, mr: 1 }} />
                    }}
                  />
                }
                minDate={startDate}
                maxDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Report">
              <IconButton color="primary" onClick={handleExportReport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            
          </Grid>
        </Grid>
      </Paper>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Total Students
                </Typography>
                <Typography variant="h5">{stats.totalStudents}</Typography>
              </Box>
              <BarChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Total Days
                </Typography>
                <Typography variant="h5">{stats.totalDays}</Typography>
              </Box>
              <CalendarIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Present Count
                </Typography>
                <Typography variant="h5">{stats.presentCount}</Typography>
              </Box>
              <PieChartIcon sx={{ fontSize: 40, color: 'success.main' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Absent Count
                </Typography>
                <Typography variant="h5">{stats.absentCount}</Typography>
              </Box>
              <PieChartIcon sx={{ fontSize: 40, color: 'error.main' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Attendance Rate
                </Typography>
                <Typography variant="h5">{stats.attendanceRate}%</Typography>
              </Box>
              <BarChartIcon sx={{ fontSize: 40, color: 'info.main' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Attendance Records Table */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Attendance Records
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : attendanceData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No attendance records found for the selected period
                  </TableCell>
                </TableRow>
              ) : (
                attendanceData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{record.studentId}</TableCell>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={record.status}
                        color={record.status === 'PRESENT' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{record.remarks || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceReports;
