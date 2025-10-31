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
        case 'TRAINEE':
          redirectPath = '/trainee';
          break;
        case 'TRAINER':
          redirectPath = '/trainer/upcoming-assessments';
          break;
        case 'SQA_AUDITOR':
          redirectPath = '/sqa/issues';
          break;
        case 'DEPARTMENT_HEAD':
          redirectPath = '/department-head/dashboard';
          break;
        case 'ADMIN':
        case 'ADMINISTRATOR':
        default:
          redirectPath = '/admin/dashboard';
          break;
      }
      
      // Force redirect with replace
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  return null; // This component doesn't render anything
};

export default RoleBasedRedirect;
