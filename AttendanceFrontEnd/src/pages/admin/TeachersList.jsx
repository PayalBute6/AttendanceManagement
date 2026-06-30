import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Button, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Grid,
  CircularProgress, Snackbar, Alert, Tooltip, FormControl, InputLabel,
  Select, MenuItem, Checkbox, ListItemText, OutlinedInput, Chip
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import teacherService from '../../services/teacherService';
import classService from '../../services/classService';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', department: '',
    contactNumber: '', address: '', username: '', password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  
  // For class assignment
  const [assignClassDialogOpen, setAssignClassDialogOpen] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classesLoading, setClassesLoading] = useState(false);

  useEffect(() => { 
    fetchTeachers(); 
    fetchAvailableClasses();
  }, []);
  
  const fetchAvailableClasses = async () => {
    try {
      setClassesLoading(true);
      const data = await classService.getAllClasses();
      setAvailableClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      showSnackbar('Failed to fetch available classes', 'error');
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showSnackbar('Failed to fetch teachers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (e, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({ name: '', email: '', department: '', contactNumber: '', address: '', username: '', password: '' });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (teacher) => {
    setDialogMode('edit');
    setCurrentTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      contactNumber: teacher.contactNumber,
      address: teacher.address
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
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
    if (!formData.department.trim()) errors.department = 'Department is required';

    if (dialogMode === 'add') {
      if (!formData.username.trim()) errors.username = 'Username is required';
      if (!formData.password.trim()) {
        errors.password = 'Password is required';
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
      const mappedData = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        contactNumber: formData.contactNumber,
        address: formData.address
      };

      if (dialogMode === 'add') {
        mappedData.username = formData.username;
        mappedData.password = formData.password;
        const newTeacher = await teacherService.createTeacher(mappedData);
        setTeachers([...teachers, newTeacher]);
        showSnackbar('Teacher added successfully', 'success');
      } else {
        const updatedTeacher = await teacherService.updateTeacher(currentTeacher.id, mappedData);
        const updatedList = teachers.map(t =>
          t.id === currentTeacher.id ? updatedTeacher : t
        );
        setTeachers(updatedList);
        showSnackbar('Teacher updated successfully', 'success');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving teacher:', error);
      showSnackbar(`Failed to ${dialogMode === 'add' ? 'add' : 'update'} teacher`, 'error');
    }
  };

  const handleOpenDeleteConfirm = (teacher) => {
    setTeacherToDelete(teacher);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setTeacherToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await teacherService.deleteTeacher(teacherToDelete.id);
      setTeachers(teachers.filter(t => t.id !== teacherToDelete.id));
      showSnackbar('Teacher deleted successfully', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar('Failed to delete teacher', 'error');
    } finally {
      handleCloseDeleteConfirm();
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Open assign class dialog
  const handleOpenAssignClassDialog = (teacher) => {
    setCurrentTeacher(teacher);
    setSelectedClassId('');
    setAssignClassDialogOpen(true);
  };

  // Handle class assignment
  const handleAssignClass = async () => {
    if (!currentTeacher || !selectedClassId) return;
    
    try {
      await teacherService.assignClassToTeacher(currentTeacher.id, selectedClassId);
      showSnackbar(`Class assigned to ${currentTeacher.name} successfully`, 'success');
      setAssignClassDialogOpen(false);
      // Refresh the teacher list to show updated assignments
      await fetchTeachers();
    } catch (error) {
      console.error('Error assigning class:', error);
      showSnackbar('Failed to assign class to teacher', 'error');
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredTeachers.length - page * rowsPerPage);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Teachers Management</Typography>

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
          placeholder="Search teachers..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
          sx={{ width: { xs: '100%', sm: '40%' } }}
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
          Add Teacher
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
            ) : filteredTeachers.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No teachers found</TableCell></TableRow>
            ) : (
              filteredTeachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(teacher => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.department}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.contactNumber}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenEditDialog(teacher)} color="primary"><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Assign Class">
                        <IconButton onClick={() => handleOpenAssignClassDialog(teacher)} color="secondary"><ClassIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleOpenDeleteConfirm(teacher)} color="error"><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
            {emptyRows > 0 && <TableRow style={{ height: 53 * emptyRows }}><TableCell colSpan={5} /></TableRow>}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          count={filteredTeachers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{dialogMode === 'add' ? 'Add New Teacher' : 'Edit Teacher'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Name" fullWidth value={formData.name} onChange={handleInputChange} error={!!formErrors.name} helperText={formErrors.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="email" label="Email" fullWidth value={formData.email} onChange={handleInputChange} error={!!formErrors.email} helperText={formErrors.email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="department" label="Department" fullWidth value={formData.department} onChange={handleInputChange} error={!!formErrors.department} helperText={formErrors.department} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="contactNumber" label="Contact Number" fullWidth value={formData.contactNumber} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="address" label="Address" fullWidth value={formData.address} onChange={handleInputChange} />
            </Grid>
            {dialogMode === 'add' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField name="username" label="Username" fullWidth value={formData.username} onChange={handleInputChange} error={!!formErrors.username} helperText={formErrors.username} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="password" label="Password" type="password" fullWidth value={formData.password} onChange={handleInputChange} error={!!formErrors.password} helperText={formErrors.password} />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {dialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this teacher?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Class Dialog */}
      <Dialog open={assignClassDialogOpen} onClose={() => setAssignClassDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Class to Teacher</DialogTitle>
        <DialogContent>
          {currentTeacher && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Assigning class to: <strong>{currentTeacher.name}</strong>
              </Typography>
              
              {classesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : availableClasses.length === 0 ? (
                <Typography color="error">No classes available</Typography>
              ) : (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="class-select-label">Select Class</InputLabel>
                  <Select
                    labelId="class-select-label"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    label="Select Class"
                  >
                    {availableClasses.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section} ({cls.subject})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignClassDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAssignClass}
            disabled={!selectedClassId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );

};

export default TeachersList;
