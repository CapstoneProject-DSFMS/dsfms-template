import apiClient from './config';

export const permissionAPI = {
  // Get all permissions from backend
  getPermissions: async (params = {}) => {
    try {
      const response = await apiClient.get('/permissions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get permission by ID
  getPermissionById: async (id) => {
    try {
      const response = await apiClient.get(`/permissions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new permission
  createPermission: async (permissionData) => {
    try {
      const response = await apiClient.post('/permissions', permissionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update permission
  updatePermission: async (id, permissionData) => {
    try {
      const response = await apiClient.put(`/permissions/${id}`, permissionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete/disable permission
  deletePermission: async (id) => {
    try {
      const response = await apiClient.delete(`/permissions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Enable permission
  enablePermission: async (id) => {
    try {
      const response = await apiClient.patch(`/permissions/${id}/enable`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get permission groups
  getPermissionGroups: async () => {
    try {
      const response = await apiClient.get('/permission-groups');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
