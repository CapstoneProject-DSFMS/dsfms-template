import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      // Normalize role name - handle both string and object, and different variants
      const rawRoleName = typeof user.role === 'string' 
        ? user.role 
        : (user.role?.name || '');
      
      // Normalize role name: 'ACADEMIC DEPARTMENT' -> 'ACADEMIC_DEPARTMENT'
      const normalizedRoleName = rawRoleName
        .toUpperCase()
        .replace(/\s+/g, '_')
        .trim();
      
      let redirectPath = '/admin/users'; // default - redirect to user management instead of dashboard
      
      // Check normalized role name
      if (normalizedRoleName === 'ACADEMIC_DEPARTMENT' || normalizedRoleName === 'ACADEMIC_DEPT' || normalizedRoleName.startsWith('ACADEMIC')) {
        redirectPath = '/academic/dashboard';
      } else if (normalizedRoleName === 'TRAINEE') {
        redirectPath = '/trainee';
      } else if (normalizedRoleName === 'TRAINER') {
        redirectPath = '/trainer/upcoming-assessments';
      } else if (normalizedRoleName === 'SQA_AUDITOR') {
        redirectPath = '/sqa/issues';
      } else if (normalizedRoleName === 'DEPARTMENT_HEAD') {
        redirectPath = '/department-head/dashboard';
      } else if (normalizedRoleName === 'ADMIN' || normalizedRoleName === 'ADMINISTRATOR') {
        redirectPath = '/admin/users';
      } else {
        // Default fallback
        redirectPath = '/admin/users';
      }
      
      // Force redirect with replace
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  return null; // This component doesn't render anything
};

export default RoleBasedRedirect;
