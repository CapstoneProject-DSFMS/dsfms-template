import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('AuthContext is null or undefined. Make sure AuthProvider is properly wrapping the component tree.');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};








