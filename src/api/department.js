import apiClient from './config.js';

// Department API service
export const departmentAPI = {
  // Get all departments with optional filters
  getDepartments: async (params = {}) => {
    try {
      const response = await apiClient.get('/departments', {
        params: {
          includeDeleted: true,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    try {
      const response = await apiClient.get(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  },

  // Create new department
  createDepartment: async (departmentData) => {
    try {
      const response = await apiClient.post('/departments', departmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await apiClient.put(`/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating department:', error);
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
      return response.data.users; // Return just the users array
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
  removeTrainersFromDepartment: async (departmentId, trainerIds) => {
    try {
      const response = await apiClient.delete(`/departments/${departmentId}/trainers`, {
        data: { trainerIds }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing trainers from department:', error);
      throw error;
    }
  }
};
