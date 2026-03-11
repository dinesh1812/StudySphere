import axios from 'axios';
import { getToken, logout } from '../auth/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Point to API Gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // We can handle global 401 unauthorized errors here
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        logout();
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
