import apiClient, { publicApiClient } from './config.js';

// Department API service
export const departmentAPI = {
  // Get all departments from public API (no authentication required)
  getPublicDepartments: async () => {
    try {
      const response = await publicApiClient.get('/public/departments');
      // Handle response format: { data: [...], totalItems: ... }
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching public departments:', error);
      throw error;
    }
  },
  // Get all departments with optional filters
  getDepartments: async (params = {}) => {
    try {
      const response = await apiClient.get('/departments', {
        params: {
          includeDeleted: true,
          ...params
        }
      });
      // Handle response format: { message: "...", data: { departments: [...], totalItems: ... } }
      const departments = response.data?.data?.departments || response.data?.departments || [];
      return departments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    try {
      const response = await apiClient.get(`/departments/${id}`, {
        params: {
          includeDeleted: true,
        }
      });
      // Handle response format: { message: "...", data: { id, name, courses, ... } }
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  },

  // Create new department
  createDepartment: async (departmentData) => {
    try {
      console.log('🔍 API - Creating department with data:', departmentData);
      const response = await apiClient.post('/departments', departmentData);
      console.log('✅ API - Department created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API - Error creating department:', error);
      console.error('❌ API - Error response:', error.response?.data);
      console.error('❌ API - Error status:', error.response?.status);
      throw error;
    }
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    try {
      console.log('🔄 API - Updating department:', { id, departmentData });
      const response = await apiClient.put(`/departments/${id}`, departmentData);
      console.log('✅ API - Department updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API - Error updating department:', error);
      console.error('❌ API - Error response:', error.response?.data);
      console.error('❌ API - Error status:', error.response?.status);
      console.error('❌ API - Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      });
      
      // Provide more specific error messages
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        const networkError = new Error('Network error: Unable to connect to server. Please check your internet connection or contact support.');
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      } else if (error.response?.status === 502) {
        const gatewayError = new Error('Server error (502): Bad Gateway. The server is temporarily unavailable. Please try again later.');
        gatewayError.code = 'BAD_GATEWAY';
        throw gatewayError;
      } else if (error.response?.status === 403) {
        const permissionError = new Error('Permission denied: You do not have permission to update this department.');
        permissionError.code = 'PERMISSION_DENIED';
        throw permissionError;
      }
      
      throw error;
    }
  },

  // Delete department (soft delete)
  deleteDepartment: async (id) => {
    try {
      const response = await apiClient.delete(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },

  // Disable department using DELETE method
  disableDepartment: async (id) => {
    try {
      const response = await apiClient.delete(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error disabling department:', error);
      throw error;
    }
  },

  // Enable department using PATCH method
  enableDepartment: async (id) => {
    try {
      const response = await apiClient.patch(`/departments/${id}/enable`);
      return response.data;
    } catch (error) {
      console.error('Error enabling department:', error);
      throw error;
    }
  },

  // Toggle department status (ACTIVE/INACTIVE)
  toggleDepartmentStatus: async (id) => {
    try {
      const response = await apiClient.patch(`/departments/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling department status:', error);
      throw error;
    }
  },

  // Bulk operations
  bulkDeleteDepartments: async (ids) => {
    try {
      const response = await apiClient.delete('/departments/bulk', {
        data: { ids }
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting departments:', error);
      throw error;
    }
  },

  bulkToggleStatus: async (ids, status) => {
    try {
      const response = await apiClient.patch('/departments/bulk/toggle-status', {
        ids,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk toggling department status:', error);
      throw error;
    }
  },

  // Get available department heads
  getDepartmentHeads: async () => {
    try {
      const response = await apiClient.get('/departments/helpers/department-heads');
      return response.data; // Return the full response { users: [...], totalItems: 7 }
    } catch (error) {
      console.error('Error fetching department heads:', error);
      throw error;
    }
  },


  // Assign trainers to department
  assignTrainersToDepartment: async (departmentId, trainerEids) => {
    try {
      const response = await apiClient.patch(`/departments/${departmentId}/add-trainers`, {
        trainerEids
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning trainers to department:', error);
      throw error;
    }
  },

  // Remove trainers from department
  removeTrainersFromDepartment: async (departmentId, trainerEids) => {
    try {
      const response = await apiClient.patch(`/departments/${departmentId}/remove-trainers`, {
        trainerEids
      });
      return response.data;
    } catch (error) {
      console.error('Error removing trainers from department:', error);
      throw error;
    }
  }
};
