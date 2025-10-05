import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import { roleAPI } from '../api/role';
import apiClient from '../api/config';
import { mapError } from '../utils/errorMapping';

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
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
                
                // Fetch user role and permissions on initialization
                try {
                  const { role, permissions } = await fetchUserRoleAndPermissions(parsedUserData.role, parsedUserData.roleId);
                  if (role && permissions) {
                    setUserRole(role);
                    setUserPermissions(permissions);
                  } else {
                    throw new Error('Failed to fetch role and permissions');
                  }
                } catch (error) {
                  console.error('Failed to fetch role and permissions on initialization:', error);
                  // Clear auth data if role/permissions fetch fails
                  authAPI.logout();
                  setUser(null);
                  setUserRole(null);
                  setUserPermissions([]);
                  setIsAuthenticated(false);
                }
                
                console.log('✅ Token refreshed successfully on initialization');
              } catch (refreshError) {
                console.error('❌ Token refresh failed on initialization:', refreshError);
                authAPI.logout();
                setUser(null);
                setUserRole(null);
                setUserPermissions([]);
                setIsAuthenticated(false);
              }
            } else {
              // Token is still valid
              const parsedUserData = JSON.parse(userData);
              setUser(parsedUserData);
              setIsAuthenticated(true);
              
              // Fetch user role and permissions on initialization
              try {
                const { role, permissions } = await fetchUserRoleAndPermissions(parsedUserData.role, parsedUserData.roleId);
                if (role && permissions) {
                  setUserRole(role);
                  setUserPermissions(permissions);
                } else {
                  throw new Error('Failed to fetch role and permissions');
                }
              } catch (error) {
                console.error('Failed to fetch role and permissions on initialization:', error);
                // Clear auth data if role/permissions fetch fails
                authAPI.logout();
                setUser(null);
                setUserRole(null);
                setUserPermissions([]);
                setIsAuthenticated(false);
              }
              
              console.log('✅ Valid token found on initialization');
            }
          } catch (error) {
            console.error('❌ Error parsing token or user data:', error);
            authAPI.logout();
            setUser(null);
            setUserRole(null);
            setUserPermissions([]);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setUserRole(null);
          setUserPermissions([]);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Handle localStorage access errors
        console.error('Error accessing localStorage:', error);
        setUser(null);
        setUserRole(null);
        setUserPermissions([]);
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

  // Fetch user role and permissions using roleId from JWT
  const fetchUserRoleAndPermissions = async (roleName, roleId) => {
    try {
      console.log('Fetching role details for:', { roleName, roleId });
      
      // Try to get role details by ID first
      if (roleId) {
        try {
          const fullRoleData = await roleAPI.getRoleById(roleId);
          console.log('Full role data with permissions:', fullRoleData);
          
          setUserRole(fullRoleData);
          setUserPermissions(fullRoleData.permissions || []);
          return { role: fullRoleData, permissions: fullRoleData.permissions || [] };
        } catch (error) {
          console.error('Error fetching role by ID:', error);
          
          // If 403 Forbidden, user doesn't have permission to view role details
          if (error.response?.status === 403) {
            console.warn('User does not have permission to view role details, trying alternative approach');
            
            // Try to get user's own permissions from user profile API
            try {
              const userProfile = await apiClient.get('/users/me');
              console.log('User profile with permissions:', userProfile.data);
              
              if (userProfile.data && userProfile.data.role && userProfile.data.role.permissions) {
                const roleWithPermissions = {
                  id: roleId,
                  name: roleName,
                  description: `${roleName} role`,
                  isActive: 'ACTIVE',
                  permissions: userProfile.data.role.permissions
                };
                
                setUserRole(roleWithPermissions);
                setUserPermissions(roleWithPermissions.permissions);
                return { role: roleWithPermissions, permissions: roleWithPermissions.permissions };
              }
            } catch (profileError) {
              console.error('Failed to get user profile:', profileError);
            }
            
            // Last resort: create minimal role without permissions
            console.warn('Cannot fetch permissions, creating minimal role');
            const minimalRole = {
              id: roleId,
              name: roleName,
              description: `${roleName} role`,
              isActive: 'ACTIVE',
              permissions: []
            };
            
            setUserRole(minimalRole);
            setUserPermissions([]);
            return { role: minimalRole, permissions: [] };
          }
          
          throw new Error(`Failed to fetch role details. Please contact administrator.`);
        }
      }
      
      // Fallback: try to get all roles (only if user has permission)
      try {
        const rolesResponse = await roleAPI.getRoles();
        console.log('Roles response:', rolesResponse);
        
        const rolesData = rolesResponse.data || rolesResponse;
        let rolesArray;
        if (rolesData && rolesData.roles && Array.isArray(rolesData.roles)) {
          rolesArray = rolesData.roles;
        } else if (Array.isArray(rolesData)) {
          rolesArray = rolesData;
        } else {
          throw new Error('Invalid roles data structure');
        }
        
        const userRoleData = rolesArray.find(role => role.name === roleName);
        if (userRoleData) {
          const fullRoleData = await roleAPI.getRoleById(userRoleData.id);
          setUserRole(fullRoleData);
          setUserPermissions(fullRoleData.permissions || []);
          return { role: fullRoleData, permissions: fullRoleData.permissions || [] };
        }
        
        throw new Error(`Role '${roleName}' not found`);
      } catch (fallbackError) {
        console.error('Fallback method failed:', fallbackError);
        throw new Error(`Role '${roleName}' not found. Please contact administrator.`);
      }
    } catch (error) {
      console.error('Error fetching user role and permissions:', error);
      return { role: null, permissions: [] };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login(credentials);
      
      // Store tokens from login response
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      
      // Decode JWT token to get user info
      let userInfo;
      try {
        const tokenPayload = JSON.parse(atob(response.access_token.split('.')[1]));
        console.log('Token payload:', tokenPayload);
        
        // Validate required fields from JWT token
        if (!tokenPayload.userId || !tokenPayload.roleName) {
          throw new Error('Invalid token: missing required fields (userId, roleName)');
        }
        
        userInfo = {
          id: tokenPayload.userId,
          email: credentials.email,
          fullName: tokenPayload.fullName || tokenPayload.name || 'User',
          role: tokenPayload.roleName, // Use roleName from JWT token
          roleId: tokenPayload.roleId, // Store roleId for direct API call
          department: tokenPayload.department || 'IT',
          lastLogin: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error decoding token:', error);
        throw new Error('Invalid token format or missing required fields');
      }
      
      console.log('Login response:', response);
      console.log('User info created:', userInfo);
      
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      // Fetch user role and permissions using roleId
      const { role, permissions } = await fetchUserRoleAndPermissions(userInfo.role, userInfo.roleId);
      
      if (!role || !permissions) {
        throw new Error('Failed to fetch user role and permissions');
      }
      
      setUser(userInfo);
      setUserRole(role);
      setUserPermissions(permissions);
      setIsAuthenticated(true);
      
      console.log('Login successful:', { user: userInfo, role, permissions });
      return { success: true, user: userInfo, role, permissions };
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
    setUserRole(null);
    setUserPermissions([]);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    setUser,
    userRole,
    userPermissions,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    fetchUserRoleAndPermissions
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