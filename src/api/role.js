import apiClient from './config.js';

// Role API endpoints
export const roleAPI = {
  // Get all roles
  getRoles: async (params = {}) => {
    try {
      const response = await apiClient.get('/roles', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get role by ID
  getRoleById: async (id) => {
    try {
      const response = await apiClient.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await apiClient.post('/roles', roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    try {
      const response = await apiClient.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      const response = await apiClient.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle role status (disable/enable)
  toggleRoleStatus: async (id) => {
    try {
      const response = await apiClient.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
