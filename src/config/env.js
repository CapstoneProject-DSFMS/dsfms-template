/**
 * Environment Variables Configuration
 * Centralized config with fallback detection and warnings
 */

// Track if we're using fallback values
const envConfig = {
  VITE_API_BASE_URL: null,
  VITE_BASE_PATH: null,
  _usingFallback: {
    VITE_API_BASE_URL: false,
    VITE_BASE_PATH: false,
  },
  _initialized: false,
};

// Initialize and detect fallback usage
const initEnvConfig = () => {
  if (envConfig._initialized) {
    return envConfig;
  }

  // Check VITE_API_BASE_URL
  const apiBaseUrlFromEnv = import.meta.env.VITE_API_BASE_URL;
  if (apiBaseUrlFromEnv && apiBaseUrlFromEnv !== 'undefined') {
    envConfig.VITE_API_BASE_URL = apiBaseUrlFromEnv;
    envConfig._usingFallback.VITE_API_BASE_URL = false;
  } else {
    envConfig.VITE_API_BASE_URL = 'https://dsfms.id.vn'; // Fallback
    envConfig._usingFallback.VITE_API_BASE_URL = true;
    
    // Warn in console (always show warning, not just dev)
    console.warn(
      '⚠️ ENV WARNING: VITE_API_BASE_URL is not set!',
      'Using fallback:', envConfig.VITE_API_BASE_URL,
      '\nTo fix: Set VITE_API_BASE_URL in .env file or GitHub Secrets'
    );
  }

  // Check VITE_BASE_PATH
  const basePathFromEnv = import.meta.env.VITE_BASE_PATH;
  if (basePathFromEnv && basePathFromEnv !== 'undefined') {
    envConfig.VITE_BASE_PATH = basePathFromEnv;
    envConfig._usingFallback.VITE_BASE_PATH = false;
  } else {
    envConfig.VITE_BASE_PATH = '/'; // Fallback
    envConfig._usingFallback.VITE_BASE_PATH = true;
    
    console.warn(
      '⚠️ ENV WARNING: VITE_BASE_PATH is not set!',
      'Using fallback:', envConfig.VITE_BASE_PATH,
      '\nTo fix: Set VITE_BASE_PATH in .env file or GitHub Secrets'
    );
  }

  envConfig._initialized = true;

  // Log summary
  const anyFallback = Object.values(envConfig._usingFallback).some(v => v === true);
  if (anyFallback) {
    console.error(
      '❌ ENVIRONMENT VARIABLES ISSUE:',
      '\nSome environment variables are using fallback values!',
      '\nCurrent config:', {
        API_BASE_URL: envConfig.VITE_API_BASE_URL,
        BASE_PATH: envConfig.VITE_BASE_PATH,
        usingFallback: envConfig._usingFallback,
      },
      '\nCheck:',
      '\n1. Local: Ensure .env file exists in project root',
      '\n2. Deploy: Ensure GitHub Secrets are set in repo Settings',
      '\n3. Run: window.__ENV_STATUS__ to check status'
    );
  } else {
    console.log(
      '✅ ENVIRONMENT VARIABLES:',
      'All env variables loaded successfully!',
      {
        API_BASE_URL: envConfig.VITE_API_BASE_URL,
        BASE_PATH: envConfig.VITE_BASE_PATH,
      }
    );
  }

  return envConfig;
};

// Initialize immediately
initEnvConfig();

// Expose status to window for debugging
if (typeof window !== 'undefined') {
  window.__ENV_STATUS__ = {
    get API_BASE_URL() {
      return envConfig.VITE_API_BASE_URL;
    },
    get BASE_PATH() {
      return envConfig.VITE_BASE_PATH;
    },
    get usingFallback() {
      return { ...envConfig._usingFallback };
    },
    get isUsingAnyFallback() {
      return Object.values(envConfig._usingFallback).some(v => v === true);
    },
    get status() {
      const anyFallback = this.isUsingAnyFallback;
      return {
        status: anyFallback ? '⚠️ USING FALLBACK' : '✅ USING ENV',
        config: {
          VITE_API_BASE_URL: envConfig.VITE_API_BASE_URL,
          VITE_BASE_PATH: envConfig.VITE_BASE_PATH,
        },
        fallback: envConfig._usingFallback,
      };
    },
  };
}

// Export getters
export const getApiBaseUrl = () => envConfig.VITE_API_BASE_URL;
export const getBasePath = () => envConfig.VITE_BASE_PATH;
export const isUsingFallback = (key) => envConfig._usingFallback[key] || false;
export const isUsingAnyFallback = () => 
  Object.values(envConfig._usingFallback).some(v => v === true);

// Export config object
export default {
  VITE_API_BASE_URL: envConfig.VITE_API_BASE_URL,
  VITE_BASE_PATH: envConfig.VITE_BASE_PATH,
  usingFallback: envConfig._usingFallback,
  isUsingAnyFallback: () => Object.values(envConfig._usingFallback).some(v => v === true),
};

