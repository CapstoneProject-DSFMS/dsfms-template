import apiClient from './config';

const reportAPI = {
  // Get reports by request type
  getReportsByType: async (requestType, params = {}) => {
    try {
      const response = await apiClient.get('/reports', {
        params: {
          requestType,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Get my reports by type
  getMyReports: async (requestType, params = {}) => {
    try {
      const response = await apiClient.get('/reports/my-reports', {
        params: {
          requestType,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my reports:', error);
      throw error;
    }
  },

  // Get all incidents
  getIncidents: async (params = {}) => {
    return reportAPI.getReportsByType('INCIDENT', params);
  },

  // Get all feedback
  getFeedback: async (params = {}) => {
    return reportAPI.getReportsByType('FEEDBACK', params);
  },

  // Get my incidents
  getMyIncidents: async (params = {}) => {
    return reportAPI.getMyReports('INCIDENT', params);
  },

  // Get my feedback
  getMyFeedback: async (params = {}) => {
    return reportAPI.getMyReports('FEEDBACK', params);
  },

  // Get all other reports
  getOther: async (params = {}) => {
    return reportAPI.getReportsByType('OTHER', params);
  },

  // Get my other reports
  getMyOther: async (params = {}) => {
    return reportAPI.getMyReports('OTHER', params);
  },

  // Get all reports
  getAllReports: async (params = {}) => {
    try {
      const response = await apiClient.get('/reports', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all reports:', error);
      throw error;
    }
  },

  // Get report by ID
  getReportById: async (reportId) => {
    try {
      const response = await apiClient.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },

  // Acknowledge report
  acknowledgeReport: async (reportId) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}/acknowledge`);
      return response.data;
    } catch (error) {
      console.error('Error acknowledging report:', error);
      throw error;
    }
  },

  // Resolve report
  resolveReport: async (reportId, responseData) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}/resolve`, {
        response: responseData,
      });
      return response.data;
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  },

  // Submit response to report
  submitResponse: async (reportId, responseData) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}/respond`, {
        response: responseData,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  },

  // Respond to report (alias for submitResponse)
  respondToReport: async (reportId, responseData) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}/respond`, {
        response: responseData,
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to report:', error);
      throw error;
    }
  },

  // Cancel report
  cancelReport: async (reportId) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling report:', error);
      throw error;
    }
  },

  // Create report
  createReport: async (reportData) => {
    try {
      const response = await apiClient.post('/reports', reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },
};

export default reportAPI;
