import apiClient from './config.js';

const subjectAPI = {
  // Get all subjects with pagination
  getSubjects: async (params = {}) => {
    try {
      const response = await apiClient.get('/subjects', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get subjects by course ID
  getSubjectsByCourse: async (courseId, params = {}) => {
    const url = `/subjects/course/${courseId}`;
    
    try {
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single subject by ID
  getSubjectById: async (subjectId) => {
    try {
      // Ensure GET request has no body and clear any data property
      const response = await apiClient.get(`/subjects/${subjectId}`, {
        data: undefined, // Explicitly remove any data
        transformRequest: [(data, headers) => {
          // Remove Content-Type for GET requests to avoid body validation
          delete headers['Content-Type'];
          return undefined; // No body for GET
        }]
      });
      
      // Handle nested data structure if exists (some APIs return { data: {...} })
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new subject
  createSubject: async (subjectData) => {
    try {
      const response = await apiClient.post('/subjects', subjectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update subject
  updateSubject: async (subjectId, subjectData) => {
    try {
      const response = await apiClient.put(`/subjects/${subjectId}`, subjectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete subject (soft delete)
  deleteSubject: async (subjectId) => {
    try {
      const response = await apiClient.delete(`/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Archive subject (using DELETE method)
  archiveSubject: async (subjectId) => {
    try {
      const response = await apiClient.delete(`/subjects/${subjectId}/archive`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk import subjects
  bulkImportSubjects: async (subjectsData) => {
    try {
      // Use the working format: Object with courseId and subjects
      const courseId = subjectsData[0]?.courseId;
      const payload = {
        courseId: courseId,
        subjects: subjectsData.map(subject => {
          const { courseId, ...rest } = subject;
          return rest;
        })
      };
      const response = await apiClient.post('/subjects/bulk', payload);
      
      // Handle 304 Not Modified - subjects already exist
      if (response.status === 304) {
        // Return a response indicating subjects already exist
        return {
          summary: {
            created: 0,
            failed: 0,
            skipped: subjectsData.length,
            total: subjectsData.length
          },
          message: 'All subjects already exist'
        };
      }
      
      return response.data;
    } catch (error) {
      // Handle 304 in error response
      if (error.response?.status === 304) {
        // Return a response indicating subjects already exist
        return {
          summary: {
            created: 0,
            failed: 0,
            skipped: subjectsData.length,
            total: subjectsData.length
          },
          message: 'All subjects already exist'
        };
      }
      throw error;
    }
  },

  // Assign trainees to subject (single subject)
  assignTrainees: async (subjectId, traineeData) => {
    try {
      // Backend expects camelCase: batchCode and traineeUserIds
      const requestData = {
        batchCode: traineeData.batchCode || traineeData.batch_code || '',
        traineeUserIds: traineeData.traineeUserIds || traineeData.trainee_user_ids || []
      };
      
      // Validate data types
      if (!requestData.batchCode || typeof requestData.batchCode !== 'string') {
        throw new Error('batchCode must be a non-empty string');
      }
      
      if (!Array.isArray(requestData.traineeUserIds) || requestData.traineeUserIds.length === 0) {
        throw new Error('traineeUserIds must be a non-empty array');
      }

      if (!subjectId) {
        throw new Error('subjectId is required');
      }
      
      // Create a fresh plain object
      const payload = {
        batchCode: String(requestData.batchCode).trim(),
        traineeUserIds: Array.isArray(requestData.traineeUserIds) 
          ? [...requestData.traineeUserIds]
          : []
      };
      
      // Send to single subject endpoint
      const response = await apiClient.post(`/subjects/${subjectId}/assign-trainees`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Assign trainees to multiple subjects (bulk enrollment)
  assignTraineesToMultipleSubjects: async (enrollData) => {
    try {
      // Backend expects: batchCode, traineeUserIds, subjectIds
      const requestData = {
        batchCode: enrollData.batchCode || enrollData.batch_code || '',
        traineeUserIds: enrollData.traineeUserIds || enrollData.trainee_user_ids || [],
        subjectIds: enrollData.subjectIds || enrollData.subject_ids || []
      };
      
      // Validate data types
      if (!requestData.batchCode || typeof requestData.batchCode !== 'string') {
        throw new Error('batchCode must be a non-empty string');
      }
      
      if (!Array.isArray(requestData.traineeUserIds) || requestData.traineeUserIds.length === 0) {
        throw new Error('traineeUserIds must be a non-empty array');
      }

      if (!Array.isArray(requestData.subjectIds) || requestData.subjectIds.length === 0) {
        throw new Error('subjectIds must be a non-empty array');
      }
      
      // Create a fresh plain object with batch code, trainee IDs, and subject IDs
      const payload = {
        batchCode: String(requestData.batchCode).trim(),
        traineeUserIds: Array.isArray(requestData.traineeUserIds) 
          ? [...requestData.traineeUserIds]
          : [],
        subjectIds: Array.isArray(requestData.subjectIds)
          ? [...requestData.subjectIds]
          : []
      };
      
      // Send to bulk endpoint - assigns trainees to multiple subjects at once
      const response = await apiClient.post('/subjects/assign-trainees', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove trainee from subject
  removeTraineeFromSubject: async (subjectId, traineeId, batchCode) => {
    try {
      const requestData = {
        batchCode: batchCode
      };
      
      const response = await apiClient.delete(`/subjects/${subjectId}/trainees/${traineeId}`, {
        data: requestData
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove trainee from all subjects in a course
  removeTraineeFromAllSubjects: async (courseId, traineeId) => {
    try {
      const response = await apiClient.delete(`/subjects/courses/${courseId}/trainees/${traineeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add trainer to subject
  addTrainerToSubject: async (subjectId, trainerData) => {
    try {
      // Validate input data
      if (!trainerData || typeof trainerData !== 'object') {
        throw new Error('Trainer data is required and must be an object');
      }

      // Handle both snake_case and camelCase formats
      const trainerUserId_snake = trainerData.trainer_user_id;
      const trainerUserId_camel = trainerData.trainerUserId;
      const roleInSubject_snake = trainerData.role_in_subject;
      const roleInSubject_camel = trainerData.roleInSubject;

      const finalTrainerId = trainerUserId_camel || trainerUserId_snake;
      const finalRole = roleInSubject_camel || roleInSubject_snake;

      if (!finalTrainerId) {
        throw new Error('trainerUserId is required');
      }

      if (!finalRole) {
        throw new Error('roleInSubject is required');
      }

      // Validate role value
      const validRoles = ['EXAMINER', 'ASSESSMENT_REVIEWER'];
      if (!validRoles.includes(finalRole)) {
        throw new Error(`Invalid roleInSubject: ${finalRole}. Must be one of: ${validRoles.join(', ')}`);
      }

      // Backend expects camelCase: trainerUserId and roleInSubject
      // Create a clean plain object (no prototype methods)
      const trainerUserId = String(finalTrainerId).trim();
      const roleInSubject = String(finalRole).trim();

      // Validate values before creating object
      if (!trainerUserId || trainerUserId === '') {
        throw new Error('trainerUserId cannot be empty');
      }

      if (!roleInSubject || roleInSubject === '') {
        throw new Error('roleInSubject cannot be empty');
      }

      // Backend might expect request body wrapped or with specific structure
      // Try wrapping in 'data' key first, if that fails, try direct object
      const requestBody = {
        trainerUserId: trainerUserId,
        roleInSubject: roleInSubject
      };

      // Debug: Log request data before sending
      if (import.meta.env.MODE === 'development') {
        console.log('📤 Add Trainer Request:', {
          url: `/subjects/${subjectId}/trainers`,
          method: 'POST',
          requestBody: requestBody,
          requestBodyStringified: JSON.stringify(requestBody),
          subjectId,
          originalTrainerData: trainerData
        });
      }
      
      // Use /trainers endpoint (correct endpoint)
      const response = await apiClient.post(
        `/subjects/${subjectId}/trainers`, 
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      // Log detailed error for debugging
      if (import.meta.env.MODE === 'development') {
        console.error('❌ Add Trainer Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          dataStringified: JSON.stringify(error.response?.data, null, 2),
          errors: error.response?.data?.errors,
          errorsDetailed: error.response?.data?.errors?.map((err, idx) => ({
            index: idx,
            field: err.field,
            message: err.message,
            code: err.code,
            fullError: err
          })),
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data,
            dataStringified: JSON.stringify(error.config?.data, null, 2),
            headers: error.config?.headers
          }
        });
        
        // Also log full error response for detailed inspection
        console.error('🔍 Full Error Response:', JSON.stringify(error.response?.data, null, 2));
      }
      
      // Return detailed error from API response
      if (error.response?.data) {
        throw error.response.data;
      }
      
      throw new Error(error.message || 'Failed to add trainer to subject');
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
        roleInSubject: roleData.roleInSubject // Backend expects roleInSubject (maps to role_in_assessment in DB)
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
  },

  // Get course-subjects for trainee
  getTraineeCourseSubjects: async (traineeId) => {
    try {
      const response = await apiClient.get(`/subjects/trainees/${traineeId}/course-subjects`);
      // Handle nested data structure: { message: "...", data: { traineeId: "...", courses: [...] } }
      // Return the inner data object so components can access courses directly
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get trainees enrolled in a subject
  getSubjectTrainees: async (subjectId) => {
    try {
      const response = await apiClient.get(`/subjects/${subjectId}/trainees`);
      // Handle nested data structure: { message: "...", data: { trainees: [...], totalItems: ... } }
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default subjectAPI;
