import apiClient from './axios';

export const communityService = {
  createCommunity: async (communityData) => {
    return await apiClient.post('/communities', communityData);
  },

  joinCommunity: async (communityId) => {
    // studentId is now securely extracted by backend from the JWT via X-User-Id header
    return await apiClient.post(`/communities/${communityId}/join`);
  },

  getAllCommunities: async () => {
    return await apiClient.get('/communities');
  }
};
