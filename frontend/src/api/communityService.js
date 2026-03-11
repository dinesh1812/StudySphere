import apiClient from './axios';

export const communityService = {
  createCommunity: async (communityData) => {
    return await apiClient.post('/communities', communityData);
  },

  joinCommunity: async (communityId, studentId) => {
    return await apiClient.post(`/communities/${communityId}/join`, null, {
      params: { studentId }
    });
  },

  getAllCommunities: async () => {
    return await apiClient.get('/communities');
  }
};
