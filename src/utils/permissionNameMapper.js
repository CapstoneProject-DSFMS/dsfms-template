/**
 * Permission Name Mapper
 * 
 * Maps BE permission names (from role API) to navigation permission names
 * BE role API returns permissions with format: { name: "GET /users", ... }
 * But navigation needs: "View All Users"
 * 
 * This mapper bridges the gap between the two formats
 */

import { BE_PERMISSIONS } from '../constants/bePermissions';

/**
 * Map BE permission name (from role API) to navigation permission name
 * @param {string} bePermissionName - Permission name from BE (e.g., "GET /users")
 * @returns {string|null} Navigation permission name (e.g., "View All Users") or null
 */
export const mapBEPermissionToNavigation = (bePermissionName) => {
  if (!bePermissionName) return null;
  
  // Direct mapping table: BE format -> Navigation format
  const mapping = {
    // User Management
    "GET /users": "View All Users",
    "GET /users/:userId": "View User In Detail",
    "POST /users": "Create User",
    "PUT /users/:userId": "Update User",
    "DELETE /users/:userId": "Disable User",
    "PATCH /users/:userId/enable": "Enable User",
    "POST /users/bulk": "Bulk Create Users",
    
    // Role Management
    "GET /roles": "View All Roles",
    "GET /roles/:roleId": "View Role In Detail",
    "POST /roles": "Create Role",
    "PUT /roles/:roleId": "Update Role",
    "DELETE /roles/:roleId": "Disable Role",
    "PATCH /roles/:roleId/enable": "Enable Role",
    
    // Department Management
    "GET /departments": "View All Departments",
    "GET /departments/:departmentId": "View Department In Detail",
    "POST /departments": "Create Department",
    "PUT /departments/:departmentId": "Update Department",
    "DELETE /departments/:departmentId": "Delete Department",
    "PATCH /departments/:departmentId/enable": "Enable Department",
    
    // Course Management
    "GET /courses": "View All Courses",
    "GET /courses/:id": "View Course In Detail",
    "POST /courses": "Create Course",
    "PUT /courses/:id": "Update Course",
    "PATCH /courses/:courseId/archive": "Archive Course",
    
    // Subject Management
    "GET /subjects": "List Subjects",
    "GET /subjects/:id": "View Subject Detail",
    "POST /subjects": "Create Subject",
    "POST /subjects/bulk": "Create Bulk Subjects",
    "PUT /subjects/:id": "Update Subject",
    "PATCH /subjects/:subjectId/archive": "Archive Subject",
    
    // Template Management
    "GET /templates": "View All Templates",
    "GET /templates/:id": "View Template Details",
    "POST /templates": "Create Template",
    "PUT /templates/:templateId": "Edit Template Basics",
    "GET /templates/:id/schema": "View Template Schema",
    "GET /templates/:id/pdf": "Download Content PDF",
    "GET /templates/:id/config-pdf": "Download Configuration PDF",
    
    // Assessment Execution
    "GET /assessments": "List Assessments",
    "GET /assessments/user-events": "List Assessments", // Trainee-specific endpoint
    "GET /assessments/:id": "View Assessment Details",
    "GET /assessments/:id/sections": "View Assessment Sections",
    "PATCH /assessments/:assessmentId/draft": "Save Section Values",
    "POST /assessments/:assessmentId/submit": "Submit Assessment",
    
    // Global Fields
    "GET /global-fields": "List Global Fields",
    "GET /global-fields/detail": "View Global Field In Detail",
    "POST /global-fields": "Create Global Field",
    "PUT /global-fields/:fieldId": "Update Global Field",
    "DELETE /global-fields/:fieldId": "Delete Global Field",
    
    // Profile
    "GET /profile": "View My Profile",
    "PUT /profile": "Update My Profile",
    "PUT /profile/reset-password": "Change Password",
    
    // Reports
    "GET /reports": "List All Reports",
    "GET /reports/me": "List My Reports",
    "GET /reports/:reportId": "View Report Detail",
    "POST /reports": "Submit Report Request",
    "PATCH /reports/:reportId/status": "Cancel Report",
    "POST /reports/:reportId/respond": "Respond to Report",
    
    // Analytics
    "GET /dashboard": "Academic Overview Dashboard",
    
    // Trainee Enrollment
    "GET /enrollments": "View Trainee Subject Enrollments",
    "POST /enrollments": "Assign Trainees to Subject",
    "DELETE /enrollments/:enrollmentId": "Remove Trainee from Subject",
    
    // Trainee Management (Note: BE doesn't have separate trainee permissions, use User Management)
    "GET /trainees": "View All Users", // Trainees are users, so use View All Users
    "GET /trainees/:id": "View User In Detail", // Trainee detail = User detail
    "PUT /trainees/:id": "Update User", // Trainee update = User update
    "DELETE /trainees/:id": "Disable User", // Trainee delete = User disable
    "PATCH /trainees/:id/toggle-status": "Enable User", // Trainee enable = User enable
    "GET /trainees/:id/courses": "View Trainee Subject Enrollments", // Trainee courses = enrollments
    "GET /trainees/:id/subjects": "View Trainee Subject Enrollments", // Trainee subjects = enrollments
    "GET /trainees/:id/assessments": "List Assessments", // Trainee assessments
    "POST /trainees/:id/enroll": "Assign Trainees to Subject", // Enroll trainee
    "DELETE /trainees/:id/enroll/:courseId": "Remove Trainee from Subject", // Unenroll trainee
    "POST /trainees/bulk-import": "Bulk Create Users", // Bulk import trainees = bulk create users
  };
  
  // Direct lookup
  if (mapping[bePermissionName]) {
    return mapping[bePermissionName];
  }
  
  // If the permission name is already in BE format (like "View All Users"), return it as-is
  // Check if it exists in BE_PERMISSIONS structure
  for (const [module, permissions] of Object.entries(BE_PERMISSIONS)) {
    for (const [permName, permId] of Object.entries(permissions)) {
      if (permName === bePermissionName) {
        return permName; // Already in correct format
      }
    }
  }
  
  // Try fuzzy matching for BE format permissions
  for (const [module, permissions] of Object.entries(BE_PERMISSIONS)) {
    for (const [permName, permId] of Object.entries(permissions)) {
      // Check if BE permission name matches any permission in BE_PERMISSIONS
      // This handles cases where BE returns different format
      const normalizedBE = bePermissionName.toLowerCase().replace(/\s+/g, '');
      const normalizedPerm = permName.toLowerCase().replace(/\s+/g, '');
      if (normalizedBE === normalizedPerm || 
          normalizedBE.includes(normalizedPerm) || 
          normalizedPerm.includes(normalizedBE)) {
        return permName; // Return the BE permission name directly
      }
    }
  }
  
  return null;
};

/**
 * Reverse mapping: Navigation permission name -> BE permission name
 * @param {string} navigationPermissionName - Navigation permission name (e.g., "View All Users")
 * @returns {string[]} Array of possible BE permission names
 */
export const mapNavigationToBEPermission = (navigationPermissionName) => {
  if (!navigationPermissionName) return [];
  
  const reverseMapping = {};
  
  // Build reverse mapping from forward mapping
  const forwardMapping = {
    "GET /users": "View All Users",
    "GET /users/:userId": "View User In Detail",
    "GET /roles": "View All Roles",
    "GET /departments": "View All Departments",
    "GET /templates": "View All Templates",
    "GET /global-fields": "List Global Fields",
    "GET /dashboard": "Academic Overview Dashboard",
    "GET /profile": "View My Profile",
    "GET /enrollments": "View Trainee Subject Enrollments",
    "GET /assessments": "List Assessments",
    "GET /assessments/user-events": "List Assessments", // Trainee-specific endpoint
    "GET /assessments/:id": "View Assessment Details",
    "GET /courses": "View All Courses",
    "GET /departments/:departmentId": "View Department In Detail",
    "GET /reports": "List All Reports",
    "POST /reports": "Submit Report Request",
    // Trainee Management mappings
    "GET /trainees": "View All Users",
    "GET /trainees/:id": "View User In Detail",
    "GET /trainees/:id/courses": "View Trainee Subject Enrollments",
    "GET /trainees/:id/subjects": "View Trainee Subject Enrollments",
    "GET /trainees/:id/assessments": "List Assessments",
  };
  
  const matches = [];
  for (const [beName, navName] of Object.entries(forwardMapping)) {
    if (navName === navigationPermissionName) {
      matches.push(beName);
    }
  }
  
  // Also check BE_PERMISSIONS structure
  for (const [module, permissions] of Object.entries(BE_PERMISSIONS)) {
    for (const [permName, permId] of Object.entries(permissions)) {
      if (permName === navigationPermissionName) {
        // Find the BE format for this permission
        // This is tricky - we need to know the method+path
        // For now, return the permission name as-is
        matches.push(permName);
      }
    }
  }
  
  return matches;
};

