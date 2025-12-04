import apiClient from './config.js';

const profileAPI = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile');
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update avatar
  updateAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const formData = new FormData();
      
      if (data instanceof File) {
        // If data is a file, treat it as avatar
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
      const response = await apiClient.put('/profile/reset-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Update signature
  updateSignature: async (signatureDataUrl) => {
    try {
      // Convert data URL to blob
      const response = await fetch(signatureDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      
      const formData = new FormData();
      formData.append('signature', file);
      
      const apiResponse = await apiClient.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (apiResponse.data && apiResponse.data.data) {
        return apiResponse.data.data;
      }
      return apiResponse.data;
    } catch (error) {
      console.error('Error updating signature:', error);
      throw error;
    }
  }
};

export default profileAPI;

