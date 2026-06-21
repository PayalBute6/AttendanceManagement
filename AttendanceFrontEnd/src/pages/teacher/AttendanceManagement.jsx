import { useState, useEffect } from 'react';
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
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
  Tooltip,
  Chip,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Save as SaveIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Class as ClassIcon,
  CalendarToday as CalendarIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';
import teacherService from '../../services/teacherService';
import useAuthStore from '../../store/authStore';

const AttendanceManagement = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedClassName, setSelectedClassName] = useState('');
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
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    filterStudents();
  }, [selectedClass, searchQuery, students]);

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
        setSelectedClassName(classesData[0].name);
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
  
  const fetchStudentsByClass = async (classId) => {
    try {
      setLoading(true);
      console.log(`Fetching students for class ID: ${classId} in AttendanceManagement component`);
      
      if (!classId) {
        console.error('No class ID provided');
        showSnackbar('Please select a class first', 'warning');
        setStudents([]);
        setFilteredStudents([]);
        return;
      }
      
      // Get students for the selected class
      let studentsData = [];
      
      // First try using teacherService
      try {
        console.log('Attempting to fetch students with teacherService...');
        studentsData = await teacherService.getStudentsByClass(classId);
        console.log('Successfully fetched students using teacherService:', studentsData);
      } catch (teacherError) {
        console.error('Error fetching with teacherService:', teacherError);
        
        // Fall back to studentService
        try {
          console.log('Falling back to studentService...');
          studentsData = await studentService.getStudentsByClass(classId);
          console.log('Successfully fetched students using studentService:', studentsData);
        } catch (studentError) {
          console.error('Error fetching with studentService:', studentError);
          throw new Error('Failed to fetch students from both services');
        }
      }
      
      // Validate the response
      if (!studentsData) {
        console.error('Received null or undefined data');
        studentsData = [];
      }
      
      if (!Array.isArray(studentsData)) {
        console.error('Received non-array data:', studentsData);
        studentsData = [];
      }
      
      console.log('Raw students data:', studentsData);
      
      // Map backend field names to frontend field names with more flexible field mapping
      const mappedStudents = studentsData.map(student => ({
        id: student.id,
        name: student.name,
        studentId: student.rollNo || student.studentId || student.rollNumber || '',
        email: student.email || '',
        classId: student.classId || student.class_id || classId,
        className: student.className || student.class || selectedClassName || ''
      }));
      
      console.log('Mapped students for class:', mappedStudents);
      
      if (mappedStudents.length === 0) {
        showSnackbar('No students found for this class', 'info');
      } else {
        showSnackbar(`Found ${mappedStudents.length} students in this class`, 'success');
      }
      
      setStudents(mappedStudents);
      setFilteredStudents(mappedStudents);
      
      // Initialize attendance with all students present
      const initialAttendance = {};
      mappedStudents.forEach(student => {
        initialAttendance[student.id] = true;
      });
      setAttendance(initialAttendance);
      
      // Fetch attendance for this class and date
      if (mappedStudents.length > 0) {
        fetchAttendanceForDate(attendanceDate, classId);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showSnackbar('Failed to fetch students for the selected class: ' + (error.message || 'Unknown error'), 'error');
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!students.length) return;
    
    let filtered = [...students];
    
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
    const classId = event.target.value;
    setSelectedClass(classId);
    
    // Find the class name for the selected class ID
    const selectedClassObj = assignedClasses.find(cls => cls.id === classId);
    if (selectedClassObj) {
      setSelectedClassName(selectedClassObj.name);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDateChange = (newDate) => {
    setAttendanceDate(newDate);
    if (selectedClass) {
      fetchAttendanceForDate(newDate, selectedClass);
    }
  };

  const fetchAttendanceForDate = async (date, classId) => {
    try {
      setLoading(true);
      
      // Format the date as ISO string (YYYY-MM-DD)
      const formattedDate = date.toISOString().split('T')[0];
      console.log(`Fetching attendance for date ${formattedDate} and class ${classId}`);
      
      // Get attendance for the selected date and class from the API
      const attendanceData = await attendanceService.getAttendanceByDateAndClass(formattedDate, classId);
      console.log('Received attendance data:', attendanceData);
      
      if (Array.isArray(attendanceData) && attendanceData.length > 0) {
        // Map the attendance data to our format
        const newAttendance = {};
        students.forEach(student => {
          // Default to absent
          newAttendance[student.id] = false;
        });
        
        // Mark students as present based on the API response
        attendanceData.forEach(record => {
          if (record.status === 'PRESENT') {
            // Make sure we're using the correct student ID
            newAttendance[record.studentId] = true;
          }
        });
        
        console.log('Mapped attendance data:', newAttendance);
        setAttendance(newAttendance);
        showSnackbar(`Loaded attendance for ${formatDate(date)}`, 'info');
      } else {
        console.log('No attendance records found for this date, keeping checkboxes empty');
        // If no attendance records found for this date, keep both checkboxes empty (null value)
        const newAttendance = {};
        students.forEach(student => {
          newAttendance[student.id] = null; // null means neither present nor absent
        });
        setAttendance(newAttendance);
        showSnackbar(`No attendance records found for ${formatDate(date)}. Please mark attendance.`, 'info');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showSnackbar('Failed to fetch attendance for selected date', 'error');
      
      // Initialize with empty checkboxes as fallback
      const newAttendance = {};
      students.forEach(student => {
        newAttendance[student.id] = null; // null means neither present nor absent
      });
      setAttendance(newAttendance);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId) => {
    setAttendance(prev => {
      // Get the current status
      const currentStatus = prev[studentId];
      
      // Determine the next status based on the current status
      // null (not marked) -> true (present) -> false (absent) -> null (not marked)
      let nextStatus;
      
      if (currentStatus === null) {
        // If not marked, set to present
        nextStatus = true;
      } else if (currentStatus === true) {
        // If present, set to absent
        nextStatus = false;
      } else {
        // If absent, set back to not marked
        nextStatus = null;
      }
      
      console.log(`Changed attendance for student ${studentId}: ${currentStatus} -> ${nextStatus}`);
      
      return {
        ...prev,
        [studentId]: nextStatus
      };
    });
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
      
      // Validate that we have a class selected
      if (!selectedClass) {
        showSnackbar('Please select a class before saving attendance', 'warning');
        return;
      }
      
      // Validate that we have students
      if (students.length === 0) {
        showSnackbar('No students found for this class', 'warning');
        return;
      }
      
      // Format the date as ISO string (YYYY-MM-DD)
      const formattedDate = attendanceDate.toISOString().split('T')[0];
      
      // Prepare attendance data for the API
      const attendanceEntries = [];
      
      // Create an entry for each student with the correct status format
      Object.keys(attendance).forEach(studentId => {
        // Only include students that are in the selected class
        const student = students.find(s => s.id.toString() === studentId.toString());
        if (student) {
          attendanceEntries.push({
            studentId: parseInt(studentId),
            classId: parseInt(selectedClass),
            status: attendance[studentId] ? 'PRESENT' : 'ABSENT',
            remarks: ''
          });
        }
      });
      
      console.log('Saving attendance for', attendanceEntries.length, 'students');
      
      if (attendanceEntries.length === 0) {
        showSnackbar('No valid students to mark attendance for', 'warning');
        return;
      }
      
      // Send the attendance data to the API in the exact format expected by the backend
      // The backend expects: { date, classId, entries: [{ studentId, classId, status, remarks }] }
      const result = await attendanceService.markAttendance({
        date: formattedDate,
        classId: parseInt(selectedClass),
        entries: attendanceEntries
      });
      
      console.log('Attendance save result:', result);
      showSnackbar('Attendance saved successfully for ' + formatDate(attendanceDate), 'success');
      
      // Refresh the attendance data to confirm it was saved
      setTimeout(() => {
        fetchAttendanceForDate(attendanceDate, selectedClass);
      }, 1000); // Wait a second to make sure the data is saved on the server
    } catch (error) {
      console.error('Error saving attendance:', error);
      showSnackbar('Failed to save attendance: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    if (selectedClass) {
      fetchAttendanceForDate(attendanceDate, selectedClass);
    }
  };
const attendanceRef = useRef();

//const handlePrint = useReactToPrint({
  //content: () => attendanceRef.current,
  //documentTitle: 'Attendance Report',
//});

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
    <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>
      
      {/* Class and Date Selection Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Attendance Filters
          </Typography>
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Attendance Date"
                value={attendanceDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined"
                  />
                )}
                disabled={loading || saving}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Students"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading || saving}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <FilterIcon color="action" sx={{ mr: 1 }} />
                ),
              }}
            />
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
      <div ref={attendanceRef}>
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
                  <TableCell>
                    {student.className}
                    {assignedClasses.find(c => c.id === parseInt(selectedClass))?.section && 
                      <Chip 
                        size="small" 
                        label={assignedClasses.find(c => c.id === parseInt(selectedClass))?.section} 
                        sx={{ ml: 1 }} 
                      />}
                  </TableCell>
                  <TableCell align="center">
                    {attendance[student.id] === null ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                        NOT MARKED
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: attendance[student.id] ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {attendance[student.id] ? 'PRESENT' : 'ABSENT'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={attendance[student.id] === true}
                      onChange={() => handleAttendanceChange(student.id)}
                      color="success"
                      indeterminate={attendance[student.id] === null}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={attendance[student.id] === false}
                      onChange={() => handleAttendanceChange(student.id)}
                      color="error"
                      indeterminate={attendance[student.id] === null}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </div>
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
