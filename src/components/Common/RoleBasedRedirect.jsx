import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      let redirectPath = '/admin/dashboard'; // default
      
      switch (user.role) {
        case 'ACADEMIC_DEPARTMENT':
          redirectPath = '/academic/dashboard';
          break;
        case 'ADMIN':
        default:
          redirectPath = '/admin/dashboard';
          break;
      }
      
      console.log('🔄 Redirecting to:', redirectPath, 'for role:', user.role);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  return null; // This component doesn't render anything
};

export default RoleBasedRedirect;
