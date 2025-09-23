import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth data on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
            setIsAuthenticated(true);
          } catch (error) {
            // Clear invalid data
            authAPI.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Handle localStorage access errors
        console.error('Error accessing localStorage:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        // Mark loading as complete
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto refresh token before expiry - DISABLED to prevent loops
  // useEffect(() => {
  //   if (!isAuthenticated) return;

  //   const refreshTokenInterval = setInterval(async () => {
  //     const refreshToken = localStorage.getItem('refreshToken');
  //     if (refreshToken) {
  //       try {
  //         const response = await authAPI.refreshToken(refreshToken);
  //         localStorage.setItem('authToken', response.access_token);
  //         localStorage.setItem('refreshToken', response.refresh_token);
  //       } catch (error) {
  //         // Refresh failed, logout user
  //         logout();
  //       }
  //     }
  //   }, 5 * 60 * 1000); // Refresh every 5 minutes

  //   return () => clearInterval(refreshTokenInterval);
  // }, [isAuthenticated]);

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login(credentials);
      
      // Store tokens
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      
      // Create basic user info from login response (if available) or use default
      const userInfo = {
        id: '1',
        email: credentials.email,
        fullName: 'User',
        role: 'ADMIN',
        department: 'IT',
        lastLogin: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      setUser(userInfo);
      setIsAuthenticated(true);
      
      return { success: true, user: userInfo };
    } catch (error) {
      return { success: false, error: error.message || error.response?.data?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    login,
    logout
  };

  // Ensure value is never undefined
  if (!value) {
    console.error('AuthContext value is undefined');
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};