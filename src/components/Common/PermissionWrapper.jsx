import React from 'react';
import { Alert } from 'react-bootstrap';
import { usePermissions } from '../../hooks/usePermissions';

const PermissionWrapper = ({ 
  permission, 
  permissions = [], 
  requireAll = false, 
  children, 
  fallback = null,
  showMessage = false,
  message = "You do not have permission to access this feature."
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const canAccess = () => {
    // If no permissions specified, allow access
    if (!permission && (!permissions || permissions.length === 0)) {
      return true;
    }

    // Single permission check
    if (permission) {
      return hasPermission(permission);
    }

    // Multiple permissions check
    if (permissions && permissions.length > 0) {
      // Filter out null/undefined permissions
      const validPermissions = permissions.filter(perm => perm && typeof perm === 'string');
      
      if (validPermissions.length === 0) {
        return true; // If no valid permissions, allow access
      }
      
      if (requireAll) {
        return hasAllPermissions(validPermissions);
      } else {
        return hasAnyPermission(validPermissions);
      }
    }

    return false;
  };

  if (!canAccess()) {
    if (fallback) {
      return fallback;
    }
    
    if (showMessage) {
      return (
        <Alert variant="warning" className="mt-3">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>{message}</p>
        </Alert>
      );
    }
    
    return null;
  }

  return children;
};

export default PermissionWrapper;
