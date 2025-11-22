import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Only redirect if we're sure the user is not authenticated
  if (!isAuthenticated) {
    // console.log('🔒 User not authenticated, redirecting to login'); // Commented out to reduce console noise
    // Redirect to login page WITHOUT location state
    // This prevents the new user (after login) from being redirected to the previous user's route
    // Instead, RoleBasedRedirect will handle the redirect based on the new user's role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
