import apiClient from './config.js';

const dashboardAPI = {
  // Get academic dashboard overview
  getAcademicOverview: async () => {
    try {
      const response = await apiClient.get('/dashboard/academic/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching academic dashboard overview:', error);
      throw error;
    }
  },

  // Get trainee dashboard overview
  getTraineeOverview: async () => {
    try {
      const response = await apiClient.get('/dashboard/trainee/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching trainee dashboard overview:', error);
      throw error;
    }
  },
};

export default dashboardAPI;

