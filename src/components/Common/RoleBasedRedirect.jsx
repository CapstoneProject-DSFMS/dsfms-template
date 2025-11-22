import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { useFirstAccessibleRoute } from '../../hooks/useFirstAccessibleRoute';
import { ROUTES } from '../../constants/routes';

const RoleBasedRedirect = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { firstRoute, isLoading: isRouteLoading } = useFirstAccessibleRoute(ROUTES.DASHBOARD);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading || isRouteLoading || !user) {
      return;
    }

    // Don't redirect if already on the target route (prevent circular redirects)
    if (location.pathname === firstRoute) {
      hasRedirected.current = true;
      return;
    }

    // Don't redirect if we've already redirected (prevent multiple redirects)
    if (hasRedirected.current) {
      return;
    }

    // Redirect to first accessible route
    hasRedirected.current = true;
    navigate(firstRoute, { replace: true });
  }, [user, isLoading, isRouteLoading, firstRoute, navigate, location.pathname]);

  // Show loading spinner while calculating route
  if (isLoading || isRouteLoading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Loading...</div>
        </div>
      </div>
    );
  }

  return null; // This component doesn't render anything after redirect
};

export default RoleBasedRedirect;
