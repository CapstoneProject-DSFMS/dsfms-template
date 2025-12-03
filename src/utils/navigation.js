import { ROUTES, getCanonicalRoute } from '../constants/routes';
import { getBasePath } from '../config/env.js';

export const getCurrentBasename = () => {
  return getBasePath();
};

// Simple redirect that respects the basename
export const smartRedirect = (path = '/') => {
  const basename = getCurrentBasename();
  const fullPath = basename === '/' ? path : `${basename}${path}`;
  
  window.location.href = fullPath;
};

// Navigate to login page
export const redirectToLogin = () => {
  smartRedirect('/');
};

/**
 * Smart navigation function that uses route constants
 * Automatically resolves route aliases to canonical routes
 * 
 * @param {string} path - Route path (can be old alias or new route)
 * @param {object} options - Navigation options (query params, hash, etc.)
 * @returns {string} - Canonical route path
 */
export const getRoute = (path, options = {}) => {
  // Get canonical route
  let canonicalPath = getCanonicalRoute(path);
  
  // Handle dynamic routes (functions)
  if (typeof canonicalPath === 'function') {
    const params = options.params || {};
    canonicalPath = canonicalPath(...Object.values(params));
  }
  
  // Add query params if provided
  if (options.query) {
    const queryString = new URLSearchParams(options.query).toString();
    canonicalPath += `?${queryString}`;
  }
  
  // Add hash if provided
  if (options.hash) {
    canonicalPath += `#${options.hash}`;
  }
  
  return canonicalPath;
};

// Export ROUTES for direct access
export { ROUTES };

