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

  /**
   * Get user assessment events
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise} User assessment events response
   */
  getUserEvents: async (params = {}) => {
    try {
      const response = await apiClient.get('/assessments/user-events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user assessment events:', error);
      throw error;
    }
  },

  /**
   * Get assessments by course
   * @param {string} courseId
   * @param {Object} params
   */
  getCourseAssessments: async (courseId, params = {}) => {
    try {
      const response = await apiClient.get('/assessments/course', {
        params: { courseId, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course assessments:', error);
      throw error;
    }
  },

  /**
   * Get assessments by subject
   * @param {string} subjectId
   * @param {Object} params
   */
  getSubjectAssessments: async (subjectId, params = {}) => {
    try {
      const response = await apiClient.get('/assessments/subject', {
        params: { subjectId, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subject assessments:', error);
      throw error;
    }
  },

  /**
   * Get sections of a specific assessment form
   * @param {string} assessmentId
   * @returns {Promise} sections response
   */
  getAssessmentSections: async (assessmentId) => {
    try {
      const response = await apiClient.get(`/assessments/${assessmentId}/sections`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment sections:', error);
      throw error;
    }
  },

  /**
   * Get assessment form preview URL/content
   * @param {string} assessmentId
   */
  getAssessmentFormPreview: async (assessmentId) => {
    try {
      const response = await apiClient.get(`/assessments/${assessmentId}/preview`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment preview:', error);
      throw error;
    }
  },

  /**
   * Get fields for a specific assessment section
   * @param {string} assessmentSectionId
   * @returns {Promise} Section fields response
   */
  getAssessmentSectionFields: async (assessmentSectionId) => {
    try {
      const response = await apiClient.get(`/assessments/sections/${assessmentSectionId}/fields`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment section fields:', error);
      throw error;
    }
  },

  /**
   * Confirm participation in an assessment
   * @param {string} assessmentId
   * @returns {Promise} Confirm participation response
   */
  confirmParticipation: async (assessmentId) => {
    try {
      const response = await apiClient.put(`/assessments/${assessmentId}/confirm-participation`);
      return response.data;
    } catch (error) {
      console.error('Error confirming participation:', error);
      throw error;
    }
  },
};

export default assessmentAPI;

