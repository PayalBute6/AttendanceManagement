import api from './api';
import useAuthStore from '../store/authStore';

// User service for handling user profile operations
const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const { user } = useAuthStore.getState();
      const userRole = user?.role?.toLowerCase();
      
      console.log('Current user role:', userRole);
      
      // Use role-specific endpoints
      let response;
      if (userRole === 'teacher' || userRole === 'role_teacher') {
        response = await api.get('/teachers/profile');
      } else if (userRole === 'student' || userRole === 'role_student') {
        response = await api.get('/students/profile');
      } else if (userRole === 'admin' || userRole === 'role_admin') {
        // For admin, we'll use the auth/me endpoint
        response = await api.get('/auth/me');
      } else {
        throw new Error('Unknown user role');
      }
      
      console.log('Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If API call fails, fall back to using stored user data
      const user = useAuthStore.getState().user;
      if (user) {
        console.log('Falling back to stored user data:', user);
        return user;
      }
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const { user } = useAuthStore.getState();
      const userRole = user?.role?.toLowerCase();
      const userId = user?.id;
      
      console.log('Updating profile for role:', userRole, 'with data:', userData);
      
      // Use role-specific endpoints
      let response;
      if (userRole === 'teacher' || userRole === 'role_teacher') {
        response = await api.put(`/teachers/${userId}`, userData);
      } else if (userRole === 'student' || userRole === 'role_student') {
        response = await api.put(`/students/${userId}`, userData);
      } else if (userRole === 'admin' || userRole === 'role_admin') {
        // For admin, we'll use the auth/update endpoint
        response = await api.put('/auth/update', userData);
      } else {
        throw new Error('Unknown user role');
      }
      
      console.log('Update response:', response.data);
      
      // Update the user in the store
      const updatedUser = { ...user, ...response.data };
      useAuthStore.getState().updateUser(updatedUser);
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      // If API call fails, show detailed error
      if (error.response) {
        console.error('API error response:', error.response.data);
        throw error.response.data;
      }
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      console.log('Changing password with data:', passwordData);
      
      // Use the auth/change-password endpoint
      const response = await api.put('/auth/change-password', passwordData);
      
      console.log('Password change response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      
      // If API call fails, show detailed error
      if (error.response) {
        console.error('API error response:', error.response.data);
        throw error.response.data;
      }
      throw error;
    }
  }
};

export default userService;
