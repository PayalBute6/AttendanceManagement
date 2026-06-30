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
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import studentService from '../../services/studentService';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    class: '',
    contactNumber: '',
    address: '',
    username: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Call the actual API service
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      showSnackbar('Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      email: '',
      studentId: '',
      class: '',
      contactNumber: '',
      address: '',
      username: '',
      password: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (student) => {
    console.log('Opening edit dialog for student:', student);
    setDialogMode('edit');
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      studentId: student.rollNo,       // Use rollNo instead of studentId
      class: student.className,        // Use className instead of class
      contactNumber: student.contactNumber,
      address: student.address,
      username: student.username,      // Include username field
      password: '' // Initialize with empty password (will only be sent if filled)
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.studentId.trim()) errors.studentId = 'Student ID is required';
    if (!formData.class.trim()) errors.class = 'Class is required';
    
    // Validate username and password for new students (required for login)
    if (dialogMode === 'add') {
      if (!formData.username.trim()) errors.username = 'Username is required for student login';
      if (!formData.password.trim()) {
        errors.password = 'Password is required for student login';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // Map frontend field names to backend field names
      const mappedData = {
        name: formData.name,
        email: formData.email,
        rollNo: formData.studentId,  // Map studentId to rollNo
        className: formData.class,    // Map class to className
        contactNumber: formData.contactNumber,
        address: formData.address
      };
      
      // Add username for both add and edit modes
      if (dialogMode === 'add') {
        // For new students
        mappedData.username = formData.username;
        mappedData.password = formData.password;
      } else {
        // For existing students
        mappedData.username = formData.username || currentStudent.username;
        
        // Only include password if provided
        if (formData.password && formData.password.trim() !== '') {
          mappedData.password = formData.password;
        }
      }
      
      // Debug the payload being sent
      console.log('Sending student data:', JSON.stringify(mappedData, null, 2));
      
      if (dialogMode === 'add') {
        // Call the actual API to create a student
        const newStudent = await studentService.createStudent(mappedData);
        
        // Update the local state with the new student from the API
        // Map the response back to frontend field names for consistency
        const frontendStudent = {
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          studentId: newStudent.rollNo,
          class: newStudent.className,
          contactNumber: newStudent.contactNumber,
          address: newStudent.address
        };
        
        setStudents([...students, frontendStudent]);
        showSnackbar('Student added successfully', 'success');
      } else {
        // Call the actual API to update a student
        const updatedStudent = await studentService.updateStudent(currentStudent.id, mappedData);
        
        // Map the response back to frontend field names
        const frontendUpdatedStudent = {
          id: updatedStudent.id,
          name: updatedStudent.name,
          email: updatedStudent.email,
          studentId: updatedStudent.rollNo,
          class: updatedStudent.className,
          contactNumber: updatedStudent.contactNumber,
          address: updatedStudent.address
        };
        
        // Update the local state with the updated student
        const updatedStudents = students.map(student => 
          student.id === currentStudent.id ? frontendUpdatedStudent : student
        );
        
        setStudents(updatedStudents);
        showSnackbar('Student updated successfully', 'success');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving student:', error);
      showSnackbar(
        dialogMode === 'add' ? 'Failed to add student' : 'Failed to update student', 
        'error'
      );
    }
  };

  const handleOpenDeleteConfirm = (student) => {
    setStudentToDelete(student);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setStudentToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Call the actual API to delete a student
      await studentService.deleteStudent(studentToDelete.id);
      
      // Update the local state after successful deletion
      const filteredStudents = students.filter(student => student.id !== studentToDelete.id);
      setStudents(filteredStudents);
      
      setDeleteConfirmOpen(false);
      showSnackbar('Student deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting student:', error);
      showSnackbar('Failed to delete student', 'error');
      setDeleteConfirmOpen(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
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

  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredStudents.length - page * rowsPerPage);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Students Management
      </Typography>
      
      {/* Search and Add Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3, 
          mt: 2 
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search students..."
          value={searchQuery}
          onChange={handleSearch}
          sx={{ width: { xs: '100%', sm: '40%' } }}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{ 
            fontWeight: 'bold', 
            px: 3, 
            py: 1,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 5,
              bgcolor: 'primary.dark'
            }
          }}
        >
          Add Student
        </Button>
      </Box>
      
      {/* Students Table */}
      <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell align="center">Actions</TableCell>
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
              filteredStudents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.rollNo}</TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.contactNumber}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleOpenEditDialog(student)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleOpenDeleteConfirm(student)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Add/Edit Student Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Student' : 'Edit Student'}
        </DialogTitle>
        <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student ID"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                error={!!formErrors.studentId}
                helperText={formErrors.studentId}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                error={!!formErrors.class}
                helperText={formErrors.class}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </Grid>
            {/* Username field - shown for new students only */}
            {dialogMode === 'add' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                />
              </Grid>
            )}
            
            {/* Password field - shown for both new and existing students */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={dialogMode === 'add' ? "Password" : "New Password (leave blank to keep current)"}
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                error={!!formErrors.password}
                helperText={formErrors.password || (dialogMode === 'edit' ? 'Leave blank to keep current password' : '')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{' '}
          <strong>{studentToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentsList;
