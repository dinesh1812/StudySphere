import apiClient from './axios';

export const adminService = {
  createCollege: async (name, domain) => {
    try {
      const response = await apiClient.post('/users/colleges', null, {
        params: { name, domain }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to create college' };
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

  getApprovedCollegeAdmins: async () => {
    try {
      const response = await apiClient.get('/users/approved-admins');
      return { success: true, data: response.data || [] };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch approved admins', data: [] };
    }
  },

  approveUser: async (targetUserId) => {
    try {
      const response = await apiClient.put(`/users/approve/${targetUserId}`);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to approve user' };
    }
  },

  rejectUser: async (targetUserId) => {
    try {
      const response = await apiClient.put(`/users/reject/${targetUserId}`);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to reject user' };
    }
  },

  getPendingStudents: async (collegeId) => {
    try {
      const response = await apiClient.get(`/users/colleges/${collegeId}/pending-students`);
      return { success: true, data: response.data || [] };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch pending students', data: [] };
    }
  },

  getApprovedStudents: async (collegeId) => {
    try {
      const response = await apiClient.get(`/users/colleges/${collegeId}/approved-students`);
      return { success: true, data: response.data || [] };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch approved students', data: [] };
    }
  },

  getAllColleges: async () => {
    try {
      const response = await apiClient.get('/users/colleges/all');
      return { success: true, data: response.data || [] };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch colleges', data: [] };
    }
  }
};
