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

// Request interceptor to add auth token
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

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Skip retry for auth endpoints to avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Import authAPI dynamically to avoid circular dependency
          const { authAPI } = await import('./auth.js');
          const response = await authAPI.refreshToken(refreshToken);
          
          // Update tokens in localStorage
          localStorage.setItem('authToken', response.access_token);
          localStorage.setItem('refreshToken', response.refresh_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout user
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
