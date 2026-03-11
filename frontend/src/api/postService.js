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

  upvotePost: async (postId) => {
    return await apiClient.put(`/posts/${postId}/upvote`);
  },

  addComment: async (commentData) => {
    return await apiClient.post('/posts/comments', commentData);
  },

  getComments: async (postId) => {
    return await apiClient.get(`/posts/${postId}/comments`);
  }
};
