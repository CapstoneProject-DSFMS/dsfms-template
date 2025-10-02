import React from 'react';
import { Alert } from 'react-bootstrap';
import { usePermissions } from '../../hooks/usePermissions';

const ModuleAccess = ({ 
  module, 
  children, 
  fallback = null,
  showMessage = false,
  message = "You do not have access to this module."
}) => {
  const { hasModuleAccess } = usePermissions();

  if (!hasModuleAccess(module)) {
    if (fallback) {
      return fallback;
    }
    
    if (showMessage) {
      return (
        <Alert variant="warning" className="mt-3">
          <Alert.Heading>Module Access Denied</Alert.Heading>
          <p>{message}</p>
        </Alert>
      );
    }
    
    return null;
  }

  return children;
};

export default ModuleAccess;
