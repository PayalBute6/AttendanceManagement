import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import teacherService from '../../services/teacherService';
import studentService from '../../services/studentService';
import useAuthStore from '../../store/authStore';

const MyStudents = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  useEffect(() => {
    if (assignedClasses.length > 0) {
      fetchAllStudents();
    }
  }, [assignedClasses]);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, selectedClass]);

  const fetchAssignedClasses = async () => {
    try {
      setLoading(true);
      console.log('Fetching assigned classes...');
      
      const classesData = await teacherService.getAssignedClasses();
      console.log('Assigned classes:', classesData);
      
      if (Array.isArray(classesData) && classesData.length > 0) {
        setAssignedClasses(classesData);
      } else {
        setError('No classes assigned to you. Please contact the administrator.');
      }
    } catch (error) {
      console.error('Error fetching assigned classes:', error);
      setError('Failed to fetch assigned classes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching students for all assigned classes...');
      
      let allStudents = [];
      
      // Fetch students for each assigned class
      for (const classItem of assignedClasses) {
        try {
          console.log(`Fetching students for class ${classItem.name} (ID: ${classItem.id})...`);
          
          // Try teacherService first
          let classStudents = [];
          try {
            classStudents = await teacherService.getStudentsByClass(classItem.id);
            console.log(`Got ${classStudents.length} students using teacherService for class ${classItem.id}`);
          } catch (teacherError) {
            console.error('Error fetching with teacherService:', teacherError);
            
            // Fall back to studentService
            try {
              classStudents = await studentService.getStudentsByClass(classItem.id);
              console.log(`Got ${classStudents.length} students using studentService for class ${classItem.id}`);
            } catch (studentError) {
              console.error('Error fetching with studentService:', studentError);
              console.log(`Couldn't fetch students for class ${classItem.id}`);
              continue; // Skip this class and continue with the next one
            }
          }
          
          // Map the students to a consistent format and add class information
          const mappedStudents = classStudents.map(student => ({
            id: student.id,
            name: student.name,
            studentId: student.rollNo || student.studentId || student.rollNumber || '',
            email: student.email || '',
            contactNumber: student.contactNumber || student.phone || '',
            classId: classItem.id,
            className: classItem.name
          }));
          
          allStudents = [...allStudents, ...mappedStudents];
        } catch (classError) {
          console.error(`Error fetching students for class ${classItem.id}:`, classError);
        }
      }
      
      console.log(`Total students fetched: ${allStudents.length}`);
      setStudents(allStudents);
      setFilteredStudents(allStudents);
      
      if (allStudents.length === 0) {
        setError('No students found in your assigned classes.');
      }
    } catch (error) {
      console.error('Error fetching all students:', error);
      setError('Failed to fetch students. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    // Filter by class if a specific class is selected
    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => student.classId.toString() === selectedClass.toString());
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.studentId.toString().toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.className.toLowerCase().includes(query)
      );
    }
    
    setFilteredStudents(filtered);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleRefresh = () => {
    fetchAllStudents();
  };

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        My Students
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        View students in your assigned classes
      </Typography>
      
      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search Students"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '250px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: '200px' }}>
          <InputLabel id="class-select-label">Class</InputLabel>
          <Select
            labelId="class-select-label"
            id="class-select"
            value={selectedClass}
            label="Class"
            onChange={handleClassChange}
          >
            <MenuItem value="all">All Classes</MenuItem>
            {assignedClasses.map((classItem) => (
              <MenuItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Tooltip title="Refresh">
          <IconButton 
            color="primary" 
            onClick={handleRefresh}
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.main' } 
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': { boxShadow: 6 }
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>Student ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>Contact Number</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading students...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No students found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Try a different search term or class filter' : 'No students are assigned to your classes'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow 
                    key={student.id}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'action.hover',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
                      } 
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" fontSize="small" />
                        {student.name}
                      </Box>
                    </TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={<ClassIcon />} 
                        label={student.className} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        {student.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        {student.contactNumber || 'N/A'}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
          sx={{ 
            borderRadius: 2,
            transition: 'all 0.3s',
            '&:hover': { transform: 'scale(1.05)' }
          }}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
};

export default MyStudents;
