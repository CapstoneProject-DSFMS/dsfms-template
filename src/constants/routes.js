/**
 * Route Constants - Function-based Routes
 * 
 * Centralized route definitions for the application.
 * These routes are function-based (not role-based) for better reusability.
 * 
 * Migration Strategy:
 * 1. Old routes (role-based) still work via redirects
 * 2. New routes (function-based) are the primary routes
 * 3. All navigation should use these constants
 */

// ============================================
// Public Routes
// ============================================
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  RESET_PASSWORD: '/reset-password',
  
  // Profile (shared across all roles)
  PROFILE: '/profile',
  
  // Dashboard (permission-based, different for each role)
  DASHBOARD: '/dashboard',
  
  // ============================================
  // User Management
  // ============================================
  USERS: '/users',
  USERS_DETAIL: (userId) => `/users/${userId}`,
  
  // ============================================
  // Role Management
  // ============================================
  ROLES: '/roles',
  ROLES_DETAIL: (roleId) => `/roles/${roleId}`,
  
  // ============================================
  // Department Management
  // ============================================
  DEPARTMENTS: '/departments',
  DEPARTMENTS_DETAIL: (deptId) => `/departments/${deptId}`,
  
  // ============================================
  // Course Management
  // ============================================
  COURSES: '/courses',
  COURSES_INSTRUCTED: '/courses/instructed', // Trainer's instructed courses
  COURSES_ENROLLED: '/courses/enrolled', // Trainee's enrolled courses
  COURSES_DETAIL: (courseId) => `/courses/${courseId}`,
  COURSES_ENROLL_TRAINEES: (courseId) => `/courses/${courseId}/enroll-trainees`,
  // Academic Department specific routes
  ACADEMIC_COURSE_DETAIL: (courseId) => `/academic/course-detail/${courseId}`, // Academic-specific course detail page
  
  // ============================================
  // Subject Management
  // ============================================
  SUBJECTS: '/subjects',
  SUBJECTS_DETAIL: (subjectId) => `/subjects/${subjectId}`,
  SUBJECTS_IN_COURSE: (courseId, subjectId) => `/courses/${courseId}/subjects/${subjectId}`,
  
  // ============================================
  // Assessment Management
  // ============================================
  ASSESSMENTS: '/assessments',
  ASSESSMENTS_UPCOMING: '/assessments/upcoming', // Trainer
  ASSESSMENTS_MY_ASSESSMENTS: '/assessments/my-assessments', // Trainee
  ASSESSMENTS_RESULTS: '/assessments/results', // Trainer
  ASSESSMENTS_DETAIL: (assessmentId) => `/assessments/${assessmentId}`,
  ASSESSMENTS_SECTIONS: (assessmentId) => `/assessments/${assessmentId}/sections`,
  ASSESSMENTS_SECTION_FIELDS: (sectionId) => `/assessments/sections/${sectionId}/fields`,
  ASSESSMENTS_ASSIGN: (entityType, entityId) => `/assessments/assign/${entityType}/${entityId}`,
  ASSESSMENTS_SIGNATURE_REQUIRED: '/assessments/signature-required',
  ASSESSMENTS_PENDING: '/assessments/pending',
  
  // Assessment Events (Academic Department)
  ASSESSMENT_EVENTS: '/assessment-events',
  
  // ============================================
  // Template Management
  // ============================================
  TEMPLATES: '/templates',
  TEMPLATES_DETAIL: (templateId) => `/templates/${templateId}`,
  TEMPLATES_EDITOR: '/templates/editor',
  TEMPLATES_DRAFTS: '/templates/drafts',
  TEMPLATES_HISTORY: (templateId) => `/templates/${templateId}/history`,
  TEMPLATES_SECTIONS: (templateId) => `/templates/${templateId}/sections`,
  TEMPLATES_FIELDS: (templateId) => `/templates/${templateId}/fields`,
  
  // ============================================
  // Reports Management
  // ============================================
  REPORTS: '/reports',
  REPORTS_ISSUES: '/reports/issues', // SQA
  REPORTS_FEEDBACK: '/reports/feedback', // SQA
  REPORTS_CREATE: '/reports/create',
  REPORTS_DETAIL: (reportId) => `/reports/${reportId}`,
  
  // ============================================
  // System Configuration
  // ============================================
  SYSTEM_CONFIG: '/system-config',
  GLOBAL_FIELDS: '/system-config/global-fields',
  
  // ============================================
  // Main Menu (Admin only)
  // ============================================
  MAIN_MENU: '/main-menu',
  
  // ============================================
  // Trainee Specific Routes
  // ============================================
  TRAINEE_ACADEMIC_DETAILS: '/academic-details',
  TRAINEE_SIGNATURE_PAD: (documentId) => `/signature-pad/${documentId}`,
  TRAINEE_ASSESSMENT_SECTION: (sectionId) => `/assessments/sections/${sectionId}`,
  
  // ============================================
  // Trainer Specific Routes
  // ============================================
  TRAINER_CONFIGURE_SIGNATURE: '/configure-signature',
  TRAINER_APPROVAL_NOTES: (resultId) => `/assessments/approval-notes/${resultId}`,
  
  // ============================================
  // Department Head Specific Routes
  // ============================================
  DEPARTMENT_MY_DETAILS: '/my-department-details',
  DEPARTMENT_REVIEW_REQUESTS: '/assessment-review-requests',
  DEPARTMENT_REVIEW_REQUEST_DETAIL: (requestId) => `/assessment-review-requests/${requestId}`,
};

// ============================================
// Route Aliases (Backward Compatibility)
// ============================================
// Map old role-based routes to new function-based routes
export const ROUTE_ALIASES = {
  // Admin routes
  '/admin/users': ROUTES.USERS,
  '/admin/roles': ROUTES.ROLES,
  '/admin/departments': ROUTES.DEPARTMENTS,
  '/admin/forms': ROUTES.TEMPLATES,
  '/admin/forms/editor': ROUTES.TEMPLATES_EDITOR,
  '/admin/forms/drafts': ROUTES.TEMPLATES_DRAFTS,
  '/admin/system-config': ROUTES.SYSTEM_CONFIG,
  '/admin/main-menu': ROUTES.MAIN_MENU,
  
  // Trainer routes
  '/trainer/instructed-courses': ROUTES.COURSES_INSTRUCTED,
  '/trainer/upcoming-assessments': ROUTES.ASSESSMENTS_UPCOMING,
  '/trainer/assessment-results': ROUTES.ASSESSMENTS_RESULTS,
  '/trainer/configure-signature': ROUTES.TRAINER_CONFIGURE_SIGNATURE,
  '/trainer/dashboard': ROUTES.DASHBOARD,
  
  // Trainee routes
  '/trainee/dashboard': ROUTES.DASHBOARD,
  '/trainee/enrolled-courses': ROUTES.COURSES_ENROLLED,
  '/trainee/all-assessments': ROUTES.ASSESSMENTS_MY_ASSESSMENTS,
  '/trainee/your-assessments': ROUTES.ASSESSMENTS_MY_ASSESSMENTS,
  '/trainee/signature-required': ROUTES.ASSESSMENTS_SIGNATURE_REQUIRED,
  '/trainee/completion-required': ROUTES.ASSESSMENTS_COMPLETION_REQUIRED,
  '/trainee/create-incident-feedback-report': ROUTES.REPORTS_CREATE,
  '/trainee/academic-details': ROUTES.TRAINEE_ACADEMIC_DETAILS,
  
  // Academic Department routes
  '/academic/dashboard': ROUTES.DASHBOARD,
  '/academic/departments': ROUTES.COURSES, // Course selection view
  '/academic/assessment-events': ROUTES.ASSESSMENT_EVENTS,
  '/academic/course-detail/:courseId': (courseId) => `/academic/course-detail/${courseId}`, // Academic-specific course detail
  
  // Department Head routes
  '/department-head/dashboard': ROUTES.DASHBOARD,
  '/department-head/my-department-details': ROUTES.DEPARTMENT_MY_DETAILS,
  '/department-head/assessment-review-requests': ROUTES.DEPARTMENT_REVIEW_REQUESTS,
  
  // SQA routes
  '/sqa/issues': ROUTES.REPORTS_ISSUES,
  '/sqa/feedback': ROUTES.REPORTS_FEEDBACK,
  '/sqa/templates': ROUTES.TEMPLATES,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get the canonical route for a given path (handles aliases)
 * @param {string} path - The path to resolve
 * @returns {string} - The canonical route path
 */
export const getCanonicalRoute = (path) => {
  // Remove query params and hash
  const cleanPath = path.split('?')[0].split('#')[0];
  
  // Check if it's an alias
  if (ROUTE_ALIASES[cleanPath]) {
    return ROUTE_ALIASES[cleanPath];
  }
  
  // Check if it's already a canonical route
  if (Object.values(ROUTES).includes(cleanPath)) {
    return cleanPath;
  }
  
  // Return original path if no mapping found
  return cleanPath;
};

/**
 * Check if a route is an alias (old role-based route)
 * @param {string} path - The path to check
 * @returns {boolean} - True if the path is an alias
 */
export const isRouteAlias = (path) => {
  const cleanPath = path.split('?')[0].split('#')[0];
  return cleanPath in ROUTE_ALIASES;
};

