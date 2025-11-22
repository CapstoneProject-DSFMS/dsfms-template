import axios from 'axios';
import { API_CONFIG } from '../config/api.js';
import { redirectToLogin } from '../utils/navigation.js';

// Base configuration for API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dsfms.id.vn';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create public API client (no authentication required)
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh token calls
let isRefreshing = false;
let failedQueue = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If can't decode, consider expired
  }
};

// Helper function to check if token expires soon (within 5 minutes)
const isTokenExpiringSoon = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    return timeUntilExpiry < 300; // 5 minutes
  } catch (error) {
    return true; // If can't decode, consider expiring soon
  }
};

// Process failed requests queue
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - tự động gắn access_token vào header và kiểm tra expiry
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        console.log('⚠️ Token is expired, will trigger refresh in response interceptor');
      } else if (isTokenExpiringSoon(token)) {
        console.log('⚠️ Token expires soon, consider refreshing');
      }
      
      config.headers.Authorization = `Bearer ${token}`;
      
      // Debug log for role update requests
      if (config.url?.includes('/roles/') && config.method === 'put') {
        console.log('🔍 Role update request:', {
          url: config.url,
          method: config.method,
          data: config.data,
          headers: {
            Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'No token'
          }
        });
      }
      
      // Debug log for assign-trainees requests
      if (config.url?.includes('/assign-trainees') && config.method === 'post') {
        console.log('🔍 Assign Trainees Request (Interceptor):', {
          url: config.url,
          method: config.method,
          data: config.data,
          dataType: typeof config.data,
          dataIsArray: Array.isArray(config.data),
          dataStringified: JSON.stringify(config.data),
          headers: {
            'Content-Type': config.headers['Content-Type'],
            Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'No token'
          }
        });
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý 401 và refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    // Chỉ xử lý 401 Unauthorized (token hết hạn), KHÔNG xử lý 403 Forbidden (thiếu quyền)
    if (status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/') &&
        refreshAttempts < MAX_REFRESH_ATTEMPTS) {
      
      console.log('🔄 API call failed with 401 (token expired), attempting token refresh...');
      
      // Nếu đang refresh token, thêm request vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          console.log('🔄 Token hết hạn (401), đang refresh token...');
          
          // Validate refresh token before using it
          if (isTokenExpired(refreshToken)) {
            throw new Error('Refresh token is also expired');
          }
          
          // Gọi API refresh token
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;
          
          // Validate new tokens
          if (!access_token || !newRefreshToken) {
            throw new Error('Invalid token response from server');
          }
          
          // Cập nhật tokens mới vào localStorage
          localStorage.setItem('authToken', access_token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Reset refresh attempts khi thành công
          refreshAttempts = 0;
          
          console.log('✅ Refresh token thành công, retry request gốc');
          
          // Process queue và retry request gốc
          processQueue(null, access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          return await apiClient(originalRequest);
          
        } catch (refreshError) {
          console.error('❌ Refresh token thất bại:', refreshError);
          
          // Refresh thất bại - clear storage và logout
          processQueue(refreshError, null);
          
          // Clear tất cả auth data
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect về login
          redirectToLogin();
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Không có refresh token - logout user
        console.log('❌ Không có refresh token, logout user');
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        redirectToLogin();
      }
    } else if (status === 403) {
      // 403 Forbidden - thiếu quyền thực sự, KHÔNG logout user
      console.log('🚫 API call failed with 403 (insufficient permissions) - user remains logged in');
      // Chỉ throw error để UI xử lý, không logout
      return Promise.reject(error);
    } else if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      // Đã vượt quá số lần refresh cho phép - logout user
      console.error('❌ Đã vượt quá số lần refresh cho phép, logout user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      redirectToLogin();
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
export { publicApiClient };
