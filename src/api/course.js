import apiClient, { publicApiClient } from './config.js';

const courseAPI = {
  // Get all courses from public API (no authentication required)
  getPublicCourses: async () => {
    try {
      const response = await publicApiClient.get('/public/courses');
      // Handle response format: { data: [...], totalItems: ... }
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching public courses:', error);
      throw error;
    }
  },
  // Get all courses
  getCourses: async (params = {}) => {
    try {
      const response = await apiClient.get('/courses', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      // Handle API response structure: { message: "...", data: {...} }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    try {
      const response = await apiClient.post('/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },


  // Archive course
  archiveCourse: async (courseId) => {
    try {
      const response = await apiClient.delete(`/courses/${courseId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Error archiving course:', error);
      throw error;
    }
  },

  // Get courses by department
  getCoursesByDepartment: async (departmentId, params = {}) => {
    try {
      const response = await apiClient.get(`/courses`, { 
        params: { 
          departmentId, 
          ...params 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by department:', error);
      throw error;
    }
  },

  // Get department with courses (combined endpoint)
  getDepartmentWithCourses: async (departmentId) => {
    try {
      const response = await apiClient.get(`/courses/department/${departmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching department with courses:', error);
      throw error;
    }
  },

  // Get department by ID
  getDepartmentById: async (departmentId) => {
    try {
      const response = await apiClient.get(`/departments/${departmentId}`, {
        params: {
          includeDeleted: true,
        }
      });
      // Handle response format: { message: "...", data: { id, name, courses, ... } }
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('Error fetching department by ID:', error);
      throw error;
    }
  },

  // Get trainee enrollments for a specific course
  getTraineeEnrollments: async (courseId, traineeId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/trainees/${traineeId}/enrollments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trainee enrollments:', error);
      throw error;
    }
  },

  // Get trainee enrollments with status filter
  getTraineeEnrollmentsByStatus: async (traineeId, status = 'ENROLLED') => {
    try {
      const response = await apiClient.get(`/courses/trainees/${traineeId}/enrollments`, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trainee enrollments:', error);
      throw error;
    }
  },

  // Get enrolled trainees for a course
  getCourseTrainees: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/trainees`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course trainees:', error);
      throw error;
    }
  },

  // Get course enrollment batches
  getCourseEnrollmentBatches: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/enrollments/batches`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course enrollment batches:', error);
      throw error;
    }
  },

  // Delete all subject enrollments in course by batch code
  deleteBatchEnrollments: async (courseId, batchCode) => {
    try {
      const response = await apiClient.delete(`/courses/${courseId}/enrollments/batches/${batchCode}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting batch enrollments:', error);
      throw error;
    }
  },

  // Get active trainers (replaced old getAvailableTrainersForCourse)
  getActiveTrainers: async (courseId = null, subjectId = null) => {
    try {
      let url = `/subjects/courses/active-trainers`;
      const params = new URLSearchParams();
      
      if (courseId) params.append('courseId', courseId);
      if (subjectId) params.append('subjectId', subjectId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching active trainers:', error);
      throw error.response?.data || error.message;
    }
  },

  // Assign trainer to course
  // POST {{baseUrl}}/courses/{courseId}/trainers
  assignTrainerToCourse: async (courseId, trainerData) => {
    try {
      const response = await apiClient.post(`/courses/${courseId}/trainers`, trainerData);
      return response.data;
    } catch (error) {
      console.error('Error assigning trainer to course:', error);
      throw error;
    }
  },

  // Remove trainer from course
  // DELETE {{baseUrl}}/courses/{courseId}/trainers/{trainerId}
  removeTrainerFromCourse: async (courseId, trainerId) => {
    try {
      const response = await apiClient.delete(`/courses/${courseId}/trainers/${trainerId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing trainer from course:', error);
      throw error;
    }
  },

  // Update trainer role in course
  // PUT {{baseUrl}}/courses/{courseId}/trainers/{trainerId}
  updateTrainerInCourse: async (courseId, trainerId, roleData) => {
    try {
      const response = await apiClient.put(`/courses/${courseId}/trainers/${trainerId}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating trainer in course:', error);
      throw error;
    }
  }
};

export default courseAPI;
