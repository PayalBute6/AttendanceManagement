import api from './api';

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      console.log('Auth service login attempt with:', { username: email });
      // Backend expects 'username' field, not 'email'
      const response = await api.post('/auth/login', { username: email, password });
      console.log('Auth service received response:', response.data);
      
      // Verify the role format in the response
      if (response.data && response.data.role) {
        console.log('Role from backend:', response.data.role);
      } else {
        console.warn('No role found in response or response format is unexpected:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login request failed:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Register user (for admin to create student accounts)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },
  
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user profile' };
    }
  }
};

export default authService;
