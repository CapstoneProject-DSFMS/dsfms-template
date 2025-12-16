import apiClient, { publicApiClient } from './config.js';

// Helper function to normalize API response format
// Handles both new format: { message: "...", data: { ... } }
// and old format: { ... } or array
const normalizeResponse = (responseData) => {
  // New format with wrapper: { message: "...", data: { ... } }
  if (responseData && responseData.data && typeof responseData.data === 'object') {
    return responseData.data;
  }
  // Old format or direct data
  return responseData;
};

// Role API endpoints
export const roleAPI = {
  // Get all roles
  getRoles: async (params = {}) => {
    try {
      const response = await apiClient.get('/roles', { params });
      return normalizeResponse(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get role by ID
  getRoleById: async (id) => {
    try {
      const response = await apiClient.get(`/roles/${id}`);
      return normalizeResponse(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await apiClient.post('/roles', roleData);
      return normalizeResponse(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    try {
      console.log('🔍 API updateRole called with:', {
        id: id,
        roleData: roleData,
        url: `/roles/${id}`,
        method: 'PUT'
      });
      const response = await apiClient.put(`/roles/${id}`, roleData);
      const normalizedData = normalizeResponse(response.data);
      console.log('✅ API updateRole success:', normalizedData);
      return normalizedData;
    } catch (error) {
      console.error('❌ API updateRole error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || error.message;
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      const response = await apiClient.delete(`/roles/${id}`);
      return normalizeResponse(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle role status (disable/enable)
  toggleRoleStatus: async (id) => {
    try {
      const response = await apiClient.patch(`/roles/${id}/toggle-status`);
      return normalizeResponse(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Enable role
  enableRole: async (id) => {
    try {
      const response = await apiClient.patch(`/roles/${id}/enable`);
      return normalizeResponse(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Disable role
  disableRole: async (id) => {
    try {
      const response = await apiClient.delete(`/roles/${id}`);
      return normalizeResponse(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
