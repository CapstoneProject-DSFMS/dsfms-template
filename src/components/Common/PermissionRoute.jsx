import React from 'react';
import { Navigate } from 'react-router-dom';
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
      console.log('🔍 PermissionRoute - No permissions specified, allowing access');
      return true;
    }

    // Temporary bypass for TRAINEE role to test UI
    if (user?.role === 'TRAINEE') {
      console.log('🔍 PermissionRoute - TRAINEE role bypass, allowing access');
      return true;
    }

    // Single permission check
    if (permission) {
      const hasAccess = hasPermission(permission);
      console.log(`🔍 PermissionRoute - Permission check: ${permission}, Result: ${hasAccess}`);
      return hasAccess;
    }

    // Multiple permissions check
    if (permissions && permissions.length > 0) {
      if (requireAll) {
        const hasAccess = hasAllPermissions(permissions);
        console.log(`🔍 PermissionRoute - All permissions check: ${permissions.join(', ')}, Result: ${hasAccess}`);
        return hasAccess;
      } else {
        const hasAccess = hasAnyPermission(permissions);
        console.log(`🔍 PermissionRoute - Any permission check: ${permissions.join(', ')}, Result: ${hasAccess}`);
        return hasAccess;
      }
    }

    console.log('🔍 PermissionRoute - No valid permission check, denying access');
    return false;
  };

  if (!canAccess()) {
    // Determine redirect path based on user role
    let defaultRedirect = "/admin/dashboard";
    if (user?.role === 'TRAINEE') {
      defaultRedirect = "/trainee";
    } else if (user?.role === 'ACADEMIC_DEPARTMENT') {
      defaultRedirect = "/academic/dashboard";
    }
    
    const finalRedirect = redirectTo || defaultRedirect;
    console.log('🚫 PermissionRoute - Access denied, redirecting to:', finalRedirect, 'for role:', user?.role);
    console.log('🚫 PermissionRoute - Permission check details:', {
      permission,
      permissions,
      requireAll,
      userRole: user?.role,
      userPermissions: user?.permissions?.map(p => p.name)
    });
    return <Navigate to={finalRedirect} replace />;
  }

  return children;
};

export default PermissionRoute;
