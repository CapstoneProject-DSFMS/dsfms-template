import apiClient from './config.js';
import { getApiBaseUrl } from '../config/env.js';

// Upload API functions - FRESH VERSION 2025-01-17

export const uploadAPI = {
  // Upload document file - FRESH VERSION 2025-01-17
  uploadDocument: async (file, docsType) => {
    console.log('🔥 uploadDocument called - FRESH VERSION 2025-01-17');
    // Backend yêu cầu field name là 'files'
    const fieldNames = ['files'];
    
    // Thử từng field name
    for (const fieldName of fieldNames) {
      try {
        const formData = new FormData();
        formData.append(fieldName, file);
        
        console.log(`🧪 Testing field name: "${fieldName}"`);
        
        const response = await apiClient.post(`/media/docs/upload/${docsType}`, formData, {
          headers: {
            'Content-Type': undefined,
          },
        });
        
        console.log(`✅ Success with field name: "${fieldName}"`, response.data);
        
        // Log URL của file được upload
        if (response.data && response.data.data && response.data.data.length > 0 && response.data.data[0].url) {
          console.log(`📁 File uploaded successfully! URL: ${response.data.data[0].url}`);
        } else if (response.data && response.data.url) {
          console.log(`📁 File uploaded successfully! URL: ${response.data.url}`);
        } else if (response.data && response.data.fileUrl) {
          console.log(`📁 File uploaded successfully! URL: ${response.data.fileUrl}`);
        } else if (response.data && response.data.path) {
          console.log(`📁 File uploaded successfully! Path: ${response.data.path}`);
        } else {
          console.log(`📁 File uploaded successfully! Response:`, response.data);
        }
        
        return response.data;
        
      } catch (error) {
        console.log(`❌ Failed with field name: "${fieldName}"`, error.response?.data?.message);
        // Tiếp tục thử field name tiếp theo
      }
    }
    
    // Nếu fail
    throw new Error('Upload failed with field name "files". Please check backend logs.');
  },

  // Get docs type from filename (first 3 characters)
  getDocsType: (filename) => {
    return filename.substring(0, 3).toLowerCase();
  },

  // Build upload URL (for reference)
  buildUploadUrl: (docsType) => {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/media/docs/upload/${docsType}`;
  },

  // Upload document from URL
  uploadFromUrl: async (sourceUrl, fileName) => {
    try {
      console.log('📤 Uploading from URL:', sourceUrl);
      console.log('📝 File name:', fileName);
      
      const response = await apiClient.post('/media/docs/upload-from-url', {
        sourceUrl: sourceUrl,
        fileName: fileName
      });
      
      // Response format: { "data": [{ "id": "...", "url": "..." }] }
      if (response.data && response.data.data && response.data.data.length > 0) {
        const uploadedUrl = response.data.data[0].url;
        console.log('✅ File uploaded from URL successfully! New URL:', uploadedUrl);
        return uploadedUrl;
      } else {
        throw new Error('Invalid response format from upload-from-url API');
      }
    } catch (error) {
      console.error('❌ Error uploading from URL:', error);
      throw error;
    }
  },

  // Upload image file to S3
  uploadImage: async (file, imageType) => {
    try {
      const formData = new FormData();
      formData.append('files', file);
      
      const response = await apiClient.post(`/media/images/upload/${imageType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Handle different response formats
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data[0].url;
      } else if (response.data && response.data.url) {
        return response.data.url;
      } else if (response.data && response.data.fileUrl) {
        return response.data.fileUrl;
      } else if (response.data && response.data.path) {
        return response.data.path;
      } else {
        throw new Error('Invalid response format from upload image API');
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  }
};

export default uploadAPI;
