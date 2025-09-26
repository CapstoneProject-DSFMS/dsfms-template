import apiClient from './config.js';
import axios from 'axios';
import { API_CONFIG } from '../config/api.js';

// Create a separate axios instance for auth calls to avoid interceptor loops
const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API endpoints
export const authAPI = {
  // Login user - use authClient to avoid interceptor issues
  login: async (credentials) => {
    try {
      const response = await authClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refresh token - use separate client to avoid interceptor loops
  refreshToken: async (refreshToken) => {
    try {
      const response = await authClient.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check auth status
  checkStatus: async () => {
    try {
      const response = await apiClient.get('/auth/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Forgot password - send reset link
  forgotPassword: async (email, magicLink) => {
    try {
      const response = await authClient.post('/auth/forgot-password', {
        email,
        magicLink
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reset password with token
  resetPasswordWithToken: async (token, newPassword, confirmPassword) => {
    try {
      const response = await authClient.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};
