import apiClient from './config.js';

// Upload API functions - FRESH VERSION 2025-01-17
console.log('🚀 Loading uploadAPI - FRESH VERSION 2025-01-17');

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
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://dsfms.id.vn';
    return `${baseUrl}/media/docs/upload/${docsType}`;
  }
};

export default uploadAPI;
