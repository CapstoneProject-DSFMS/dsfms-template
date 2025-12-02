import apiClient from './config.js';

const profileAPI = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile');
      // Handle response format: { message, data } or direct data
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update avatar (sends file as FormData with key 'avatar')
  updateAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Send FormData with Content-Type multipart/form-data
      const response = await apiClient.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Handle response format: { message, data } or direct data
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (data) => {
    try {
      const formData = new FormData();
      
      // Check if data is a File object (avatar)
      if (data instanceof File) {
        // Only send avatar file
        formData.append('avatar', data);
      } else if (typeof data === 'object' && data !== null) {
        // Send profile data fields
        Object.keys(data).forEach(key => {
          const value = data[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
      }
      
      console.log('updateProfile - sending FormData with keys:', Array.from(formData.keys()));
      const response = await apiClient.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('updateProfile - response:', response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      throw error;
    }
  },

  // Reset password
  resetPassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/profile/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Update signature
  updateSignature: async (signatureImageUrl) => {
    try {
      const response = await apiClient.put('/profile/signature', {
        signatureImageUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error updating signature:', error);
      throw error;
    }
  }
};

export default profileAPI;
