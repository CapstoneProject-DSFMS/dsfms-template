import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import { mapError } from '../utils/errorMapping';

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth data on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        const refreshTokenValue = localStorage.getItem('refreshToken');
        
        if (token && userData && refreshTokenValue) {
          try {
            // Check if token is expired
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (tokenPayload.exp < currentTime) {
              console.log('🔄 Token expired on initialization, attempting refresh...');
              // Token expired, try to refresh
              try {
                const response = await authAPI.refreshToken(refreshTokenValue);
                localStorage.setItem('authToken', response.access_token);
                localStorage.setItem('refreshToken', response.refresh_token);
                
                const parsedUserData = JSON.parse(userData);
                setUser(parsedUserData);
                setIsAuthenticated(true);
                console.log('✅ Token refreshed successfully on initialization');
              } catch (refreshError) {
                console.error('❌ Token refresh failed on initialization:', refreshError);
                authAPI.logout();
                setUser(null);
                setIsAuthenticated(false);
              }
            } else {
              // Token is still valid
              const parsedUserData = JSON.parse(userData);
              setUser(parsedUserData);
              setIsAuthenticated(true);
              console.log('✅ Valid token found on initialization');
            }
          } catch (error) {
            console.error('❌ Error parsing token or user data:', error);
            authAPI.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('❌ No valid auth data found');
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

    // Initialize immediately without delay to prevent race condition
    initializeAuth();
  }, []);

  // Token validation on mount and periodic check
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      const refreshTokenValue = localStorage.getItem('refreshToken');
      
      if (!token || !refreshTokenValue) {
        console.log('❌ Missing token or refresh token, logging out');
        logout();
        return;
      }

      try {
        // Check if token is expired by trying to decode it
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = tokenPayload.exp - currentTime;
        
        console.log(`⏰ Token expires in ${Math.round(timeUntilExpiry / 60)} minutes`);
        
        // If token expires in less than 5 minutes, refresh it
        if (timeUntilExpiry < 300) {
          console.log('🔄 Token expires soon, refreshing...');
          const refreshResult = await refreshToken();
          if (!refreshResult.success) {
            console.error('❌ Token refresh failed in validation');
            logout();
          }
        }
      } catch (error) {
        console.error('❌ Token validation failed:', error);
        // Token is invalid, try to refresh
        try {
          console.log('🔄 Token invalid, attempting refresh...');
          const refreshResult = await refreshToken();
          if (!refreshResult.success) {
            console.error('❌ Token refresh failed after validation error');
            logout();
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          logout();
        }
      }
    };

    // Add a small delay before starting validation to ensure initialization is complete
    const validationTimer = setTimeout(() => {
      validateToken();
      
      // Check token every 2 minutes
      const tokenCheckInterval = setInterval(validateToken, 2 * 60 * 1000);
      
      // Store interval ID for cleanup
      return () => clearInterval(tokenCheckInterval);
    }, 500);

    return () => clearTimeout(validationTimer);
  }, [isAuthenticated, isLoading]);

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login(credentials);
      
      // Store tokens from login response
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
      return { success: false, error: mapError(error) || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Manual refresh token function
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const response = await authAPI.refreshToken(refreshTokenValue);
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      
      return { success: true, tokens: response };
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      logout();
      return { success: false, error: error.message };
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
    logout,
    refreshToken
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