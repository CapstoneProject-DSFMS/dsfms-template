import React from 'react';
import { Alert } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

const PermissionWrapper = ({ 
  permission, 
  permissions = [], 
  requireAll = false, 
  children, 
  fallback = null,
  showMessage = true,
  message = "You do not have permission to access this feature."
}) => {
  const { user } = useAuth();

  const hasAccess = (userPermissions, requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  };

  const canAccess = hasAccess(user?.permissions, permissions);

  if (!canAccess) {
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
