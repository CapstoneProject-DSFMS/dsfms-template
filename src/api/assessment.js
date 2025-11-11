import apiClient from './config.js';

const assessmentAPI = {
  /**
   * Get all assessment events
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise} Assessment events response
   */
  getAssessmentEvents: async (params = {}) => {
    try {
      const response = await apiClient.get('/assessments/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment events:', error);
      throw error;
    }
  },

  /**
   * Update assessment event
   * @param {Object} params - Query parameters (name, courseId or subjectId, occuranceDate, templateId)
   * @param {Object} body - Request body (name, occuranceDate)
   * @returns {Promise} Update response
   */
  updateAssessmentEvent: async (params = {}, body = {}) => {
    try {
      const response = await apiClient.put('/assessments/events/update', body, { params });
      return response.data;
    } catch (error) {
      console.error('Error updating assessment event:', error);
      throw error;
    }
  },

  /**
   * Create new assessment event
   * @param {Object} data - Assessment event data (templateId, subjectId or courseId, occuranceDate, name, traineeIds)
   * @returns {Promise} Create response
   */
  createAssessmentEvent: async (data) => {
    try {
      const response = await apiClient.post('/assessments', data);
      return response.data;
    } catch (error) {
      console.error('Error creating assessment event:', error);
      throw error;
    }
  },

  /**
   * Create bulk assessment event
   * @param {Object} data - Bulk assessment event data (templateId, subjectId or courseId, occuranceDate, name, excludeTraineeIds)
   * @returns {Promise} Create response
   */
  createBulkAssessmentEvent: async (data) => {
    try {
      const response = await apiClient.post('/assessments/bulk', data);
      return response.data;
    } catch (error) {
      console.error('Error creating bulk assessment event:', error);
      throw error;
    }
  },
};

export default assessmentAPI;

