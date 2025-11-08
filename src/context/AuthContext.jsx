import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import { roleAPI } from '../api/role';
import apiClient from '../api/config';
import { mapError } from '../utils/errorMapping';

// Create the context with default value
export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  userRole: null,
  userPermissions: [],
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  refreshToken: async () => ({ success: false }),
  fetchUserRoleAndPermissions: async () => ({ role: null, permissions: [] })
});

// Create the provider component
export const AuthProvider = ({ children }) => {
  // console.log('🔍 AuthProvider initializing...'); // Commented out to reduce console noise
  
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
              // console.log('🔄 Token expired on initialization, attempting refresh...'); // Commented out to reduce console noise
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
                
              } catch (refreshError) {
                // console.error('❌ Token refresh failed on initialization:', refreshError); // Commented out to reduce console noise
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
              
              // console.log('✅ Valid token found on initialization'); // Commented out to reduce console noise
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
        // console.log('❌ Missing token or refresh token, logging out'); // Commented out to reduce console noise
        logout();
        return;
      }

      try {
        // Check if token is expired by trying to decode it
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = tokenPayload.exp - currentTime;
        
        // console.log(`⏰ Token expires in ${Math.round(timeUntilExpiry / 60)} minutes`); // Commented out to reduce console noise
        
        // If token expires in less than 5 minutes, refresh it
        if (timeUntilExpiry < 300) {
          // console.log('🔄 Token expires soon, refreshing...'); // Commented out to reduce console noise
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
          // console.log('🔄 Token invalid, attempting refresh...'); // Commented out to reduce console noise
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
      // console.log('Fetching role details for:', { roleName, roleId }); // Commented out to reduce console noise
      
      // Try to get role details by ID first
      if (roleId) {
        try {
          const fullRoleData = await roleAPI.getRoleById(roleId);
          console.log('✅ Role data fetched:', {
            hasId: !!fullRoleData?.id,
            hasName: !!fullRoleData?.name,
            hasPermissions: !!fullRoleData?.permissions,
            permissionsCount: fullRoleData?.permissions?.length || 0
          });
          
          // Ensure permissions is an array
          const permissions = Array.isArray(fullRoleData?.permissions) 
            ? fullRoleData.permissions 
            : [];
          
          setUserRole(fullRoleData);
          setUserPermissions(permissions);
          return { role: fullRoleData, permissions };
        } catch (error) {
          console.error('Error fetching role by ID:', error);
          
          // If 403 Forbidden, user doesn't have permission to view role details
          if (error.response?.status === 403) {
            console.warn('User does not have permission to view role details, trying alternative approach');
            
            // Try to get user's own permissions from user profile API
            try {
              const userProfile = await apiClient.get('/users/me');
              // console.log('User profile with permissions:', userProfile.data); // Commented out to reduce console noise
              
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
        // console.log('Roles response:', rolesResponse); // Commented out to reduce console noise
        
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
        // console.log('Token payload:', tokenPayload); // Commented out to reduce console noise
        
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

        // TEMPORARY: Force DEPARTMENT_HEAD role for testing
        // Remove this after creating proper DEPARTMENT_HEAD user
        if (credentials.email === 'depthead@test.com') {
          userInfo.role = 'DEPARTMENT_HEAD';
          userInfo.roleId = 'dept-head-001';
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        throw new Error('Invalid token format or missing required fields');
      }
      
      // console.log('Login response:', response); // Commented out to reduce console noise
      // console.log('User info created:', userInfo); // Commented out to reduce console noise
      
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
      
      // console.log('Login successful:', { user: userInfo, role, permissions }); // Commented out to reduce console noise
      // console.log('🔍 User permissions for RBAC check:', permissions.map(p => ({
      //   id: p.id,
      //   name: p.name,
      //   path: p.path,
      //   method: p.method
      // }))); // Commented out to reduce console noise
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

  // console.log('🔍 AuthProvider rendering with value:', {
  //   user: !!user,
  //   userRole: !!userRole,
  //   userPermissions: userPermissions.length,
  //   isAuthenticated,
  //   isLoading
  // }); // Commented out to reduce console noise

  try {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error('❌ AuthProvider error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Authentication Error</h3>
        <p>There was an error initializing the authentication system.</p>
        <details>
          <summary>Error Details</summary>
          <pre>{error.message}</pre>
        </details>
      </div>
    );
  }
};