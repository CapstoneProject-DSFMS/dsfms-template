import React from 'react';
import { AuthProvider } from '../../context/AuthContext.jsx';

const AuthWrapper = ({ children }) => {
  console.log('🔍 AuthWrapper rendering...');
  
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default AuthWrapper;
