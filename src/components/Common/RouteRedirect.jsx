import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCanonicalRoute } from '../../constants/routes';

/**
 * RouteRedirect Component
 * 
 * Automatically redirects old role-based routes to new function-based routes.
 * This ensures backward compatibility while migrating to new route structure.
 * 
 * Usage: Add this as a route element for old routes
 * {
 *   path: "/trainer/instructed-courses",
 *   element: <RouteRedirect />
 * }
 */
const RouteRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const canonicalRoute = getCanonicalRoute(location.pathname);
    
    // Preserve query params and hash
    const search = location.search || '';
    const hash = location.hash || '';
    const newPath = canonicalRoute + search + hash;
    
    // Only redirect if the canonical route is different
    if (canonicalRoute !== location.pathname) {
      // ⭐ CRITICAL: Preserve location.state when redirecting
      // This is essential for FormEditorPage and other pages that rely on navigation state
      navigate(newPath, { 
        replace: true,
        state: location.state // Preserve state from original navigation
      });
    }
  }, [location.pathname, location.search, location.hash, location.state, navigate]);

  return null; // This component doesn't render anything
};

export default RouteRedirect;

