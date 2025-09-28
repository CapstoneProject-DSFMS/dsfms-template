/**
 * Navigation utility for handling routing across different deployment environments
 */

// Get the current basename from router
export const getCurrentBasename = () => {
  if (import.meta.env.DEV) {
    return "/";
  }
  
  if (import.meta.env.VITE_BASE_PATH) {
    return import.meta.env.VITE_BASE_PATH;
  }
  
  const pathname = window.location.pathname;
  if (pathname.startsWith('/dsfms-template')) {
    return "/dsfms-template";
  }
  
  return "/";
};

// Smart redirect that respects the current basename
export const smartRedirect = (path = '/') => {
  const basename = getCurrentBasename();
  const fullPath = basename === '/' ? path : `${basename}${path}`;
  
  console.log(`🔄 Smart redirect: ${path} -> ${fullPath}`);
  window.location.href = fullPath;
};

// Navigate to login page with proper basename
export const redirectToLogin = () => {
  smartRedirect('/');
};

// Navigate to dashboard with proper basename
export const redirectToDashboard = () => {
  smartRedirect('/admin/dashboard');
};

// Check if current path is within the app's basename
export const isWithinApp = () => {
  const basename = getCurrentBasename();
  const pathname = window.location.pathname;
  
  if (basename === '/') {
    return true; // Root deployment
  }
  
  return pathname.startsWith(basename);
};

// Get relative path from current basename
export const getRelativePath = (fullPath) => {
  const basename = getCurrentBasename();
  
  if (basename === '/') {
    return fullPath;
  }
  
  if (fullPath.startsWith(basename)) {
    return fullPath.substring(basename.length) || '/';
  }
  
  return fullPath;
};
