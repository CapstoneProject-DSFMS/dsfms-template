import apiClient from './config.js';

const globalFieldAPI = {
  // Get all global fields
  getGlobalFields: async () => {
    try {
      const response = await apiClient.get('/global-fields');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get global field detail
  getGlobalFieldDetail: async () => {
    try {
      const response = await apiClient.get('/global-fields/detail');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get global field by ID
  getGlobalFieldById: async (id) => {
    try {
      const response = await apiClient.get(`/global-fields/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create global field
  createGlobalField: async (fieldData) => {
    try {
      const response = await apiClient.post('/global-fields', fieldData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update global field
  updateGlobalField: async (id, fieldData) => {
    try {
      const response = await apiClient.put(`/global-fields/${id}`, fieldData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete global field
  deleteGlobalField: async (id) => {
    try {
      const response = await apiClient.delete(`/global-fields/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default globalFieldAPI;

