import axios from 'axios';
import useAuthStore from '../store/authStore';

// Define possible backend URLs to try
const BACKEND_URLS = [
  'http://localhost:5000/api',  // Spring Boot configured port (from application.properties)
  'http://localhost:8080/api',  // Spring Boot default port
  'http://localhost:9090/api',  // Another common port
  '/api'                        // Relative URL if running on same server
];

// Log which URL we're trying to use
console.log('Trying to connect to backend at:', BACKEND_URLS[0]);

// Create axios instance with base URL
const api = axios.create({
  baseURL: BACKEND_URLS[0], // Using the first URL by default
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
