import apiClient from './config.js';

// User API endpoints
export const userAPI = {
  // Get all users with pagination
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk import users
  bulkImportUsers: async (usersData) => {
    try {
      const response = await apiClient.post('/users/bulk', {
        users: usersData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all roles
  getRoles: async () => {
    try {
      const response = await apiClient.get('/roles');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Enable user
  enableUser: async (userId) => {
    try {
      const response = await apiClient.patch(`/users/${userId}/enable`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Disable user
  disableUser: async (userId) => {
    try {
      const response = await apiClient.patch(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Disable/Enable user with dynamic API endpoint (legacy method)
  toggleUserStatus: async (userId, status) => {
    try {
      const response = await apiClient.patch(`/users/${userId}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
