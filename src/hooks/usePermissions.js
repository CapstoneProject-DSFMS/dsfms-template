import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { permissionAPI } from '../api/permission';
import { getPermissionsForUC, getUCsForPermission } from '../constants/ucPermissionsMapping';

// Helper function to format API endpoint names to be more user-friendly
const formatPermissionName = (name) => {
  if (!name) return '';
  
  // Remove HTTP method and path, keep only the meaningful part
  const parts = name.split(' ');
  if (parts.length >= 2) {
    const method = parts[0];
    const path = parts[1];
    
    // Extract resource from path
    const pathParts = path.split('/').filter(part => part && !part.startsWith(':'));
    const resource = pathParts[0] || 'Resource';
    
    // Map HTTP methods to actions
    const actionMap = {
      'GET': 'View',
      'POST': 'Create',
      'PUT': 'Update',
      'PATCH': 'Update',
      'DELETE': 'Delete'
    };
    
    const action = actionMap[method] || method;
    
    // Handle specific cases to make them more descriptive
    if (path.includes('forgot-password')) {
      return 'Forgot Password';
    }
    if (path.includes('reset-password')) {
      return 'Reset Password';
    }
    if (path.includes('enable')) {
      return `Enable ${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
    }
    if (path.includes('archive')) {
      return `Archive ${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
    }
    if (path.includes('restore')) {
      return `Restore ${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
    }
    if (path.includes('add-trainers')) {
      return 'Add Trainers to Department';
    }
    if (path.includes('remove-trainers')) {
      return 'Remove Trainers from Department';
    }
    // Add new specific cases here as needed
    if (path.includes('new-feature')) {
      return 'Create New Feature';
    }
    if (path.includes('bulk-import')) {
      return 'Bulk Import Data';
    }
    if (path.includes('export-report')) {
      return 'Export Report';
    }
    
    // Smart fallback for undefined cases
    return createSmartFallback(action, resource, path);
  }
  
  return name;
};

// Helper function to create smart fallback names
const createSmartFallback = (action, resource, path) => {
  // Handle common patterns
  if (path.includes('-')) {
    const pathParts = path.split('/').filter(part => part && !part.startsWith(':'));
    const lastPart = pathParts[pathParts.length - 1];
    
    // Convert kebab-case to Title Case
    const titleCase = lastPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return `${action} ${titleCase}`;
  }
  
  // Default fallback
  return `${action} ${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
};

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userPermissions, userRole } = useAuth();

  // Always use userPermissions from AuthContext (fetched via role detail API)
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // All roles use userPermissions from AuthContext (fetched via role detail API)
      if (userPermissions && userPermissions.length > 0) {
        setPermissions(userPermissions);
      } else {
        setPermissions([]);
        console.log('⚠️ No userPermissions available');
      }
    } catch (err) {
      console.error('Error setting permissions:', err);
      setError(err);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [userPermissions]);

  const getUIPermissions = useCallback(() => {
    return permissions.map(permission => ({
      id: permission.id,
      title: permission.viewName || permission.description || formatPermissionName(permission.name),
      description: permission.description || '',
      module: permission.module,
      method: permission.method,
      path: permission.path,
      isActive: permission.isActive,
      viewName: permission.viewName,
      viewModule: permission.viewModule
    }));
  }, [permissions]);

  // Get permission groups for UI display (group by module)
  const getPermissionGroups = useCallback(() => {
    const uiPermissions = getUIPermissions();
    const featureGroups = {};

    // Group permissions by module
    uiPermissions.forEach(permission => {
      const moduleId = permission.module;
      const moduleName = permission.viewModule || `${permission.module} Management`;
      
      if (!featureGroups[moduleId]) {
        featureGroups[moduleId] = {
          id: moduleId,
          name: moduleName,
          description: `Manage ${moduleName.toLowerCase()} related permissions`,
          permissions: []
        };
      }
      
      featureGroups[moduleId].permissions.push({
        id: permission.id,
        title: permission.title,
        description: permission.description,
        isActive: permission.isActive,
        method: permission.method,
        path: permission.path
      });
    });

    // Sort groups by module name
    return Object.values(featureGroups).sort((a, b) => a.name.localeCompare(b.name));
  }, [getUIPermissions]);

  // Check if permission is active in API
  const isPermissionActive = useCallback((permissionId) => {
    const apiPermission = permissions.find(p => p.id === permissionId);
    return apiPermission ? apiPermission.isActive === 'ACTIVE' : true;
  }, [permissions]);

  // Get API permission by ID
  const getApiPermission = useCallback((permissionId) => {
    return permissions.find(p => p.id === permissionId);
  }, [permissions]);

  // Optimized lookup set of PERM-XX codes
  const userPermissionCodes = useMemo(() => {
    if (!userPermissions || userPermissions.length === 0) return new Set();
    return new Set(
      userPermissions
        .map(permission => permission.code)
        .filter(Boolean)
    );
  }, [userPermissions]);

  // Check if user has specific permission code (PERM-XX)
  const hasPermission = useCallback((permissionCode) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    if (!permissionCode || typeof permissionCode !== 'string') {
      return false;
    }
    
    return userPermissionCodes.has(permissionCode);
  }, [userPermissions, userPermissionCodes]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissionCodes) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
      return false;
    }
    
    return permissionCodes.some(hasPermission);
  }, [userPermissions, hasPermission]);

  // Check if user has all specified permissions
  const hasAllPermissions = useCallback((permissionCodes) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
      return false;
    }
    
    return permissionCodes.every(hasPermission);
  }, [userPermissions, hasPermission]);

  // Check if user has access to a specific module
  const hasModuleAccess = useCallback((moduleName) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    return userPermissions.some(permission => 
      permission.module === moduleName
    );
  }, [userPermissions]);

  // Get accessible modules for user
  const getAccessibleModules = useCallback(() => {
    if (!userPermissions || userPermissions.length === 0) {
      return [];
    }
    
    const modules = [...new Set(userPermissions.map(p => p.module))];
    return modules;
  }, [userPermissions]);

  // Get user's permissions grouped by module
  const getUserPermissionGroups = useCallback(() => {
    if (!userPermissions || userPermissions.length === 0) {
      return [];
    }
    
    const uiPermissions = userPermissions.map(permission => ({
      id: permission.id,
      title: permission.viewName || permission.description || formatPermissionName(permission.name),
      description: permission.description || '',
      module: permission.module,
      method: permission.method,
      path: permission.path,
      isActive: permission.isActive,
      viewName: permission.viewName,
      viewModule: permission.viewModule
    }));

    const featureGroups = {};
    uiPermissions.forEach(permission => {
      const moduleId = permission.module;
      const moduleName = permission.viewModule || `${permission.module} Management`;
      
      if (!featureGroups[moduleId]) {
        featureGroups[moduleId] = {
          id: moduleId,
          name: moduleName,
          description: `Manage ${moduleName.toLowerCase()} related permissions`,
          permissions: []
        };
      }
      
      featureGroups[moduleId].permissions.push({
        id: permission.id,
        title: permission.title,
        description: permission.description,
        isActive: permission.isActive,
        method: permission.method,
        path: permission.path
      });
    });

    return Object.values(featureGroups).sort((a, b) => a.name.localeCompare(b.name));
  }, [userPermissions]);

  // Initialize permissions on mount
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Check if user has permission for a specific UC
  const hasUCPermission = useCallback((ucId) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    const requiredPermissions = getPermissionsForUC(ucId);
    if (requiredPermissions.length === 0) {
      return true; // UC doesn't require permissions (e.g., Login, Logout)
    }
    
    // Check if user has any of the required permissions for this UC
    return hasAnyPermission(requiredPermissions);
  }, [userPermissions, hasAnyPermission]);

  // Get permissions for a specific UC
  const getUCPermissions = useCallback((ucId) => {
    return getPermissionsForUC(ucId);
  }, []);

  // Get UC IDs for a specific permission
  const getPermissionUCs = useCallback((permissionName) => {
    return getUCsForPermission(permissionName);
  }, []);

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    getUIPermissions,
    getPermissionGroups,
    isPermissionActive,
    getApiPermission,
    // User permission checking functions
    hasPermission,           // PERM-XX code only
    hasAnyPermission,        // PERM-XX code only
    hasAllPermissions,       // PERM-XX code only
    hasModuleAccess,
    getAccessibleModules,
    getUserPermissionGroups,
    // UC-based permission checking (NEW)
    hasUCPermission,
    getUCPermissions,
    getPermissionUCs,
    // User data
    userPermissions,
    userRole
  };
};

// Hook specifically for getting ALL permissions in the system
// Used in Role Management to view/assign permissions
export const useAllPermissions = () => {
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call API to get all permissions in the system
      const response = await permissionAPI.getPermissions({ includeDeleted: true });
      
      // permissionAPI.getPermissions() already returns response.data
      // API response structure:
      // {
      //   message: "Permissions fetched successfully",
      //   data: {
      //     modules: [{module: {...}}],  // ← Array nằm trong data.modules
      //     totalItems: 89
      //   }
      // }
      
      let dataToProcess = null;
      
      // Check if response.data.modules exists (most common case from API)
      if (response && response.data && response.data.modules && Array.isArray(response.data.modules)) {
        dataToProcess = response.data.modules;
      }
      // Check if response is an array directly
      else if (Array.isArray(response)) {
        dataToProcess = response;
      } 
      // Check if response.data is an array
      else if (response && response.data && Array.isArray(response.data)) {
        dataToProcess = response.data;
      }
      // Check if response is an object with array-like structure
      else if (response && typeof response === 'object') {
        // Try to find array property (modules, data, etc.)
        const possibleKeys = Object.keys(response);
        const arrayKey = possibleKeys.find(key => Array.isArray(response[key]));
        if (arrayKey) {
          dataToProcess = response[arrayKey];
        }
      }
      
      if (dataToProcess && Array.isArray(dataToProcess)) {
        // Extract permissions from nested structure
        const permissions = [];
        dataToProcess.forEach(module => {
          if (module.module && module.module.listPermissions) {
            module.module.listPermissions.forEach((permission) => {
              // Extract permission ID - API returns 'id' field (see Postman response)
              const permissionId = permission.id || permission.permissionId;
              
              permissions.push({
                id: permissionId, // Use permissionId from API
                name: permission.name,
                module: module.module.name,
                viewName: permission.name,
                viewModule: module.module.name,
                isActive: true // Assume active if not specified
              });
            });
          }
        });
        
        setAllPermissions(permissions);
      } else {
        setAllPermissions([]);
      }
    } catch (err) {
      console.error('Error fetching all permissions from API:', err);
      setError(err);
      setAllPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    allPermissions,
    loading,
    error,
    fetchAllPermissions
  };
};
