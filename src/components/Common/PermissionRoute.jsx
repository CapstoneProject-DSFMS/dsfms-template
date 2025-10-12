import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';

const PermissionRoute = ({ 
  permission, 
  permissions = [], 
  requireAll = false, 
  children, 
  redirectTo = null
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const { user } = useAuth();

  const canAccess = () => {
    // If no permissions specified, allow access
    if (!permission && (!permissions || permissions.length === 0)) {
      return true;
    }

    // Temporary bypass for TRAINEE role to test UI
    if (user?.role === 'TRAINEE') {
      return true;
    }

    // Single permission check
    if (permission) {
      const hasAccess = hasPermission(permission);
      return hasAccess;
    }

    // Multiple permissions check
    if (permissions && permissions.length > 0) {
      if (requireAll) {
        const hasAccess = hasAllPermissions(permissions);
        return hasAccess;
      } else {
        const hasAccess = hasAnyPermission(permissions);
        return hasAccess;
      }
    }

    return false;
  };

  if (!canAccess()) {
    // Show fallback message instead of redirecting
    return (
      <div className="p-4 text-center text-muted">
        <h4>Access Denied</h4>
        <p>You don't have permission to access this page.</p>
        <p className="small text-muted">
          Required permission: {permission || permissions.join(', ')}
        </p>
        <p className="small text-muted">
          Your role: {user?.role || 'Unknown'}
        </p>
      </div>
    );
  }

  return children;
};

export default PermissionRoute;
