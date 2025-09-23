// Example usage of error mapping utility
import { mapError, extractValidationErrors } from './errorMapping';

// Example 1: Simple string error
const simpleError = 'Validation failed';
const mappedSimpleError = mapError(simpleError);
console.log('Simple error mapping:', mappedSimpleError);
// Output: "Invalid data. Please check your information and try again."

// Example 2: Object error with message and errors array
const objectError = {
  message: 'Validation failed',
  errors: [
    'firstName is required',
    'email must be a valid email',
    'phoneNumber is invalid'
  ]
};
const mappedObjectError = mapError(objectError);
console.log('Object error mapping:', mappedObjectError);
// Output: "Invalid data. Please check your information and try again.\n\nDetails:\nFirst name is required\nEmail is invalid or already exists\nPhone number is invalid"

// Example 3: Axios error response
const axiosError = {
  response: {
    data: {
      message: 'User not found',
      errors: []
    }
  }
};
const mappedAxiosError = mapError(axiosError);
console.log('Axios error mapping:', mappedAxiosError);
// Output: "User not found."

// Example 4: Extract validation errors
const validationErrors = extractValidationErrors(objectError);
console.log('Validation errors:', validationErrors);
// Output: [
//   { field: 'firstName', message: 'First name is required' },
//   { field: 'email', message: 'Email is invalid or already exists' },
//   { field: 'phoneNumber', message: 'Phone number is invalid' }
// ]

// Example 5: Unknown error
const unknownError = 'Some unknown error message';
const mappedUnknownError = mapError(unknownError);
console.log('Unknown error mapping:', mappedUnknownError);
// Output: "Some unknown error message" (fallback to original message)

export {
  simpleError,
  objectError,
  axiosError,
  unknownError,
  mappedSimpleError,
  mappedObjectError,
  mappedAxiosError,
  mappedUnknownError,
  validationErrors
};
