import api from './api';

const userMappingService = {
  // Get student ID associated with the current user
  getStudentIdForUser: async (userId) => {
    try {
      // This endpoint would need to be implemented in the backend
      // to map between user accounts and student records
      const response = await api.get(`/auth/user-mapping/${userId}`);
      return response.data.studentId;
    } catch (error) {
      console.error('Error fetching student ID mapping:', error);
      
      // For now, since the endpoint might not exist, we'll use the userId directly
      // This is a fallback that assumes the user ID might be the student ID
      return userId;
    }
  },
  
  // Get student details for the current user
  getStudentDetailsForCurrentUser: async () => {
    try {
      // This endpoint would provide student details for the currently logged-in user
      const response = await api.get('/auth/me/student');
      return response.data;
    } catch (error) {
      console.error('Error fetching student details for current user:', error);
      throw error.response?.data || { message: 'Failed to fetch student details' };
    }
  }
};

export default userMappingService;
