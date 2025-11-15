import apiClient from './config.js';

// Template API endpoints
const templateAPI = {
  // Get all templates
  getTemplates: async (params = {}) => {
    try {
      const response = await apiClient.get('/templates', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get template by ID
  getTemplateById: async (templateId) => {
    try {
      const response = await apiClient.get(`/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get templates by department
  getTemplatesByDepartment: async (departmentId, params = {}) => {
    try {
      const response = await apiClient.get(`/templates/department/${departmentId}`, {
        params: {
          status: 'PUBLISHED',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new template
  createTemplate: async (templateData) => {
    try {
      const response = await apiClient.post('/templates', templateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update template
  updateTemplate: async (templateId, templateData) => {
    try {
      const response = await apiClient.put(`/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete template
  deleteTemplate: async (templateId) => {
    try {
      const response = await apiClient.delete(`/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get template PDF preview
  getTemplatePDF: async (templateFormId) => {
    try {
      const response = await apiClient.get(`/templates/pdf/${templateFormId}`, {
        responseType: 'blob' // Important: get PDF as blob
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Review template (approve or reject)
  reviewTemplate: async (templateId, reviewData) => {
    try {
      const response = await apiClient.patch(`/templates/${templateId}/review`, reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Extract fields from template file
  extractFields: async (fileUrl) => {
    try {
      // Try both endpoints and parameter formats
      // Endpoint 1: /templates/extract-fields with fileUrl
      try {
        const response = await apiClient.post('/templates/extract-fields', {
          fileUrl: fileUrl
        });
        return response.data;
      } catch (error1) {
        // If first endpoint fails, try alternative endpoint
        console.log('⚠️ First endpoint failed, trying alternative...', error1?.response?.data);
        const response = await apiClient.post('/templates/extract-fields-from-url', {
          url: fileUrl
        });
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  // Create new version from published template
  createVersion: async (versionData) => {
    try {
      const response = await apiClient.post('/templates/create-version', versionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default templateAPI;



