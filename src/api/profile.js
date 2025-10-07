import apiClient from './config.js';

const profileAPI = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update avatar (sends avatar string to PUT /profile)
  updateAvatar: async (avatarString, currentProfileData) => {
    try {
      // Get current profile data first
      const currentProfile = currentProfileData || await profileAPI.getProfile();
      
      // Update only the avatar field while keeping other data
      const updateData = {
        ...currentProfile,
        avatarUrl: avatarString // Backend expects 'avatarUrl' not 'avatar'
      };
      
      // Ensure required string fields are not null/undefined
      if (!updateData.address) updateData.address = '';
      if (!updateData.phoneNumber) updateData.phoneNumber = '';
      if (!updateData.avatarUrl) updateData.avatarUrl = '';
      if (!updateData.firstName) updateData.firstName = '';
      if (!updateData.lastName) updateData.lastName = '';
      if (!updateData.middleName) updateData.middleName = '';
      
      // Remove any undefined or null values that might cause validation issues
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key];
        }
      });
      
      const response = await apiClient.put('/profile', updateData);
      return response.data; // Expect updated profile
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      console.log('updateProfile - sending data:', profileData);
      const response = await apiClient.put('/profile', profileData);
      console.log('updateProfile - response:', response.data);
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
  }
};

export default profileAPI;
