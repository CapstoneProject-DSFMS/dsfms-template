import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 RoleBasedRedirect - User:', user);
    console.log('🔍 RoleBasedRedirect - User role:', user?.role);
    
    if (user?.role) {
      let redirectPath = '/admin/dashboard'; // default
      
      switch (user.role) {
        case 'ACADEMIC_DEPARTMENT':
          redirectPath = '/academic/dashboard';
          break;
        case 'TRAINEE':
          redirectPath = '/trainee';
          break;
        case 'ADMIN':
        case 'ADMINISTRATOR':
        default:
          redirectPath = '/admin/dashboard';
          break;
      }
      
      console.log('🔄 RoleBasedRedirect - Redirecting to:', redirectPath, 'for role:', user.role);
      console.log('🔄 RoleBasedRedirect - Current pathname:', window.location.pathname);
      
      // Force redirect with replace
      navigate(redirectPath, { replace: true });
    } else {
      console.log('🔍 RoleBasedRedirect - No user role found, user:', user);
    }
  }, [user, navigate]);

  return null; // This component doesn't render anything
};

export default RoleBasedRedirect;
