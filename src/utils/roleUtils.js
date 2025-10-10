// Utility functions for role management

// Define base roles that cannot be modified
export const BASE_ROLES = [
  'ADMINISTRATOR',
  'ADMIN', 
  'ACADEMIC_DEPARTMENT',
  'TRAINEE'
];

// Check if a role is a base role
export const isBaseRole = (roleName) => {
  return BASE_ROLES.includes(roleName?.toUpperCase());
};

// Check if a role can be modified
export const canModifyRole = (roleName) => {
  return !isBaseRole(roleName);
};

// Get base role description
export const getBaseRoleDescription = (roleName) => {
  const descriptions = {
    'ADMINISTRATOR': 'System administrator with full access',
    'ADMIN': 'System administrator with full access', 
    'ACADEMIC_DEPARTMENT': 'Academic department role for course management',
    'TRAINEE': 'Trainee role for course participants'
  };
  
  return descriptions[roleName?.toUpperCase()] || 'System-defined role';
};
