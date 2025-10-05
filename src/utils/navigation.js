/**
 * Simple navigation utility for consistent routing
 */

// Get the current basename - same logic as router
export const getCurrentBasename = () => {
  // For GitHub Pages, always use /dsfms-template/
  if (window.location.hostname.includes('github.io')) {
    return '/dsfms-template/';
  }
  // For local development, use environment variable or default
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