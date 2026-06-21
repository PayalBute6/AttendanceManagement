import api from './api';

const classService = {
  // Get all classes
  getAllClasses: async () => {
    try {
      console.log('Fetching classes from:', api.defaults.baseURL + '/classes');
      const response = await api.get('/classes');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch classes',
        details: error.response?.data
      };
    }
  },

  // Get class by ID
  getClassById: async (id) => {
    try {
      console.log('Fetching class:', id);
      const response = await api.get(`/classes/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch class',
        details: error.response?.data
      };
    }
  },

  // Create a new class
  createClass: async (classData) => {
    try {
      // Validate required fields before sending
      if (!classData.name || !classData.section || !classData.subject) {
        console.error('Missing required fields:', { 
          name: classData.name, 
          section: classData.section, 
          subject: classData.subject 
        });
        throw {
          status: 400,
          message: 'Missing required fields: name, section, and subject are required',
          details: { missingFields: Object.entries({ name: classData.name, section: classData.section, subject: classData.subject })
            .filter(([_, value]) => !value)
            .map(([key]) => key) }
        };
      }
      
      console.log('Creating class with data:', JSON.stringify(classData, null, 2));
      console.log('API URL:', api.defaults.baseURL + '/classes');
      
      const response = await api.post('/classes', classData);
      console.log('Create class response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to create class',
        details: error.response?.data
      };
    }
  },

  // Update a class
  updateClass: async (id, classData) => {
    try {
      console.log('Updating class:', id, classData);
      const response = await api.put(`/classes/${id}`, classData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to update class',
        details: error.response?.data
      };
    }
  },

  // Delete a class
  deleteClass: async (id) => {
    try {
      console.log('Deleting class:', id);
      await api.delete(`/classes/${id}`);
      return true;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to delete class',
        details: error.response?.data
      };
    }
  },

  // Get students in a class
  getClassStudents: async (classId) => {
    try {
      console.log('Fetching class students:', classId);
      const response = await api.get(`/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch class students',
        details: error.response?.data
      };
    }
  },

  // Add student to class
  addStudentToClass: async (classId, studentId) => {
    try {
      console.log('Adding student to class:', classId, studentId);
      const response = await api.post(`/classes/${classId}/students`, { studentId });
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to add student to class',
        details: error.response?.data
      };
    }
  },

  // Remove student from class
  removeStudentFromClass: async (classId, studentId) => {
    try {
      console.log('Removing student from class:', classId, studentId);
      await api.delete(`/classes/${classId}/students/${studentId}`);
      return true;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to remove student from class',
        details: error.response?.data
      };
    }
  },

  // Get teachers assigned to a class
  getClassTeachers: async (classId) => {
    try {
      console.log('Fetching class teachers:', classId);
      const response = await api.get(`/classes/${classId}/teachers`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch class teachers',
        details: error.response?.data
      };
    }
  },

  // Add teacher to class
  addTeacherToClass: async (classId, teacherId) => {
    try {
      console.log('Adding teacher to class:', classId, teacherId);
      const response = await api.post(`/classes/${classId}/teachers`, { teacherId });
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to add teacher to class',
        details: error.response?.data
      };
    }
  },

  // Remove teacher from class
  removeTeacherFromClass: async (classId, teacherId) => {
    try {
      console.log('Removing teacher from class:', classId, teacherId);
      await api.delete(`/classes/${classId}/teachers/${teacherId}`);
      return true;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to remove teacher from class',
        details: error.response?.data
      };
    }
  },

  // Get attendance records for a class
  getClassAttendance: async (classId, date) => {
    try {
      console.log('Fetching class attendance:', classId, date);
      const response = await api.get(`/classes/${classId}/attendance`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || 'Failed to fetch class attendance',
        details: error.response?.data
      };
    }
  }
};

export default classService;
