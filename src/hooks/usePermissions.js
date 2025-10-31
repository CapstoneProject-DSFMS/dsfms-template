import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { permissionAPI } from '../api/permission';

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
        console.log('✅ Using userPermissions from AuthContext:', userPermissions.length, 'permissions');
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

  // Create optimized permission lookup sets for better performance
  const userPermissionNames = useMemo(() => {
    if (!userPermissions || userPermissions.length === 0) return new Set();
    return new Set(userPermissions.map(p => p.name));
  }, [userPermissions]);

  const userPermissionPaths = useMemo(() => {
    if (!userPermissions || userPermissions.length === 0) return new Set();
    return new Set(userPermissions.map(p => p.path));
  }, [userPermissions]);

  const userPermissionIds = useMemo(() => {
    if (!userPermissions || userPermissions.length === 0) return new Set();
    return new Set(userPermissions.map(p => p.id));
  }, [userPermissions]);

  // Check if user has specific permission - optimized with Set lookup
  const hasPermission = useCallback((permissionName) => {
    if (!userPermissions || userPermissions.length === 0) {
      // console.log('🔍 hasPermission: No user permissions available'); // Commented out to reduce console noise
      return false;
    }
    
    // Check against name, path, or id using Set for O(1) lookup
    const hasName = userPermissionNames.has(permissionName);
    const hasPath = userPermissionPaths.has(permissionName);
    const hasId = userPermissionIds.has(permissionName);
    
    const result = hasName || hasPath || hasId;
    
    // Debug log for role update permission - Commented out to reduce console noise
    // if (permissionName === 'PUT /roles/:roleId' || permissionName.includes('roles')) {
    //   console.log('🔍 hasPermission check for role update:', {
    //     permissionName,
    //     hasName,
    //     hasPath,
    //     hasId,
    //     result,
    //     userPermissionNames: Array.from(userPermissionNames),
    //     userPermissionPaths: Array.from(userPermissionPaths),
    //     userPermissionIds: Array.from(userPermissionIds)
    //   });
    // }
    
    return result;
  }, [userPermissions, userPermissionNames, userPermissionPaths, userPermissionIds]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissionNames) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    return permissionNames.some(permissionName => 
      hasPermission(permissionName)
    );
  }, [userPermissions, hasPermission]);

  // Check if user has all specified permissions
  const hasAllPermissions = useCallback((permissionNames) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    return permissionNames.every(permissionName => 
      hasPermission(permissionName)
    );
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
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    getAccessibleModules,
    getUserPermissionGroups,
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
      console.log('🔍 All Permissions API Response:', response);
      
      if (response && response.data) {
        // Extract permissions from nested structure
        const permissions = [];
        response.data.forEach(module => {
          if (module.module && module.module.listPermissions) {
            module.module.listPermissions.forEach(permission => {
              permissions.push({
                id: permission.permissionId,
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
        console.log('✅ Fetched all permissions from API:', permissions.length, 'permissions');
      } else {
        setAllPermissions([]);
        console.log('⚠️ No permissions data in API response');
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
