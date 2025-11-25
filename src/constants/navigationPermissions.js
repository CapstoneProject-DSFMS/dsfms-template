/**
 * Navigation Items Permission Mapping
 * 
 * Maps navigation items to permission IDs (UUIDs)
 * Uses permission IDs for accurate and fast permission checking
 */

import { PERMISSION_IDS } from './permissionIds';

export const NAVIGATION_PERMISSIONS = {
  // Admin Navigation
  "main-menu": null, // No permission required, checks individual actions
  "users": PERMISSION_IDS.CREATE_USER, // User Management - UC-04: Only Administrator
  "roles": PERMISSION_IDS.VIEW_ALL_ROLES, // Role Management
  "departments": PERMISSION_IDS.VIEW_ALL_DEPARTMENTS, // Department Management
  "forms": PERMISSION_IDS.VIEW_ALL_TEMPLATES, // Template Management
  "system-config": PERMISSION_IDS.LIST_GLOBAL_FIELDS, // System Configuration
  
  // Academic Navigation
  "academic-dashboard": PERMISSION_IDS.ACADEMIC_OVERVIEW_DASHBOARD, // Analytics Dashboard
  
  // Trainee Navigation
  "trainee-dashboard": PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS, // Trainee dashboard requires enrollment view permission
  "enrolled-courses": PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS, // Trainee Enrollment
  "all-assessments": PERMISSION_IDS.LIST_ASSESSMENTS, // Assessment Execution
  "your-assessments": PERMISSION_IDS.LIST_ASSESSMENTS, // Assessment Execution
  "signature-required": PERMISSION_IDS.LIST_ASSESSMENTS, // Assessment Execution
  "completion-required": PERMISSION_IDS.LIST_ASSESSMENTS, // Assessment Execution
  "create-issue": PERMISSION_IDS.SUBMIT_REPORT_REQUEST, // Incident Reporting
  
  // Trainer Navigation
  "upcoming-assessments": PERMISSION_IDS.LIST_ASSESSMENTS, // Assessment Execution
  "assessment-results": PERMISSION_IDS.VIEW_ASSESSMENT_DETAILS, // Assessment Execution
  "instructed-courses": PERMISSION_IDS.VIEW_ALL_COURSES, // Course Management
  
  // Department Head Navigation
  "department-dashboard": PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL, // Department Management
  "my-department-details": PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL, // Department Management
  "assessment-review-requests": PERMISSION_IDS.LIST_ASSESSMENTS, // Assessment Results Approval
  
  // SQA Navigation
  "incidents-feedback": PERMISSION_IDS.LIST_ALL_REPORTS, // Reports Management
  "template-list": PERMISSION_IDS.VIEW_ALL_TEMPLATES, // Template Management
  "template-history": PERMISSION_IDS.VIEW_TEMPLATE_DETAILS, // Template Management
  "template-sections": PERMISSION_IDS.VIEW_TEMPLATE_DETAILS, // Template Management
  "template-fields": PERMISSION_IDS.VIEW_TEMPLATE_DETAILS, // Template Management
  "template-export": PERMISSION_IDS.DOWNLOAD_CONTENT_PDF, // Template Management
};

/**
 * Get permission name for a navigation item
 * @param {string} itemId - Navigation item ID
 * @returns {string|null} Permission name or null if no permission required
 */
export const getNavigationPermission = (itemId) => {
  return NAVIGATION_PERMISSIONS[itemId] || null;
};

/**
 * Check if navigation item requires any permission
 * @param {string} itemId - Navigation item ID
 * @returns {boolean} True if permission is required
 */
export const requiresPermission = (itemId) => {
  return NAVIGATION_PERMISSIONS[itemId] !== null;
};

