import api from './api';

const teacherService = {
  /**
   * Get all teachers (Admin only)
   */
  getAllTeachers: async () => {
    try {
      const response = await api.get('/teachers');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch teachers' };
    }
  },

  /**
   * Get a single teacher by ID
   */
  getTeacherById: async (id) => {
    try {
      const response = await api.get(`/teachers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch teacher by ID' };
    }
  },

  /**
   * Create a new teacher (Admin only)
   */
  createTeacher: async (teacherData) => {
    try {
      const response = await api.post('/teachers', teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create teacher' };
    }
  },

  /**
   * Update a teacher by ID (Admin only)
   */
  updateTeacher: async (id, teacherData) => {
    try {
      const response = await api.put(`/teachers/${id}`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update teacher' };
    }
  },

  /**
   * Delete a teacher by ID (Admin only)
   */
  deleteTeacher: async (id) => {
    try {
      const response = await api.delete(`/teachers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete teacher' };
    }
  },

  /**
   * Get the profile of the currently logged-in teacher
   */
  getCurrentTeacher: async () => {
    try {
      console.log('Fetching current teacher profile using /teachers/profile endpoint');
      const response = await api.get('/teachers/profile');
      console.log('Current teacher profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching current teacher profile:', error);
      throw error.response?.data || { message: 'Failed to fetch current teacher profile' };
    }
  },

  /**
   * Get classes assigned to a teacher by ID (Admin use)
   */
  getTeacherClasses: async (teacherId) => {
    try {
      console.log(`Fetching classes for teacher ID: ${teacherId}`);
      const response = await api.get(`/teachers/${teacherId}/classes`);
      console.log('Teacher classes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      
      // If this fails, try the direct classes endpoint as a fallback
      try {
        console.log('Falling back to direct classes endpoint');
        const response = await api.get('/teachers/classes');
        console.log('Classes response from fallback:', response.data);
        return response.data;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  },
  
  /**
   * Get classes assigned to the currently logged-in teacher
   */
  getAssignedClasses: async () => {
    try {
      console.log('Fetching assigned classes for current teacher');
      
      // First try the endpoint that matches the backend controller
      // The endpoint should be /api/teachers/classes
      console.log('Trying endpoint: /teachers/classes');
      const response = await api.get('/teachers/classes');
      console.log('Successfully fetched assigned classes:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.warn('Response is not an array:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch assigned classes:', error);
      console.error('Error details:', error.response?.data);
      
      // Try to get the current teacher and then their classes as a fallback
      try {
        console.log('Trying fallback approach - first getting current teacher');
        const teacherResponse = await api.get('/teachers/profile');
        console.log('Teacher profile response:', teacherResponse.data);
        
        const teacherId = teacherResponse.data.id;
        console.log('Got teacher ID:', teacherId);
        
        // Then try the alternative endpoint with the teacher ID
        const classesResponse = await api.get(`/teachers/${teacherId}/classes`);
        console.log('Successfully fetched classes with alternative endpoint:', classesResponse.data);
        return classesResponse.data;
      } catch (fallbackError) {
        console.error('Fallback approach also failed:', fallbackError);
        // Return empty array instead of throwing to prevent UI errors
        return [];
      }
    }
  },
  
  /**
   * Get students in a class assigned to the current teacher
   */
  getStudentsByClass: async (classId) => {
    try {
      console.log(`Fetching students for class ID: ${classId}`);
      
      if (!classId) {
        console.error('No class ID provided');
        return [];
      }
      
      // Based on the backend code, the correct endpoint is:
      // /api/teachers/classes/{classId}/students
      console.log(`Using endpoint: /teachers/classes/${classId}/students`);
      const response = await api.get(`/teachers/classes/${classId}/students`);
      console.log('Student data response:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.warn('Response is not an array:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch students by class:', error);
      console.error('Error details:', error.response?.data);
      
      // Try alternative endpoint as fallback
      try {
        console.log(`Trying fallback endpoint: /classes/${classId}/students`);
        const altResponse = await api.get(`/classes/${classId}/students`);
        console.log('Success with fallback endpoint:', altResponse.data);
        return altResponse.data;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        
        // Try another fallback
        try {
          console.log(`Trying second fallback: /students/class/${classId}`);
          const alt2Response = await api.get(`/students/class/${classId}`);
          console.log('Success with second fallback:', alt2Response.data);
          return alt2Response.data;
        } catch (fallback2Error) {
          console.error('Second fallback also failed:', fallback2Error);
          // Return empty array instead of throwing to prevent UI errors
          return [];
        }
      }
    }
  },
  
  /**
   * Get students in a teacher's class
   */
  getClassStudents: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch class students' };
    }
  },
  
  /**
   * Assign a class to a teacher (Admin only)
   */
  assignClassToTeacher: async (teacherId, classId) => {
    try {
      console.log(`Assigning class ${classId} to teacher ${teacherId}`);
      const response = await api.post(`/teachers/${teacherId}/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning class to teacher:', error);
      throw error.response?.data || { message: 'Failed to assign class to teacher' };
    }
  },
  
  /**
   * Mark attendance for a class
   */
  markAttendance: async (attendanceData) => {
    try {
      const response = await api.post('/attendance/mark', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error.response?.data || { message: 'Failed to mark attendance' };
    }
  },
  
  /**
   * Get attendance for a class on a specific date
   */
  getAttendanceByDate: async (classId, date) => {
    try {
      const response = await api.get(`/attendance/class/${classId}/date/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error.response?.data || { message: 'Failed to fetch attendance data' };
    }
  },
  
  /**
   * Remove a class assignment from a teacher (Admin only)
   */
  removeClassFromTeacher: async (teacherId, classId) => {
    try {
      const response = await api.delete(`/teachers/${teacherId}/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove class from teacher' };
    }
  }
};

export default teacherService;
