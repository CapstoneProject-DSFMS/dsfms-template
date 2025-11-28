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

  /**
   * Save assessment section field values
   * @param {Object} data - { assessmentSectionId, values: [{ assessmentValueId, answerValue }] }
   * @returns {Promise} Save response
   */
  saveSectionValues: async (data) => {
    try {
      const response = await apiClient.post('/assessments/sections/save-values', data);
      return response.data;
    } catch (error) {
      console.error('Error saving section values:', error);
      throw error;
    }
  },

  /**
   * Update assessment section field values
   * @param {Object} data - { assessmentSectionId, values: [{ assessmentValueId, answerValue }] }
   * @returns {Promise} Update response
   */
  updateSectionValues: async (data) => {
    try {
      const response = await apiClient.patch('/assessments/sections/update-values', data);
      return response.data;
    } catch (error) {
      console.error('Error updating section values:', error);
      throw error;
    }
  },

  /**
   * Update trainee lock status for an assessment
   * @param {string} assessmentId - Assessment ID
   * @param {boolean} isTraineeLocked - Lock status
   * @returns {Promise} Update response
   */
  updateTraineeLock: async (assessmentId, isTraineeLocked) => {
    try {
      const response = await apiClient.put(`/assessments/${assessmentId}/trainee-lock`, {
        isTraineeLocked
      });
      return response.data;
    } catch (error) {
      console.error('Error updating trainee lock:', error);
      throw error;
    }
  },

  /**
   * Submit an assessment
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} Submit response
   */
  submitAssessment: async (assessmentId) => {
    try {
      const response = await apiClient.post(`/assessments/${assessmentId}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  },

  /**
   * Get assessments by department
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise} Department assessments response
   */
  getDepartmentAssessments: async (params = {}) => {
    try {
      const response = await apiClient.get('/assessments/department', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching department assessments:', error);
      throw error;
    }
  },

  /**
   * Approve or reject an assessment
   * @param {string} assessmentId - Assessment ID
   * @param {string} action - 'APPROVED' or 'REJECTED'
   * @param {string} comment - Optional comment (required for REJECTED)
   * @returns {Promise} Approve/reject response
   */
  approveRejectAssessment: async (assessmentId, action, comment = '') => {
    try {
      const body = { action };
      if (action === 'REJECTED' && comment) {
        body.comment = comment;
      }
      const response = await apiClient.put(`/assessments/${assessmentId}/approve-reject`, body);
      return response.data;
    } catch (error) {
      console.error('Error approving/rejecting assessment:', error);
      throw error;
    }
  },
};

export default assessmentAPI;

