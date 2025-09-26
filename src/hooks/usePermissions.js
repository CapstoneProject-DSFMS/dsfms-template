import { useState, useEffect, useCallback } from 'react';
import { permissionAPI } from '../api/permission';

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
      title: permission.viewName || permission.name,
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
      const module = permission.module;
      if (!featureGroups[module]) {
        featureGroups[module] = {
          id: module,
          name: `${module} Management`,
          description: `Manage ${module.toLowerCase()} related permissions`,
          permissions: []
        };
      }
      
      featureGroups[module].permissions.push({
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
