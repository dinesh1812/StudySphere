import apiClient from './axios';

export const authService = {
  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  registerStudent: async (studentData) => {
    return await apiClient.post('/users/register/student', studentData);
  },

  registerAdmin: async (adminData) => {
    return await apiClient.post('/users/register/admin', adminData);
  },

  getUserSummary: async (userId) => {
    return await apiClient.get(`/users/${userId}/summary`);
  }
};
