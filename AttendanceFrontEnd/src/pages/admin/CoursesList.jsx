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
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import axios from 'axios';

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    credits: 0,
    type: 'CORE',
    department: '',
    classId: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchClasses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses. Please try again later.');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleAddCourse = async () => {
    try {
      await axios.post('/api/courses', form);
      setForm({
        name: '',
        code: '',
        credits: 0,
        type: 'CORE',
        department: '',
      });
      setOpenDialog(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleEditCourse = async () => {
    try {
      await axios.put(`/api/courses/${editingCourse.id}`, form);
      setForm({
        name: '',
        code: '',
        credits: 0,
        type: 'CORE',
        department: '',
      });
      setOpenDialog(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await axios.delete(`/api/courses/${courseId}`);
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Courses
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setForm({
                  name: '',
                  code: '',
                  credits: 0,
                  type: 'CORE',
                  department: '',
                });
                setEditingCourse(null);
                setOpenDialog(true);
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Add Course
            </Button>
          </Box>

          <Paper sx={{ width: '100%', mb: 2 }}>
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>Course Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Credits</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow
                      key={course.id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                    >
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>
                        <Chip
                          label={course.type}
                          size="small"
                          color={course.type === 'CORE' ? 'primary' : 'secondary'}
                          sx={{
                            '& .MuiChip-label': {
                              textTransform: 'capitalize',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {classes.find(c => c.id === course.classId)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            setForm(course);
                            setEditingCourse(course);
                            setOpenDialog(true);
                          }}
                          size="small"
                          sx={{
                            '&:hover': { backgroundColor: 'action.hover' },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteCourse(course.id)}
                          size="small"
                          color="error"
                          sx={{
                            '&:hover': { backgroundColor: 'error.dark' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Add Course'}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Course Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Course Code"
                fullWidth
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Credits"
                fullWidth
                type="number"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                select
                margin="dense"
                label="Type"
                fullWidth
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                sx={{ mb: 2 }}
              >
                <option value="CORE">Core</option>
                <option value="ELECTIVE">Elective</option>
              </TextField>
              <Autocomplete
                margin="dense"
                fullWidth
                options={classes}
                getOptionLabel={(option) => option.name}
                value={classes.find(c => c.id === form.classId) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setForm({ ...form, classId: newValue.id });
                  } else {
                    setForm({ ...form, classId: null });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Class"
                    placeholder="Select a class"
                  />
                )}
              />
              <TextField
                margin="dense"
                label="Department"
                fullWidth
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button
                onClick={editingCourse ? handleEditCourse : handleAddCourse}
                variant="contained"
                color="primary"
              >
                {editingCourse ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
};
