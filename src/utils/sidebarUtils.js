import { PERMISSION_IDS } from '../constants/permissionIds';
import { ROUTES } from '../constants/routes';

/**
 * Get all navigation items (same structure as Sidebar.jsx)
 * This is the source of truth for navigation items
 */
export const getAllNavItems = () => {
  return [
    {
      id: "main-menu",
      label: "Main Menu",
      path: ROUTES.MAIN_MENU,
      isAdminOnly: true, // Special flag for role-based check
    },
    {
      id: "users",
      label: "User Management",
      path: ROUTES.USERS,
      permissions: [
        PERMISSION_IDS.VIEW_ALL_USERS,
        PERMISSION_IDS.CREATE_USER,
        PERMISSION_IDS.UPDATE_USER,
        PERMISSION_IDS.DISABLE_USER,
        PERMISSION_IDS.ENABLE_USER
      ],
      requireAll: false, // Show if user has ANY of these permissions
    },
    {
      id: "roles",
      label: "Role Management",
      path: ROUTES.ROLES,
      permission: PERMISSION_IDS.VIEW_ALL_ROLES,
    },
    {
      id: "departments",
      label: "Departments",
      path: ROUTES.DEPARTMENTS,
      permission: PERMISSION_IDS.VIEW_ALL_DEPARTMENTS,
    },
    {
      id: "forms",
      label: "Template List",
      path: ROUTES.TEMPLATES,
      permission: PERMISSION_IDS.VIEW_ALL_TEMPLATES,
    },
    {
      id: "system-config",
      label: "System Configuration",
      path: ROUTES.SYSTEM_CONFIG,
      permission: PERMISSION_IDS.LIST_GLOBAL_FIELDS,
    },
    {
      id: "academic-dashboard",
      label: "Academic Dashboard",
      path: "/academic/dashboard",
      permission: PERMISSION_IDS.ACADEMIC_OVERVIEW_DASHBOARD,
    },
    {
      id: "trainee-dashboard",
      label: "Trainee Dashboard",
      path: ROUTES.DASHBOARD,
      permission: PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS,
    },
    {
      id: "enrolled-courses",
      label: "Enrolled Course List",
      path: ROUTES.COURSES_ENROLLED,
      permission: PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS,
    },
    {
      id: "all-assessments",
      label: "All Assessments",
      path: ROUTES.ASSESSMENTS_MY_ASSESSMENTS,
      // For Trainee: use "GET /assessments/user-events", for other roles: use LIST_ASSESSMENTS UUID
      permissions: [
        PERMISSION_IDS.LIST_ASSESSMENTS,  // For Trainer, Department Head, etc.
        "GET /assessments/user-events"     // For Trainee
      ],
      requireAll: false, // Show if user has ANY of these permissions
      children: [
        {
          id: "your-assessments",
          label: "Your Assessments",
          path: ROUTES.ASSESSMENTS_MY_ASSESSMENTS,
          permissions: [
            PERMISSION_IDS.LIST_ASSESSMENTS,
            "GET /assessments/user-events"
          ],
          requireAll: false,
        },
        {
          id: "signature-required",
          label: "Signature Required List",
          path: ROUTES.ASSESSMENTS_SIGNATURE_REQUIRED,
          permissions: [
            PERMISSION_IDS.LIST_ASSESSMENTS,
            "GET /assessments/user-events"
          ],
          requireAll: false,
        },
        {
          id: "completion-required",
          label: "Section Completion Required List",
          path: ROUTES.ASSESSMENTS_COMPLETION_REQUIRED,
          permissions: [
            PERMISSION_IDS.LIST_ASSESSMENTS,
            "GET /assessments/user-events"
          ],
          requireAll: false,
        }
      ]
    },
    {
      id: "create-issue",
      label: "Create Incident/Feedback Report",
      path: ROUTES.REPORTS_CREATE,
      permission: PERMISSION_IDS.SUBMIT_REPORT_REQUEST,
    },
    // Trainer Navigation Items
    {
      id: "upcoming-assessments",
      label: "List Upcoming Assessment",
      path: ROUTES.ASSESSMENTS_UPCOMING,
      permission: PERMISSION_IDS.LIST_ASSESSMENTS,
    },
    {
      id: "assessment-results",
      label: "List Assessment Result",
      path: ROUTES.ASSESSMENTS_RESULTS,
      permission: PERMISSION_IDS.LIST_ASSESSMENTS, // ✅ Match với route permission
    },
    {
      id: "instructed-courses",
      label: "List Instructed Course",
      path: ROUTES.COURSES_INSTRUCTED,
      permission: PERMISSION_IDS.VIEW_ALL_COURSES,
    },
    // Department Head Navigation Items
    {
      id: "department-dashboard",
      label: "Department Dashboard",
      path: "/department-head/dashboard", // Department Head specific dashboard route
      permission: PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL,
    },
    {
      id: "my-department-details",
      label: "My Department Details",
      path: ROUTES.DEPARTMENT_MY_DETAILS,
      permission: PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL,
    },
    {
      id: "assessment-review-requests",
      label: "List Assessment Review Requests",
      path: ROUTES.DEPARTMENT_REVIEW_REQUESTS,
      permission: PERMISSION_IDS.LIST_ASSESSMENTS,
    },
    // SQA Navigation Items
    {
      id: "issue-list",
      label: "Issue List",
      path: ROUTES.REPORTS_ISSUES,
      permission: PERMISSION_IDS.LIST_ALL_REPORTS,
    },
    {
      id: "feedback-list",
      label: "Feedback List",
      path: ROUTES.REPORTS_FEEDBACK,
      permission: PERMISSION_IDS.LIST_ALL_REPORTS,
    },
    {
      id: "template-list",
      label: "Template List",
      path: ROUTES.TEMPLATES,
      permission: PERMISSION_IDS.VIEW_ALL_TEMPLATES,
      children: [
        {
          id: "template-history",
          label: "List History Version",
          path: "/sqa/templates/history",
          permission: PERMISSION_IDS.VIEW_TEMPLATE_DETAILS,
        },
        {
          id: "template-sections",
          label: "Section List",
          path: "/sqa/templates/sections",
          permission: PERMISSION_IDS.VIEW_TEMPLATE_DETAILS,
        },
        {
          id: "template-fields",
          label: "Field List",
          path: "/sqa/templates/fields",
          permission: PERMISSION_IDS.VIEW_TEMPLATE_DETAILS,
        },
        {
          id: "template-export",
          label: "PDF Preview for Export",
          path: "/sqa/templates/export",
          permission: PERMISSION_IDS.DOWNLOAD_CONTENT_PDF,
        }
      ]
    },
  ];
};

/**
 * Helper function to check if user is Administrator
 */
export const isAdministrator = (user) => {
  if (!user?.role) return false;
  const rawRoleName = typeof user.role === 'string' 
    ? user.role 
    : (user.role?.name || '');
  const normalizedRoleName = rawRoleName
    .toUpperCase()
    .replace(/\s+/g, '_')
    .trim();
  return normalizedRoleName === 'ADMIN' || normalizedRoleName === 'ADMINISTRATOR';
};

/**
 * Helper function to check if user is Academic Department
 */
export const isAcademicDepartment = (user) => {
  if (!user?.role) return false;
  const rawRoleName = typeof user.role === 'string' 
    ? user.role 
    : (user.role?.name || '');
  const normalizedRoleName = rawRoleName
    .toUpperCase()
    .replace(/\s+/g, '_')
    .trim();
  return normalizedRoleName === 'ACADEMIC_DEPARTMENT' || 
         normalizedRoleName === 'ACADEMIC_DEPT' ||
         normalizedRoleName.startsWith('ACADEMIC');
};

/**
 * Helper function to check if user is Trainer
 */
export const isTrainer = (user) => {
  if (!user?.role) return false;
  const rawRoleName = typeof user.role === 'string' 
    ? user.role 
    : (user.role?.name || '');
  const normalizedRoleName = rawRoleName
    .toUpperCase()
    .replace(/\s+/g, '_')
    .trim();
  return normalizedRoleName === 'TRAINER';
};

/**
 * Helper function to check if user is Department Head
 */
export const isDepartmentHead = (user) => {
  if (!user?.role) return false;
  const rawRoleName = typeof user.role === 'string' 
    ? user.role 
    : (user.role?.name || '');
  const normalizedRoleName = rawRoleName
    .toUpperCase()
    .replace(/\s+/g, '_')
    .trim();
  return normalizedRoleName === 'DEPARTMENT_HEAD' || 
         normalizedRoleName === 'DEPT_HEAD' ||
         normalizedRoleName === 'DEPARTMENT HEAD';
};

/**
 * Helper function to check if user is Trainee
 */
export const isTrainee = (user) => {
  if (!user?.role) return false;
  const rawRoleName = typeof user.role === 'string' 
    ? user.role 
    : (user.role?.name || '');
  const normalizedRoleName = rawRoleName
    .toUpperCase()
    .replace(/\s+/g, '_')
    .trim();
  return normalizedRoleName === 'TRAINEE';
};

/**
 * Filter navigation items based on user permissions and role
 * This replicates the filtering logic from Sidebar.jsx
 * 
 * @param {Object} user - User object from AuthContext
 * @param {Array} userPermissions - User permissions array
 * @param {Function} hasPermission - Function to check if user has a permission
 * @param {Function} hasAnyPermission - Function to check if user has any of the permissions
 * @returns {Array} Filtered navigation items
 */
export const getAccessibleNavItems = (user, userPermissions, hasPermission, hasAnyPermission) => {
  // ⭐ Administrator role: Only show these items (according to UC list)
  const ADMINISTRATOR_ALLOWED_ITEMS = [
    "main-menu",
    "users",
    "roles",
    "departments",
    "forms",
    "system-config"
  ];
  
  // ⭐ Academic Department role: Only show these items (according to UC list)
  const ACADEMIC_DEPT_ALLOWED_ITEMS = [
    "academic-dashboard",
  ];
  
  // ⭐ Trainer role: Only show these items (according to UC list)
  // UC-26: View All Courses → "List Instructed Course"
  // UC-53: View All Assessments → "List Upcoming Assessment"
  // UC-53: View All Assessments → "List Assessment Result" (Trainer can view assessment results)
  const TRAINER_ALLOWED_ITEMS = [
    "upcoming-assessments",   // UC-53: View All Assessments
    "assessment-results",     // UC-53: View All Assessments (assessment results)
    "instructed-courses",     // UC-26: View All Courses
  ];
  
  // ⭐ Department Head role: Only show these items (according to UC list)
  // UC-21: View All Departments → "Department Dashboard" and "My Department Details"
  // UC-57: Approve/Deny Submitted Assessment → "List Assessment Review Requests"
  // UC-58: View All Assessment Requests → "List Assessment Review Requests"
  const DEPT_HEAD_ALLOWED_ITEMS = [
    "department-dashboard",        // UC-21: View All Departments (via View Department In Detail)
    "my-department-details",       // UC-21: View All Departments (via View Department In Detail)
    "assessment-review-requests",  // UC-57, UC-58: Approve/Deny Assessment, View Assessment Requests
  ];
  
  // ⭐ Trainee role: Only show these items (according to UC list)
  // UC-37: View Trainee Subject Enrollments → "Trainee Dashboard" and "Enrolled Course List"
  // UC-53: View All Assessments → "All Assessments"
  // UC-62: Submit Incident/Feedback Report → "Create Incident/Feedback Report"
  // Note: Trainee có LIST_ALL_REPORTS (UC-61) nhưng không nên thấy "Issue List" và "Feedback List" (đây là của SQA)
  const TRAINEE_ALLOWED_ITEMS = [
    "trainee-dashboard",        // UC-37: View Trainee Subject Enrollments
    "enrolled-courses",         // UC-37: View Trainee Subject Enrollments
    "all-assessments",          // UC-53: View All Assessments
    "create-issue",             // UC-62: Submit Incident/Feedback Report
  ];

  const allNavItems = getAllNavItems();

  // Filter items based on permissions (with special role-based checks for Admin-only items)
  return allNavItems.filter(item => {
    // ⭐ ROLE-BASED FILTERING FOR ADMINISTRATOR
    if (isAdministrator(user)) {
      // Special case: Main Menu is hardcoded for Administrator role only
      if (item.isAdminOnly) {
        return true;
      }
      // Only show items in the allowed list
      return ADMINISTRATOR_ALLOWED_ITEMS.includes(item.id);
    }
    
    // ⭐ ROLE-BASED FILTERING FOR ACADEMIC DEPARTMENT
    if (isAcademicDepartment(user)) {
      // Only show items in the allowed list
      return ACADEMIC_DEPT_ALLOWED_ITEMS.includes(item.id);
    }
    
    // ⭐ ROLE-BASED FILTERING FOR TRAINER
    // Trainer role: Only show items in TRAINER_ALLOWED_ITEMS list
    // This prevents Trainer from seeing items that belong to other roles
    // (even if they have the permissions, according to UC list, they shouldn't see them)
    // Example: Trainer has SUBMIT_REPORT_REQUEST permission but shouldn't see "Create Incident/Feedback Report" (UC-62: Trainer, Trainee - but not in Trainer sidebar)
    // Example: Trainer has LIST_ALL_REPORTS permission but shouldn't see "Issue List" and "Feedback List" (UC-60: SQA Auditor)
    if (isTrainer(user)) {
      // Only show items in the allowed list
      return TRAINER_ALLOWED_ITEMS.includes(item.id);
    }
    
    // ⭐ ROLE-BASED FILTERING FOR DEPARTMENT HEAD
    // Department Head role: Only show items in DEPT_HEAD_ALLOWED_ITEMS list
    // This prevents Department Head from seeing items that belong to other roles
    // (even if they have the permissions, according to UC list, they shouldn't see them)
    // Example: Department Head has VIEW_ALL_COURSES permission but shouldn't see "List Instructed Course" (UC-26: Academic Dept, Dept Head, Trainer - but not in Dept Head sidebar)
    if (isDepartmentHead(user)) {
      // Only show items in the allowed list
      return DEPT_HEAD_ALLOWED_ITEMS.includes(item.id);
    }
    
    // ⭐ ROLE-BASED FILTERING FOR TRAINEE
    // Trainee role: Only show items in TRAINEE_ALLOWED_ITEMS list
    // This prevents Trainee from seeing items that belong to other roles
    // (even if they have the permissions, according to UC list, they shouldn't see them)
    // Example: Trainee has LIST_ALL_REPORTS permission (UC-61) but shouldn't see "Issue List" and "Feedback List" (UC-60: SQA Auditor)
    if (isTrainee(user)) {
      // Only show items in the allowed list
      return TRAINEE_ALLOWED_ITEMS.includes(item.id);
    }
    
    // ⭐ PERMISSION-BASED FILTERING FOR OTHER ROLES
    // For non-Administrator, non-Academic Department, and non-Trainer roles, check permissions as usual
    
    // Special case: Main Menu is hardcoded for Administrator role only
    if (item.isAdminOnly) {
      return false; // Non-Administrator cannot see Main Menu
    }
    
    // If no permission required, show item
    if (!item.permission && (!item.permissions || item.permissions.length === 0)) {
      return true;
    }
    
    // Check if user has the required permission(s)
    let hasAccess = false;
    
    // Support both single permission and multiple permissions
    if (item.permissions && item.permissions.length > 0) {
      // Multiple permissions: check if user has ANY (default) or ALL (if requireAll=true)
      hasAccess = item.requireAll 
        ? item.permissions.every(perm => hasPermission(perm))
        : hasAnyPermission(item.permissions);
    } else if (item.permission) {
      // Single permission
      hasAccess = hasPermission(item.permission);
    }
    
    // Also check children permissions if item has children
    if (item.children && item.children.length > 0) {
      const hasChildAccess = item.children.some(child => {
        if (!child.permission) return true;
        return hasPermission(child.permission);
      });
      
      // Show parent if user has access to parent OR any child
      return hasAccess || hasChildAccess;
    }
    
    return hasAccess;
  }).map(item => {
    // Filter children based on permissions
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: item.children.filter(child => {
          if (!child.permission) return true;
          return hasPermission(child.permission);
        })
      };
    }
    return item;
  });
};

/**
 * Get the first accessible navigation item path
 * This is used for redirecting users to their first accessible page
 * 
 * @param {Object} user - User object from AuthContext
 * @param {Array} userPermissions - User permissions array
 * @param {Function} hasPermission - Function to check if user has a permission
 * @param {Function} hasAnyPermission - Function to check if user has any of the permissions
 * @param {string} fallbackPath - Fallback path if no accessible items found (default: '/dashboard')
 * @returns {string} First accessible navigation item path
 */
export const getFirstAccessibleRoute = (
  user, 
  userPermissions, 
  hasPermission, 
  hasAnyPermission,
  fallbackPath = ROUTES.DASHBOARD
) => {
  // If no user or permissions, return fallback
  if (!user || !userPermissions || userPermissions.length === 0) {
    return fallbackPath;
  }

  // Get accessible navigation items
  const accessibleItems = getAccessibleNavItems(user, userPermissions, hasPermission, hasAnyPermission);
  
  // If no accessible items, return fallback
  if (accessibleItems.length === 0) {
    return fallbackPath;
  }

  // Get first accessible item
  const firstItem = accessibleItems[0];
  
  // Return the path of the first item
  // Note: We return the parent path, not child path (even if item has children)
  return firstItem.path || fallbackPath;
};

