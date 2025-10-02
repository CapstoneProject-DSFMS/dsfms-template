import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

const PermissionRoute = ({ 
  permission, 
  permissions = [], 
  requireAll = false, 
  children, 
  redirectTo = "/admin/dashboard"
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
      if (requireAll) {
        return hasAllPermissions(permissions);
      } else {
        return hasAnyPermission(permissions);
      }
    }

    return false;
  };

  if (!canAccess()) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PermissionRoute;
