import api from './api';
import useAuthStore from '../store/authStore';

const studentService = {
  // Get all students (admin only)
  getAllStudents: async () => {
    try {
      // Check user role from auth store
      const user = useAuthStore.getState().user;
      
      if (user && user.role === 'teacher') {
        // For teachers, we need to use the teacher-specific endpoint
        throw new Error('Teachers should use getStudentsByClass method instead of getAllStudents');
      }
      
      // For admins, use the admin endpoint
      const response = await api.get('/students');
      return response.data;
    } catch (error) {
      console.error('Error in getAllStudents:', error);
      throw error.response?.data || { message: 'Failed to fetch students' };
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch student' };
    }
  },

  // Get students by class (for teachers)
  getStudentsByClass: async (classId) => {
    try {
      console.log(`Fetching students for class ID: ${classId}`);
      // First try the teacher-specific endpoint
      try {
        const response = await api.get(`/teachers/classes/${classId}/students`);
        console.log('Teacher endpoint response:', response.data);
        return response.data;
      } catch (teacherError) {
        console.error('Error with teacher endpoint:', teacherError);
        // Fall back to the general classes endpoint
        const response = await api.get(`/classes/${classId}/students`);
        console.log('General classes endpoint response:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching students by class:', error);
      throw error.response?.data || { message: 'Failed to fetch students for this class' };
    }
  },

  // Create new student (admin only)
  createStudent: async (studentData) => {
    try {
      const response = await api.post('/students', studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create student' };
    }
  },

  // Update student (admin only)
  updateStudent: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update student' };
    }
  },

  // Delete student (admin only)
  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete student' };
    }
  },
  
  // Get current student data (for student users)
  getCurrentStudent: async () => {
    try {
      const response = await api.get('/students/profile');
      console.log('Student profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      // If API call fails, fall back to using stored user data
      const user = useAuthStore.getState().user;
      if (user) {
        console.log('Falling back to stored user data:', user);
        return user;
      }
      throw error.response?.data || { message: 'Failed to fetch student data' };
    }
  }
};

export default studentService;
