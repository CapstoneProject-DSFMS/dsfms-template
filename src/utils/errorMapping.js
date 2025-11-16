// Error mapping utility for customizing backend error messages
export const ERROR_MAPPINGS = {
  // User validation errors
  'Validation failed': {
    default: 'Invalid data. Please check your information and try again.',
    fields: {
      'firstName': 'First name is required',
      'lastName': 'Last name is required', 
      'email': 'Email is invalid or already exists',
      'phoneNumber': 'Phone number is invalid',
      'password': 'Password must be at least 8 characters',
      'role': 'Role is invalid',
      'department': 'Department is invalid',
      'address': 'Address is required',
      'gender': 'Gender is invalid',
      'dob': 'Date of birth is invalid',
      'trainingBatch': 'Training batch is required',
      'passportNo': 'Passport number is invalid',
      'nation': 'Nationality is required',
      'certificationNumber': 'Certification number is invalid',
      'specialization': 'Specialization is required',
      'yearsOfExp': 'Years of experience must be a positive number'
    }
  },
  
  // Authentication errors
  'Unauthorized': 'You do not have permission to access. Please login again.',
  'Unauthorized access': 'Wrong username or password. Please check your credentials and try again.',
  'Access token is missing': 'Your session has expired. Please login again.',
  'Invalid refresh token': 'Your session is invalid. Please login again.',
  'User not found or inactive': 'Account does not exist or has been deactivated.',
  'Email or password is incorrect': 'Email or password is incorrect.',
  'Wrong password or username': 'Wrong password or username. Please check your credentials and try again.',
  
  // Permission errors
  'Forbidden': 'You do not have permission to perform this action. Please contact your administrator.',
  'Insufficient permissions': 'You do not have sufficient permissions to perform this action.',
  'Access denied': 'Access denied. You do not have permission to access this resource.',
  
  // User management errors
  'User not found': 'User not found.',
  'User already exists': 'User already exists.',
  'Cannot delete user': 'Cannot delete this user.',
  'Cannot update user': 'Cannot update user information.',
  
  // Role management errors
  'Role not found': 'Role not found.',
  'Role already exists': 'Role already exists.',
  'Cannot delete role': 'Cannot delete this role.',
  'Prohibited action on base role': 'Cannot modify base roles. Base roles are system-defined and cannot be edited.',
  
  // Department management errors
  'Department not found': 'Department not found.',
  'Department already exists': 'Department already exists.',
  'Cannot delete department': 'Cannot delete this department.',
  
  // General errors
  'Internal server error': 'System error. Please try again later.',
  'Network error': 'Connection error. Please check your network and try again.',
  'Request timeout': 'Request timeout. Please try again.',
  'Not found': 'Data not found.',
  'Conflict': 'Data already exists or conflicts.',
  'Too many requests': 'Too many requests. Please try again later.'
};

// Function to map backend error to custom message
export const mapError = (error, context = {}) => {
  // Handle HTTP status codes
  if (error?.response?.status === 403) {
    return 'You do not have permission to perform this action. Please contact your administrator.';
  }
  
  if (error?.response?.status === 401) {
    return 'Your session has expired. Please login again.';
  }
  
  // If error is a string, try to map it directly
  if (typeof error === 'string') {
    return ERROR_MAPPINGS[error] || error;
  }
  
  // If error is an object with message and errors array
  if (error && typeof error === 'object') {
    const { message, errors } = error;
    
    // Handle case where message is an array (new backend format)
    let mainMessage = message;
    if (Array.isArray(message)) {
      // If message is an array, use the first item or fallback
      if (message.length > 0) {
        const firstMessage = message[0];
        // If first item is also an object, extract the message property
        if (typeof firstMessage === 'object' && firstMessage !== null) {
          mainMessage = firstMessage.message || firstMessage.field || 'Validation failed';
        } else {
          mainMessage = firstMessage;
        }
      } else {
        mainMessage = 'Validation failed';
      }
    }
    
    // Map the main message
    // Handle case where ERROR_MAPPINGS[mainMessage] is an object with default property
    let mappedMessage = ERROR_MAPPINGS[mainMessage];
    if (mappedMessage && typeof mappedMessage === 'object' && mappedMessage.default) {
      mappedMessage = mappedMessage.default;
    } else if (!mappedMessage || typeof mappedMessage !== 'string') {
      mappedMessage = mainMessage;
    }
    
    // If there are specific field errors, try to map them
    if (errors && Array.isArray(errors) && errors.length > 0) {
      const fieldErrors = errors.map(err => {
        // Handle different error formats
        if (typeof err === 'string') {
          // Try to extract field name from error message
          const fieldMatch = err.match(/(\w+)\s+(.+)/);
          if (fieldMatch) {
            const [, field, errorText] = fieldMatch;
            const fieldMapping = ERROR_MAPPINGS[mainMessage]?.fields?.[field];
            return fieldMapping || errorText;
          }
          return err;
        } else if (typeof err === 'object' && err !== null) {
          // Handle object errors
          if (err.field && err.message) {
            // Format: { field: 'fieldName', message: 'error message' }
            const fieldMapping = ERROR_MAPPINGS[mainMessage]?.fields?.[err.field];
            return fieldMapping || err.message;
          } else if (err.property && err.constraints) {
            // NestJS format: { property: 'fieldName', constraints: { ... } }
            const fieldMapping = ERROR_MAPPINGS[mainMessage]?.fields?.[err.property];
            return fieldMapping || Object.values(err.constraints)[0] || err.property;
          }
          return JSON.stringify(err);
        }
        return String(err);
      });
      
      return `${mappedMessage}\n\nDetails:\n${fieldErrors.join('\n')}`;
    }
    
    return mappedMessage;
  }
  
  // If error has response data (axios error)
  if (error?.response?.data) {
    return mapError(error.response.data, context);
  }
  
  // Fallback to error message or default
  return error?.message || 'An unknown error occurred. Please try again.';
};

// Function to get field-specific error message
export const getFieldError = (fieldName) => {
  // Try to find field-specific mapping
  for (const [, mapping] of Object.entries(ERROR_MAPPINGS)) {
    if (mapping.fields && mapping.fields[fieldName]) {
      return mapping.fields[fieldName];
    }
  }
  
  // Fallback to generic field error
  return `${fieldName} is invalid.`;
};

// Function to extract validation errors from backend response
export const extractValidationErrors = (error) => {
  if (!error || typeof error !== 'object') {
    return [];
  }
  
  const { errors } = error;
  if (!Array.isArray(errors)) {
    return [];
  }
  
  return errors.map(err => {
    // Handle different error formats
    if (typeof err === 'string') {
      // Try to parse field-specific errors from string
      const fieldMatch = err.match(/(\w+)\s+(.+)/);
      if (fieldMatch) {
        const [, field] = fieldMatch;
        return {
          field,
          message: getFieldError(field)
        };
      }
      
      return {
        field: 'general',
        message: err
      };
    } else if (typeof err === 'object' && err !== null) {
      // Handle object errors (e.g., NestJS validation errors)
      if (err.property && err.constraints) {
        // NestJS validation error format: { property: 'fieldName', constraints: { ... } }
        const field = err.property;
        
        return {
          field,
          message: getFieldError(field)
        };
      } else if (err.field && err.message) {
        // Custom error format: { field: 'fieldName', message: 'error message' }
        return {
          field: err.field,
          message: err.message
        };
      } else {
        // Unknown object format
        return {
          field: 'general',
          message: JSON.stringify(err)
        };
      }
    }
    
    // Fallback for other types
    return {
      field: 'general',
      message: String(err)
    };
  });
};
