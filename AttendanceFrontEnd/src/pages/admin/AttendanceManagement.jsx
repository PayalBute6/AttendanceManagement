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
  Checkbox,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Save as SaveIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';

const AttendanceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchStudentsAndClasses();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [selectedClass, searchQuery, students]);

  const fetchStudentsAndClasses = async () => {
    try {
      setLoading(true);
      
      // Get all students from the API
      const studentsData = await studentService.getAllStudents();
      
      // Map backend field names to frontend field names
      const mappedStudents = studentsData.map(student => ({
        id: student.id,
        name: student.name,
        studentId: student.rollNo,
        class: student.className,
        email: student.email
      }));
      
      setStudents(mappedStudents);
      
      // Extract unique classes
      const uniqueClasses = [...new Set(mappedStudents.map(student => student.class))];
      setClasses(uniqueClasses.sort());
      
      // Initialize attendance with all students present
      const initialAttendance = {};
      mappedStudents.forEach(student => {
        initialAttendance[student.id] = true;
      });
      setAttendance(initialAttendance);
      
      // Set default class if available
      if (uniqueClasses.length > 0) {
        setSelectedClass(uniqueClasses[0]);
      }
    } catch (error) {
      console.error('Error fetching students and classes:', error);
      showSnackbar('Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    // Filter by class
    if (selectedClass) {
      filtered = filtered.filter(student => student.class === selectedClass);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query)
      );
    }
    
    setFilteredStudents(filtered);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDateChange = (newDate) => {
    setAttendanceDate(newDate);
    // In a real app, we would fetch attendance for this date
    fetchAttendanceForDate(newDate);
  };

  const fetchAttendanceForDate = async (date) => {
    try {
      setLoading(true);
      
      // Format the date as ISO string (YYYY-MM-DD)
      const formattedDate = date.toISOString().split('T')[0];
      
      try {
        // Get attendance for the selected date from the API
        const attendanceData = await attendanceService.getAttendanceByDate(formattedDate);
        
        // Map the attendance data to our format
        const newAttendance = {};
        students.forEach(student => {
          // Default to absent
          newAttendance[student.id] = false;
        });
        
        // Mark students as present based on the API response
        attendanceData.forEach(record => {
          if (record.status === 'PRESENT') {
            newAttendance[record.studentId] = true;
          }
        });
        
        setAttendance(newAttendance);
      } catch (error) {
        // If no attendance records found for this date, mark all as present by default
        const newAttendance = {};
        students.forEach(student => {
          newAttendance[student.id] = true;
        });
        setAttendance(newAttendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showSnackbar('Failed to fetch attendance for selected date', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleMarkAllPresent = () => {
    const newAttendance = {};
    filteredStudents.forEach(student => {
      newAttendance[student.id] = true;
    });
    
    setAttendance(prev => ({
      ...prev,
      ...newAttendance
    }));
  };

  const handleMarkAllAbsent = () => {
    const newAttendance = {};
    filteredStudents.forEach(student => {
      newAttendance[student.id] = false;
    });
    
    setAttendance(prev => ({
      ...prev,
      ...newAttendance
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      
      // Format the date as ISO string (YYYY-MM-DD)
      const formattedDate = attendanceDate.toISOString().split('T')[0];
      
      // Prepare attendance data for the API
      const attendanceEntries = [];
      
      // Create an entry for each student with the correct status format
      Object.keys(attendance).forEach(studentId => {
        attendanceEntries.push({
          studentId: parseInt(studentId),
          status: attendance[studentId] ? 'PRESENT' : 'ABSENT',
          remarks: ''
        });
      });
      
      // Send the attendance data to the API
      await attendanceService.markAttendance({
        date: formattedDate,
        entries: attendanceEntries
      });
      
      showSnackbar('Attendance saved successfully', 'success');
    } catch (error) {
      console.error('Error saving attendance:', error);
      showSnackbar('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchAttendanceForDate(attendanceDate);
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

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
  };

  if (loading && students.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>
      
      {/* Filters and Date Selection */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Attendance Date"
                value={attendanceDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="class-select-label">Class</InputLabel>
              <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClass}
                label="Class"
                onChange={handleClassChange}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Student"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Name or ID"
              InputProps={{
                startAdornment: <FilterIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print Attendance">
              <IconButton color="primary">
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Attendance Date Display */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Attendance for: {formatDate(attendanceDate)}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleMarkAllPresent} 
            sx={{ mr: 1 }}
          >
            Mark All Present
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleMarkAllAbsent}
            sx={{ mr: 1 }}
          >
            Mark All Absent
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveAttendance}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </Box>
      </Box>
      
      {/* Attendance Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Present</TableCell>
              <TableCell align="center">Absent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        color: attendance[student.id] ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {attendance[student.id] ? 'PRESENT' : 'ABSENT'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={attendance[student.id] === true}
                      onChange={() => attendance[student.id] === false && handleAttendanceChange(student.id)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={attendance[student.id] === false}
                      onChange={() => attendance[student.id] === true && handleAttendanceChange(student.id)}
                      color="error"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
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

export default AttendanceManagement;
