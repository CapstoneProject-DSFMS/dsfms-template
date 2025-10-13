import apiClient from './config.js';

const courseAPI = {
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

  // Delete/Disable course
  deleteCourse: async (courseId) => {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  // Archive course
  archiveCourse: async (courseId) => {
    try {
      const response = await apiClient.post(`/courses/${courseId}/archive`);
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

  // Get department by ID (new endpoint)
  getDepartmentById: async (departmentId) => {
    try {
      const response = await apiClient.get(`/departments/${departmentId}?includeDeleted=true`);
      return response.data;
    } catch (error) {
      console.error('Error fetching department by ID:', error);
      throw error;
    }
  },

  // Get trainee enrollments
  getTraineeEnrollments: async (traineeId) => {
    try {
      console.log('🔍 Getting trainee enrollments for traineeId:', traineeId);
      const response = await apiClient.get(`/courses/trainees/${traineeId}/enrollments`);
      console.log('✅ Trainee enrollments API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching trainee enrollments:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error details:', error.response?.data);
      throw error;
    }
  }
};

export default courseAPI;
