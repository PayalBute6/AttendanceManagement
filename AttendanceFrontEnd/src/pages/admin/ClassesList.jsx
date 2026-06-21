import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import classService from '../../services/classService';
import { useSnackbar } from 'notistack';
import { InputAdornment } from '@mui/material';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [currentClass, setCurrentClass] = useState(null);
  const [formData, setFormData] = useState({ name: '', section: '', subject: '' });
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Class name is required';
    if (!formData.section) errors.section = 'Section is required';
    if (!formData.subject) errors.subject = 'Subject is required';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      // Log the form data being submitted
      console.log('Form data being submitted:', JSON.stringify(formData, null, 2));
      
      if (dialogMode === 'add') {
        // Create a new object with the exact field names expected by the backend
        const classDataToSubmit = {
          name: formData.name,
          section: formData.section,
          subject: formData.subject
        };
        
        console.log('Submitting class data:', JSON.stringify(classDataToSubmit, null, 2));
        
        await classService.createClass(classDataToSubmit);
        enqueueSnackbar('Class created successfully', { variant: 'success' });
      } else {
        // Create a new object with the exact field names expected by the backend
        const classDataToSubmit = {
          name: formData.name,
          section: formData.section,
          subject: formData.subject
        };
        
        console.log('Updating class data:', JSON.stringify(classDataToSubmit, null, 2));
        
        await classService.updateClass(currentClass._id, classDataToSubmit);
        enqueueSnackbar('Class updated successfully', { variant: 'success' });
      }
      await fetchClasses();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving class:', error);
      if (error.details) {
        console.error('Error details:', error.details);
      }
      enqueueSnackbar(error.message || 'Failed to save class', { variant: 'error' });
    }
  };

  const handleDeleteClass = async () => {
    try {
      await classService.deleteClass(classToDelete._id);
      enqueueSnackbar('Class deleted successfully', { variant: 'success' });
      await fetchClasses();
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar('Failed to delete class', { variant: 'error' });
    }
  };

  const handleOpenDialog = (mode, cls = null) => {
    setDialogMode(mode);
    setCurrentClass(cls);
    setFormData(cls ? { name: cls.name, section: cls.section, subject: cls.subject } : { name: '', section: '', subject: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', section: '', subject: '' });
    setFormErrors({});
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getAllClasses();
      setClasses(response || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      enqueueSnackbar('Failed to fetch classes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">All Classes</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog('add')}>
          <AddIcon sx={{ mr: 1 }} />
          Add Class
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Search Classes"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          placeholder="Search by class name or section"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class Name</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No classes found
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map(cls => (
                <TableRow key={cls._id}>
                  <TableCell>{cls.name}</TableCell>
                  <TableCell>{cls.section}</TableCell>
                  <TableCell>{cls.subject}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenDialog('edit', cls)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => { setClassToDelete(cls); setDeleteConfirmOpen(true); }} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'add' ? 'Add New Class' : 'Edit Class'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Class Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
            <TextField
              fullWidth
              select
              label="Section"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              error={!!formErrors.section}
              helperText={formErrors.section}
              required
            >
              {['A', 'B', 'C', 'D'].map(section => (
                <MenuItem key={section} value={section}>{section}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              error={!!formErrors.subject}
              helperText={formErrors.subject}
              required
              placeholder="e.g., Mathematics, Science, English"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add Class' : 'Update Class'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the class "{classToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteClass}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassesList;
