import apiClient from './axios';

export const postService = {
  createPost: async (postData) => {
    return await apiClient.post('/posts', postData);
  },

  getGeneralFeed: async () => {
    return await apiClient.get('/posts/general');
  },

  getCommunityFeed: async (communityId) => {
    return await apiClient.get(`/posts/community/${communityId}`);
  },

  getPost: async (postId) => {
    return await apiClient.get(`/posts/${postId}`);
  },

  upvotePost: async (postId) => {
    return await apiClient.put(`/posts/${postId}/upvote`);
  },

  downvotePost: async (postId) => {
    return await apiClient.put(`/posts/${postId}/downvote`);
  },

  reportPost: async (postId, reason) => {
    return await apiClient.post(`/posts/${postId}/report`, null, {
      params: { reason }
    });
  },

  addComment: async (commentData) => {
    return await apiClient.post('/posts/comments', commentData);
  },

  getComments: async (postId) => {
    return await apiClient.get(`/posts/${postId}/comments`);
  }
};
