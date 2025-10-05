/**
 * Simple navigation utility for consistent routing
 */

// Get the current basename - consistent with Vite config
export const getCurrentBasename = () => {
  return import.meta.env.VITE_BASE_PATH || "/";
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

// Navigate to dashboard
export const redirectToDashboard = () => {
  smartRedirect('/admin/dashboard');
};

// Initialize basename (for compatibility)
export const initializeBasename = () => {
  const basename = getCurrentBasename();
};

// Check and redirect if needed (for compatibility)
export const checkAndRedirectIfNeeded = () => {
  // No longer needed with simple basename logic
};