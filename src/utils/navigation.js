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
  
  // Check if we're on GitHub Pages
  const hostname = window.location.hostname;
  if (hostname.includes('.github.io')) {
    // For GitHub Pages, check if we have a repo name in the path
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // If we're on GitHub Pages and have a repo name, use it
    if (pathSegments.length > 0 && pathSegments[0] !== '') {
      return `/${pathSegments[0]}`;
    }
    
    // If we're on GitHub Pages but no repo name in path, 
    // check if we came from a repo URL (from referrer or stored)
    const storedBasename = localStorage.getItem('app_basename');
    if (storedBasename) {
      return storedBasename;
    }
    
    // Check referrer for basename
    if (document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        if (referrerUrl.hostname === hostname) {
          const referrerPath = referrerUrl.pathname;
          const referrerSegments = referrerPath.split('/').filter(Boolean);
          if (referrerSegments.length > 0) {
            return `/${referrerSegments[0]}`;
          }
        }
      } catch (e) {
        console.log('Error parsing referrer:', e);
      }
    }
    
    // Default for GitHub Pages with repo name
    // Hardcode for this specific repo to avoid 404
    return "/dsfms-template";
  }
  
  return "/";
};

// Smart redirect that respects the current basename
export const smartRedirect = (path = '/') => {
  const basename = getCurrentBasename();
  const fullPath = basename === '/' ? path : `${basename}${path}`;
  
  console.log(`🔄 Smart redirect: ${path} -> ${fullPath}`);
  console.log(`📍 Current URL: ${window.location.href}`);
  console.log(`📍 Basename: ${basename}`);
  console.log(`📍 Full path: ${fullPath}`);
  
  window.location.href = fullPath;
};

// Initialize and store basename for future use
export const initializeBasename = () => {
  const basename = getCurrentBasename();
  if (basename !== '/') {
    localStorage.setItem('app_basename', basename);
    console.log(`📍 Stored basename: ${basename}`);
  }
};

// Check and redirect if user is on wrong URL
export const checkAndRedirectIfNeeded = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('.github.io') && window.location.pathname === '/') {
    console.log('🔧 Detected wrong URL, redirecting to correct path');
    window.location.href = 'https://capstoneproject-dsfms.github.io/dsfms-template/';
  }
};

// Navigate to login page with proper basename
export const redirectToLogin = () => {
  // Force redirect to correct GitHub Pages URL
  const hostname = window.location.hostname;
  if (hostname.includes('.github.io') && !window.location.pathname.includes('/dsfms-template')) {
    console.log('🔧 Force redirect to correct GitHub Pages URL');
    window.location.href = 'https://capstoneproject-dsfms.github.io/dsfms-template/';
    return;
  }
  
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
