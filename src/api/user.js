import apiClient from './config.js';

// User API endpoints
export const userAPI = {
  // Get all users with pagination
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      const responseData = response.data;
      
      // Handle different response formats
      // Format 1: { users: [...] }
      // Format 2: { message: "...", data: { users: [...] } }
      // Format 3: { message: "...", data: [...] }
      // Format 4: [...] (direct array)
      
      // Normalize response - handle wrapped format
      if (responseData && responseData.data) {
        // If data.data exists, it might be wrapped
        if (Array.isArray(responseData.data)) {
          return { data: responseData.data };
        } else if (responseData.data.users && Array.isArray(responseData.data.users)) {
          return { data: responseData.data.users };
        }
      }
      
      // Handle direct format
      if (Array.isArray(responseData)) {
        return { data: responseData };
      }
      
      // Handle { users: [...] } format
      if (responseData && responseData.users && Array.isArray(responseData.users)) {
        return { data: responseData.users };
      }
      
      // Default: return as is (might be { data: [...] } already)
      return responseData;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      const responseData = response.data;

      // Normalize wrapped formats: { message, data: {...} } or { data: {...} }
      if (responseData?.data && typeof responseData.data === 'object') {
        return responseData.data;
      }

      return responseData;
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
      
      // Handle different response formats (same as roleAPI)
      // Format 1: { roles: [...] }
      // Format 2: { message: "...", data: { roles: [...] } }
      // Format 3: [...] (direct array)
      const responseData = response.data;
      
      // Normalize response - handle wrapped format
      if (responseData && responseData.data && typeof responseData.data === 'object') {
        return responseData.data; // Return { roles: [...] } from { message: "...", data: { roles: [...] } }
      }
      
      return responseData; // Return direct format
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
      const response = await apiClient.delete(`/users/${userId}`);
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
  },

  // Reset password
  resetPassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/profile/reset-password', {
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get trainers only
  getTrainers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { 
        params: {
          roleName: 'TRAINER',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
