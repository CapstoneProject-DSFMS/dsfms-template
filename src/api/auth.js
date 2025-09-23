import apiClient from './config.js';

// Auth API endpoints
export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check auth status
  checkStatus: async () => {
    try {
      const response = await apiClient.get('/auth/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};
