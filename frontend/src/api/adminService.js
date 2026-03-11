import apiClient from './axios';
import { getUser } from '../auth/auth';

export const adminService = {
  createCollege: async (name, domain) => {
    try {
      const response = await apiClient.post('/users/colleges', null, {
        params: { name, domain }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create college'
      };
    }
  },

  getPendingCollegeAdmins: async () => {
    try {
      const response = await apiClient.get('/users/pending-admins');
      return { success: true, data: response.data || [] };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch pending admins', data: [] };
    }
  },

  approveUser: async (targetUserId) => {
    try {
      const user = getUser();
      const response = await apiClient.put(`/users/approve/${targetUserId}`, null, {
        params: { adminId: user.id }
      });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to approve user' };
    }
  },

  getPendingStudents: async (collegeId) => {
    try {
      const response = await apiClient.get(`/users/colleges/${collegeId}/pending-students`);
      return { success: true, data: response.data || [] };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch pending students', data: [] };
    }
  }
};
