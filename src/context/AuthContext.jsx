import { createContext, useState, useEffect } from 'react';

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing auth data on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};