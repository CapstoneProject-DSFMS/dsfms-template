import { useState, useEffect, useCallback } from 'react';
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

  // Fetch permissions from API
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await permissionAPI.getPermissions();
      setPermissions(response.data || []);
    } catch (err) {
      setError(err);
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all permissions from API (74 permissions)
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
    getApiPermission
  };
};
