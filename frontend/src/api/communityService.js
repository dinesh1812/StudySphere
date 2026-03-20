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
    // This now returns only the communities the user has joined (filtered by backend)
    return await apiClient.get('/communities');
  },

  getBrowseCommunities: async () => {
    // New endpoint to see ALL communities if we want to join new ones
    return await apiClient.get('/communities/all');
  },

  getJoinedCommunityIds: async () => {
    return await apiClient.get('/communities/joined');
  },

  leaveCommunity: async (communityId) => {
    return await apiClient.delete(`/communities/${communityId}/leave`);
  },

  deleteCommunity: async (communityId) => {
    return await apiClient.delete(`/communities/${communityId}`);
  },

  getMembers: async (communityId) => {
    return await apiClient.get(`/communities/${communityId}/members`);
  },

  removeMember: async (communityId, studentId) => {
    return await apiClient.delete(`/communities/${communityId}/members/${studentId}`);
  }
};
