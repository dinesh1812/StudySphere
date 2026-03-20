import apiClient from './axios';

export const eventService = {
  // Post a new global event (Admin only)
  createEvent: async (eventData) => {
    return await apiClient.post('/events', eventData);
  },

  // Get all upcoming global events (For students)
  getGlobalEvents: async () => {
    return await apiClient.get('/events');
  },

  // Get events for a specific college (For admin management)
  getCollegeEvents: async (collegeId) => {
    // Currently the backend has getGlobalEvents, we can filter on frontend 
    // or add a specific endpoint if needed. For now, we fetch all.
    return await apiClient.get('/events');
  },
  
  // Delete an event
  deleteEvent: async (eventId) => {
    return await apiClient.delete(`/events/${eventId}`);
  }
};
