import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { permissionAPI } from '../api/permission';
import { matchPermissionName, normalizePermissionName } from '../utils/permissionNormalizer';
import { getPermissionsForUC, getUCsForPermission } from '../constants/ucPermissionsMapping';
import { mapBEPermissionToNavigation, mapNavigationToBEPermission } from '../utils/permissionNameMapper';
import { isUUID } from '../constants/permissionIds';

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

  // Check if user has specific permission by ID (fastest and most accurate)
  const hasPermissionById = useCallback((permissionId) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    if (!permissionId || typeof permissionId !== 'string') {
      return false;
    }
    
    // Direct ID lookup: O(1) complexity
    return userPermissionIds.has(permissionId);
  }, [userPermissionIds]);

  // Check if user has specific permission - hybrid approach
  // Supports both ID (UUID) and name (string) for backward compatibility
  // Priority: ID check (if UUID) > Name check (with mapping)
  const hasPermission = useCallback((permissionIdOrName) => {
    if (!userPermissions || userPermissions.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 hasPermission("${permissionIdOrName}"): NO USER PERMISSIONS`);
      }
      return false;
    }
    
    if (!permissionIdOrName || typeof permissionIdOrName !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 hasPermission("${permissionIdOrName}"): INVALID PERMISSION ID/NAME`);
      }
      return false;
    }
    
    // PRIORITY 1: Check by ID if input is UUID (fastest and most accurate)
    if (isUUID(permissionIdOrName)) {
      const hasAccess = userPermissionIds.has(permissionIdOrName);
      // Reduced logging: only log in development and for specific debug scenarios
      // Comment out to reduce console noise in production
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`✅ hasPermission("${permissionIdOrName}"): ID CHECK - ${hasAccess ? 'MATCH' : 'NO MATCH'}`);
      // }
      return hasAccess;
    }
    
    // PRIORITY 2: Check by name (backward compatibility)
    const permissionName = permissionIdOrName;
    
    // Get all permission names from user permissions (BE format)
    // User permissions from role API can have format: { name: "GET /users" } or { name: "View All Users" }
    // We need to handle both formats and map them to navigation permission names
    const userPermissionNameList = userPermissions
      .map(p => {
        // Priority: viewName > name > (method + path)
        let permName = null;
        if (p.viewName) {
          permName = p.viewName;
        } else if (p.name) {
          permName = p.name;
        } else if (p.method && p.path) {
          permName = `${p.method} ${p.path}`;
        }
        
        // If permission is in BE format (METHOD /path), map it to navigation format
        if (permName && /^(GET|POST|PUT|PATCH|DELETE)\s+\//.test(permName)) {
          const mapped = mapBEPermissionToNavigation(permName);
          // Return both formats for matching
          return mapped || permName;
        }
        
        return permName;
      })
      .filter(Boolean);
    
    // Also create a list with all possible formats for matching
    // IMPORTANT: Only add the actual permission names from user, NOT mapped versions
    // Mapping should only happen when checking, not when building the list
    const allPossibleNames = new Set();
    userPermissions.forEach(p => {
      // Add original name (this is the actual permission name from BE)
      if (p.name) allPossibleNames.add(p.name);
      if (p.viewName) allPossibleNames.add(p.viewName);
      if (p.method && p.path) {
        const methodPath = `${p.method} ${p.path}`;
        allPossibleNames.add(methodPath);
      }
      // DO NOT add mapped versions here - mapping should be done during check, not during list building
    });
    
    if (process.env.NODE_ENV === 'development') {
      // Log full permission structure for debugging (only first check to avoid spam)
      if (!window._permissionDebugLogged) {
        window._permissionDebugLogged = true;
        console.log(`🔍 hasPermission("${permissionName}"):`, {
          userPermissionCount: userPermissions.length,
          userPermissionNames: Array.from(allPossibleNames).slice(0, 15), // Show first 15
          checking: permissionName,
          // Show full permission structure for first 3 permissions
          samplePermissions: userPermissions.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            viewName: p.viewName,
            method: p.method,
            path: p.path,
            module: p.module,
            description: p.description
          }))
        });
      }
    }
    
    // First, try exact match (case-insensitive) with all possible names
    // This checks if permissionName exactly matches any user permission
    const exactMatch = Array.from(allPossibleNames).some(permName => {
      return permName && normalizePermissionName(permName) === normalizePermissionName(permissionName);
    });
    if (exactMatch) {
      // Reduced logging: only log in development and for specific debug scenarios
      // Comment out to reduce console noise in production
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`✅ hasPermission("${permissionName}"): EXACT MATCH`);
      // }
      return true;
    }
    
    // If permissionName is in navigation format (e.g., "View All Templates"),
    // check if user has the corresponding BE format permission (e.g., "GET /templates")
    // BUT: Only if the BE permission actually maps to this navigation permission
    // This is a reverse mapping: navigation -> BE format
    const bePermissionNames = mapNavigationToBEPermission(permissionName);
    if (bePermissionNames.length > 0) {
      const beMatch = bePermissionNames.some(beName => {
        // Check if user has this BE permission
        const hasBEPerm = Array.from(allPossibleNames).some(userPerm => {
          return normalizePermissionName(userPerm) === normalizePermissionName(beName);
        });
        
        if (hasBEPerm) {
          // Double-check: verify that this BE permission actually maps to the requested permission
          const mappedBack = mapBEPermissionToNavigation(beName);
          if (mappedBack === permissionName) {
            return true; // Confirmed: user has BE permission that maps to requested permission
          }
        }
        return false;
      });
      if (beMatch) {
        // Reduced logging: only log in development and for specific debug scenarios
        // Comment out to reduce console noise in production
        // if (process.env.NODE_ENV === 'development') {
        //   console.log(`✅ hasPermission("${permissionName}"): MATCHED VIA BE MAPPING`);
        // }
        return true;
      }
    }
    
    // Also check: if user has BE format permission (e.g., "GET /templates"),
    // and we're checking for navigation format (e.g., "View All Templates"),
    // map the user's BE permission and check if it matches
    const userBEPermissions = Array.from(allPossibleNames).filter(name => 
      name && /^(GET|POST|PUT|PATCH|DELETE)\s+\//.test(name)
    );
    for (const bePerm of userBEPermissions) {
      const mapped = mapBEPermissionToNavigation(bePerm);
      if (mapped && normalizePermissionName(mapped) === normalizePermissionName(permissionName)) {
        // Reduced logging: only log in development and for specific debug scenarios
        // Comment out to reduce console noise in production
        // if (process.env.NODE_ENV === 'development') {
        //   console.log(`✅ hasPermission("${permissionName}"): MATCHED VIA BE->NAV MAPPING (${bePerm} -> ${mapped})`);
        // }
        return true;
      }
    }
    
    // Then try to match using permission normalizer (handles BE permission names)
    const matchedPermission = matchPermissionName(permissionName, Array.from(allPossibleNames));
    if (matchedPermission) {
      // Reduced logging: only log in development and for specific debug scenarios
      // Comment out to reduce console noise in production
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`✅ hasPermission("${permissionName}"): MATCHED WITH "${matchedPermission}"`);
      // }
      return true;
    }
    
    // Parse permissionName if it's in format "METHOD /path" (backward compatibility)
    const parsePermission = (perm) => {
      // Handle null/undefined permissions
      if (!perm || typeof perm !== 'string') {
        return { method: null, path: '' };
      }
      const parts = perm.trim().split(/\s+/);
      if (parts.length >= 2) {
        const method = parts[0]; // GET, POST, PUT, PATCH, DELETE
        const path = parts.slice(1).join(' '); // /courses/:id
        return { method, path };
      }
      return { method: null, path: perm };
    };
    
    const parsed = parsePermission(permissionName);
    
    // Check direct matches first (name, path, id) - for backward compatibility
    const hasName = userPermissionNames.has(permissionName);
    const hasPath = userPermissionPaths.has(permissionName);
    const hasId = userPermissionIds.has(permissionName);
    
    if (hasName || hasPath || hasId) {
      return true;
    }
    
    // If permissionName is in format "METHOD /path", check against user permissions
    // by matching method + path separately (backward compatibility)
    if (parsed.method && parsed.path) {
      const matched = userPermissions.some(perm => {
        // Check if method matches
        const methodMatch = perm.method && perm.method.toUpperCase() === parsed.method.toUpperCase();
        
        // Check if path matches (handle :id vs :courseId variations)
        let pathMatch = false;
        if (perm.path) {
          // Direct path match
          if (perm.path === parsed.path) {
            pathMatch = true;
          } else {
            // Normalize paths for comparison (replace :id, :courseId, :departmentId, etc. with :param)
            const normalizePath = (p) => p.replace(/:\w+/g, ':param');
            if (normalizePath(perm.path) === normalizePath(parsed.path)) {
              pathMatch = true;
            }
            // Also check if parsed path matches permission name format (for backward compatibility)
            else if (perm.name && perm.name.includes(parsed.path.replace('/', ''))) {
              pathMatch = true;
            }
          }
        }
        
        return methodMatch && pathMatch;
      });
      
      if (matched) {
        return true;
      }
    }
    
    // Fallback: Check if permissionName matches any part of permission name or description
    // This handles cases where backend returns descriptive names like "View Course Detail"
    // BUT: Only use this for backward compatibility with old format, not for BE permission names
    // For BE permission names, we should have matched already above
    const normalizedPermissionName = normalizePermissionName(permissionName);
    const matchedByName = userPermissions.some(perm => {
      if (!perm.name) return false;
      const normalizedPermName = normalizePermissionName(perm.name);
      
      // For BE permission names (like "View All Users"), use exact or close match only
      // Don't use fuzzy matching that's too broad
      if (normalizedPermissionName === normalizedPermName) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ hasPermission("${permissionName}"): FALLBACK EXACT MATCH`);
        }
        return true;
      }
      
      // Only use keyword matching for old format (METHOD /path), not for BE names
      // Check if permissionName looks like old format (starts with GET/POST/etc)
      const looksLikeOldFormat = /^(GET|POST|PUT|PATCH|DELETE)\s+\//.test(permissionName);
      
      if (looksLikeOldFormat) {
        // Old format: use keyword matching
        const keyWords = normalizedPermissionName
          .split(/[\s/:]+/)
          .filter(word => word.length > 2 && !['get', 'post', 'put', 'patch', 'delete'].includes(word));
        
        if (keyWords.length > 0) {
          const matched = keyWords.some(keyword => normalizedPermName.includes(keyword));
          if (matched && process.env.NODE_ENV === 'development') {
            console.log(`✅ hasPermission("${permissionName}"): FALLBACK KEYWORD MATCH (OLD FORMAT)`);
          }
          return matched;
        }
      }
      
      return false;
    });
    
    if (process.env.NODE_ENV === 'development' && !matchedByName) {
      console.log(`❌ hasPermission("${permissionName}"): NO MATCH FOUND`);
    }
    
    return matchedByName;
  }, [userPermissions, userPermissionNames, userPermissionPaths, userPermissionIds]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissionIdsOrNames) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    // Filter out null/undefined permissions
    const validPermissions = permissionIdsOrNames.filter(perm => perm && typeof perm === 'string');
    
    if (validPermissions.length === 0) {
      return false;
    }
    
    // Check each permission (supports both ID and name)
    return validPermissions.some(permissionIdOrName => 
      hasPermission(permissionIdOrName)
    );
  }, [userPermissions, hasPermission]);

  // Check if user has all specified permissions
  const hasAllPermissions = useCallback((permissionIdsOrNames) => {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }
    
    // Filter out null/undefined permissions
    const validPermissions = permissionIdsOrNames.filter(perm => perm && typeof perm === 'string');
    
    if (validPermissions.length === 0) {
      return false;
    }
    
    // Check all permissions (supports both ID and name)
    return validPermissions.every(permissionIdOrName => 
      hasPermission(permissionIdOrName)
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
    hasPermission,           // Hybrid: supports both ID and name
    hasPermissionById,        // ID-only check (fastest)
    hasAnyPermission,         // Hybrid: supports both ID and name
    hasAllPermissions,        // Hybrid: supports both ID and name
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
