// API Permissions Reference
// This file contains all API permissions from the backend
// Use these exact permission names in components

export const API_PERMISSIONS = {
  // User Management
  USERS: {
    CREATE: "POST /users",
    VIEW_ALL: "GET /users", 
    VIEW_DETAIL: "GET /users/:userId",
    UPDATE: "PUT /users/:userId",
    DELETE: "DELETE /users/:userId",
    ENABLE: "PATCH /users/:userId/enable",
    BULK_CREATE: "POST /users/bulk"
  },

  // Role Management  
  ROLES: {
    CREATE: "POST /roles",
    VIEW_ALL: "GET /roles",
    VIEW_DETAIL: "GET /roles/:roleId", 
    UPDATE: "PUT /roles/:roleId",
    DELETE: "DELETE /roles/:roleId",
    ENABLE: "PATCH /roles/:roleId/enable"
  },

  // Department Management
  DEPARTMENTS: {
    CREATE: "POST /departments",
    VIEW_ALL: "GET /departments",
    VIEW_DETAIL: "GET /departments/:departmentId",
    UPDATE: "PUT /departments/:departmentId", 
    DELETE: "DELETE /departments/:departmentId",
    ENABLE: "PATCH /departments/:departmentId/enable",
    ADD_TRAINERS: "PATCH /departments/:departmentId/add-trainers",
    REMOVE_TRAINERS: "PATCH /departments/:departmentId/remove-trainers",
    GET_DEPARTMENT_HEADS: "GET /departments/helpers/department-heads"
  },

  // Course Management
  COURSES: {
    CREATE: "POST /courses",
    VIEW_ALL: "GET /courses",
    VIEW_DETAIL: "GET /courses/:id",
    UPDATE: "PUT /courses/:id",
    DELETE: "DELETE /courses/:id", 
    RESTORE: "POST /courses/:id/restore",
    ARCHIVE: "PATCH /courses/:courseId/archive",
    ACCESS_CHECK: "GET /courses/:id/access-check",
    STATS: "GET /courses/stats",
    BY_DEPARTMENT: "GET /courses/department/:departmentId"
  },

  // Subject Management
  SUBJECTS: {
    CREATE: "POST /subjects",
    VIEW_ALL: "GET /subjects",
    VIEW_DETAIL: "GET /subjects/:id",
    UPDATE: "PUT /subjects/:id",
    DELETE: "DELETE /subjects/:id",
    HARD_DELETE: "DELETE /subjects/:id/hard",
    RESTORE: "PUT /subjects/:id/restore",
    ARCHIVE: "PATCH /subjects/:subjectId/archive",
    STATS: "GET /subjects/stats",
    BY_COURSE: "GET /subjects/course/:courseId",
    INSTRUCTORS: "GET /subjects/:id/instructors",
    ENROLLMENTS: "GET /subjects/:id/enrollments",
    ADD_INSTRUCTOR: "POST /subjects/:id/instructors",
    REMOVE_INSTRUCTOR: "DELETE /subjects/:id/instructors",
    ADD_ENROLLMENT: "POST /subjects/:id/enrollments",
    REMOVE_ENROLLMENT: "DELETE /subjects/:id/enrollments",
    UPDATE_ENROLLMENT_STATUS: "PUT /subjects/:id/enrollments/:traineeEid/status",
    VALIDATE_ACCESS: "POST /subjects/:id/validate-access"
  },

  // Assessment Management
  ASSESSMENTS: {
    VIEW_ALL: "GET /assessments",
    VIEW_RESULTS: "GET /assessments/results",
    VIEW_TRAINEE_RESULTS: "GET /assessments/results/me",
    SAVE_DRAFT: "PATCH /assessments/:assessmentId/draft",
    SUBMIT: "POST /assessments/:assessmentId/submit",
    APPROVE: "POST /assessments/:assessmentId/approve",
    REJECT: "POST /assessments/:assessmentId/reject",
    EXPORT: "GET /assessments/:assessmentId/export"
  },

  // Template Management
  TEMPLATES: {
    CREATE: "POST /templates",
    VIEW_ALL: "GET /templates",
    VIEW_OLD: "GET /templates/old",
    UPDATE: "PUT /templates/:templateId",
    DELETE: "DELETE /templates/:templateId"
  },

  // Form Management
  FORMS: {
    VIEW_ALL: "GET /forms",
    DELETE: "DELETE /forms/:formId",
    CREATE_FROM_TEMPLATE: "POST /forms/template"
  },

  // Reports Management
  REPORTS: {
    CREATE: "POST /reports",
    VIEW_ALL: "GET /reports",
    VIEW_PERSONAL: "GET /reports/me",
    UPDATE_STATUS: "PATCH /reports/:reportId/status",
    RESPOND: "POST /reports/:reportId/respond"
  },

  // Permission Management
  PERMISSIONS: {
    CREATE: "POST /permissions",
    VIEW_ALL: "GET /permissions",
    VIEW_DETAIL: "GET /permissions/:permissionId",
    UPDATE: "PUT /permissions/:permissionId",
    DELETE: "DELETE /permissions/:permissionId",
    ENABLE: "PATCH /permissions/:permissionId/enable"
  },

  // Profile Management
  PROFILES: {
    VIEW: "GET /profile",
    UPDATE: "PUT /profile",
    UPLOAD_SIGNATURE: "POST /profile/signature",
    RESET_PASSWORD: "PUT /profile/reset-password"
  },

  // Global Fields Management
  GLOBAL_FIELDS: {
    CREATE: "POST /global-fields",
    VIEW_ALL: "GET /global-fields",
    UPDATE: "PUT /global-fields/:fieldId",
    DELETE: "DELETE /global-fields/:fieldId"
  },

  // Dashboard
  DASHBOARD: {
    VIEW: "GET /dashboard"
  },

  // Auth
  AUTH: {
    LOGIN: "POST /auth/login",
    REFRESH: "POST /auth/refresh",
    STATUS: "GET /auth/status",
    FORGOT_PASSWORD: "POST /auth/forgot-password",
    RESET_PASSWORD: "POST /auth/reset-password"
  },

  // Email
  EMAIL: {
    SEND: "POST /email/send",
    BULK_SIMPLE: "POST /email/bulk-simple",
    BULK_SEND: "POST /email/bulk-send",
    SEND_SES: "POST /email/send-ses",
    BULK_SEND_SES: "POST /email/bulk-send-ses",
    SEND_GMAIL: "POST /email/send-gmail",
    BULK_SEND_GMAIL: "POST /email/bulk-send-gmail",
    TEST_GMAIL: "POST /email/test-gmail-connection"
  },

  // Enrollments
  ENROLLMENTS: {
    CREATE: "POST /enrollments",
    VIEW_ALL: "GET /enrollments",
    DELETE: "DELETE /enrollments/:enrollmentId"
  }
};

// Helper function to get permission by key
export const getPermission = (module, action) => {
  return API_PERMISSIONS[module]?.[action] || null;
};

// Helper function to check if permission exists
export const hasPermissionKey = (module, action) => {
  return API_PERMISSIONS[module]?.[action] !== undefined;
};
