
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

