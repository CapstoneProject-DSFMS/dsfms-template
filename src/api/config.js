import axios from 'axios';
import { API_CONFIG } from '../config/api.js';

// Base configuration for API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh token calls
let isRefreshing = false;
let failedQueue = [];

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

// Request interceptor - tự động gắn access_token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    
    // Xử lý cả 401 Unauthorized và 403 Forbidden (token hết hạn hoặc không hợp lệ)
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      
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

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          console.log('🔄 Token hết hạn hoặc không hợp lệ (401/403), đang refresh token...');
          
          // Gọi API refresh token
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;
          
          // Cập nhật tokens mới vào localStorage
          localStorage.setItem('authToken', access_token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          console.log('✅ Refresh token thành công, retry request gốc');
          
          // Process queue và retry request gốc
          processQueue(null, access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          console.error('❌ Refresh token thất bại:', refreshError);
          
          // Refresh thất bại - clear storage và logout
          processQueue(refreshError, null);
          
          // Clear tất cả auth data
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect về login
          window.location.href = '/';
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Không có refresh token - logout user
        console.log('❌ Không có refresh token, logout user');
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
