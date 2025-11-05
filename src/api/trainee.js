import apiClient from './config.js';

// Trainee API endpoints
export const traineeAPI = {
  // Get all trainees
  getTrainees: async (params = {}) => {
    try {
      const response = await apiClient.get('/trainees', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get trainee by ID
  getTraineeById: async (id) => {
    try {
      const response = await apiClient.get(`/trainees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new trainee
  createTrainee: async (traineeData) => {
    try {
      const response = await apiClient.post('/trainees', traineeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update trainee
  updateTrainee: async (id, traineeData) => {
    try {
      const response = await apiClient.put(`/trainees/${id}`, traineeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete trainee
  deleteTrainee: async (id) => {
    try {
      const response = await apiClient.delete(`/trainees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Enable/Disable trainee
  toggleTraineeStatus: async (id) => {
    try {
      const response = await apiClient.patch(`/trainees/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get trainee's enrolled courses
  getTraineeCourses: async (traineeId) => {
    try {
      const response = await apiClient.get(`/trainees/${traineeId}/courses`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get trainee's enrolled subjects
  getTraineeSubjects: async (traineeId, courseId = null) => {
    try {
      const url = courseId 
        ? `/trainees/${traineeId}/subjects?courseId=${courseId}`
        : `/trainees/${traineeId}/subjects`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get trainee's pending assessments
  getTraineeAssessments: async (traineeId) => {
    try {
      const response = await apiClient.get(`/trainees/${traineeId}/assessments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Enroll trainee in course
  enrollTrainee: async (traineeId, courseId) => {
    try {
      const response = await apiClient.post(`/trainees/${traineeId}/enroll`, { courseId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Unenroll trainee from course
  unenrollTrainee: async (traineeId, courseId) => {
    try {
      const response = await apiClient.delete(`/trainees/${traineeId}/enroll/${courseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk import trainees
  bulkImportTrainees: async (fileData) => {
    try {
      const response = await apiClient.post('/trainees/bulk-import', fileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all trainees with role filter (for enrollment)
  getTraineesForEnrollment: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { 
        params: {
          roleName: 'TRAINEE',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lookup trainees by eid and email
  lookupTrainees: async (identifiers) => {
    try {
      console.log('API call - lookupTrainees with:', identifiers);
      
      // Use the working format: {trainees: [...]}
      const requestBody = { trainees: identifiers };
      console.log('Sending request with format:', requestBody);
      
      const response = await apiClient.post('/subjects/trainees/lookup', requestBody);
      console.log('API response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Lookup failed:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },

  // Get trainees by course ID
  getTraineesByCourseId: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/trainees`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trainees by course ID:', error);
      throw error;
    }
  }
};

export default traineeAPI;