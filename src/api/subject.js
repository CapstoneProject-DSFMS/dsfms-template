import apiClient from './config.js';

const subjectAPI = {
  // Get all subjects with pagination
  getSubjects: async (params = {}) => {
    try {
      const response = await apiClient.get('/subjects', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  // Get subjects by course ID
  getSubjectsByCourse: async (courseId, params = {}) => {
    try {
      const response = await apiClient.get(`/subjects/course/${courseId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects by course:', error);
      throw error;
    }
  },

  // Get single subject by ID
  getSubjectById: async (subjectId) => {
    try {
      const response = await apiClient.get(`/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }
  },

  // Create new subject
  createSubject: async (subjectData) => {
    try {
      const response = await apiClient.post('/subjects', subjectData);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  // Update subject
  updateSubject: async (subjectId, subjectData) => {
    try {
      const response = await apiClient.put(`/subjects/${subjectId}`, subjectData);
      return response.data;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  // Delete subject (soft delete)
  deleteSubject: async (subjectId) => {
    try {
      const response = await apiClient.delete(`/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  },

  // Bulk import subjects
  bulkImportSubjects: async (subjectsData) => {
    try {
      console.log('🔍 Sending bulk import data to API:', subjectsData);
      console.log('🔍 Data type check:', {
        isArray: Array.isArray(subjectsData),
        length: subjectsData.length,
        firstItem: subjectsData[0],
        firstItemKeys: Object.keys(subjectsData[0] || {}),
        firstItemTypes: Object.keys(subjectsData[0] || {}).reduce((acc, key) => {
          acc[key] = typeof subjectsData[0][key];
          return acc;
        }, {})
      });
      // Use the working format: Object with courseId and subjects
      const courseId = subjectsData[0]?.courseId;
      const payload = {
        courseId: courseId,
        subjects: subjectsData.map(subject => {
          const { courseId, ...rest } = subject;
          return rest;
        })
      };
      console.log('🔍 Using working format:', payload);
      const response = await apiClient.post('/subjects/bulk', payload);
      console.log('✅ Bulk import API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error bulk importing subjects:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.response?.data?.message);
      console.error('❌ Validation errors:', error.response?.data?.errors);
      console.error('❌ Full error response:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  },

  // Assign trainees to subject
  assignTrainees: async (subjectId, traineeData) => {
    try {
      console.log('🔍 Assigning trainees to subject:', subjectId);
      console.log('🔍 Trainee data being sent:', JSON.stringify(traineeData, null, 2));
      console.log('🔍 Data validation:', {
        subjectId: subjectId,
        subjectIdType: typeof subjectId,
        traineeDataKeys: Object.keys(traineeData),
        enrolledCount: traineeData.enrolledCount,
        enrolledArray: traineeData.enrolled,
        enrolledLength: traineeData.enrolled?.length,
        firstTrainee: traineeData.enrolled?.[0],
        firstTraineeKeys: traineeData.enrolled?.[0] ? Object.keys(traineeData.enrolled[0]) : null
      });
      
      const response = await apiClient.post(`/subjects/${subjectId}/assign-trainees`, traineeData);
      console.log('✅ Assign trainees API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error assigning trainees to subject:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error message:', error.response?.data?.message);
      console.error('❌ Validation errors:', error.response?.data?.errors);
      console.error('❌ Full error response:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  },

  // Remove trainee from subject
  removeTraineeFromSubject: async (subjectId, traineeId, batchCode) => {
    try {
      console.log('🔍 Removing trainee from subject:', { subjectId, traineeId, batchCode });
      
      const requestData = {
        batchCode: batchCode
      };
      
      console.log('🔍 Request data:', JSON.stringify(requestData, null, 2));
      
      const response = await apiClient.delete(`/subjects/${subjectId}/trainees/${traineeId}`, {
        data: requestData
      });
      
      console.log('✅ Remove trainee from subject API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing trainee from subject:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error message:', error.response?.data?.message);
      throw error;
    }
  },

  // Add trainer to subject
  addTrainerToSubject: async (subjectId, trainerData) => {
    try {
      const requestData = {
        trainerUserId: trainerData.trainer_user_id,
        roleInSubject: trainerData.role_in_subject
      };
      
      const response = await apiClient.post(`/subjects/${subjectId}/trainers`, requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get trainers of a subject (NOT USED - using subject.instructors instead)
  getSubjectTrainers: async (subjectId) => {
    try {
      const response = await apiClient.get(`/subjects/${subjectId}/trainers`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update trainer role in subject
  updateTrainerRole: async (subjectId, trainerId, roleData) => {
    try {
      const requestData = {
        roleInSubject: roleData.roleInSubject
      };
      
      const response = await apiClient.put(`/subjects/${subjectId}/trainers/${trainerId}`, requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove trainer from subject
  removeTrainerFromSubject: async (subjectId, trainerId) => {
    try {
      const response = await apiClient.delete(`/subjects/${subjectId}/trainers/${trainerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default subjectAPI;
