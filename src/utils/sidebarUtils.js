import { ROUTES } from '../constants/routes';
import { PERMISSION_IDS } from '../constants/permissionIds'; // Add this line

const ROLE_NORMALIZATION_MAP = {
  ADMIN: 'ADMINISTRATOR',
  ADMINISTRATOR: 'ADMINISTRATOR',
  'ACADEMIC_DEPT': 'ACADEMIC_DEPARTMENT',
  'ACADEMIC DEPT': 'ACADEMIC_DEPARTMENT',
  'ACADEMIC DEPARTMENT': 'ACADEMIC_DEPARTMENT',
  TRAINER: 'TRAINER',
  TRAINEE: 'TRAINEE',
  'DEPT_HEAD': 'DEPARTMENT_HEAD',
  'DEPARTMENT HEAD': 'DEPARTMENT_HEAD',
  'DEPARTMENT_HEAD': 'DEPARTMENT_HEAD',
};

const normalizeRoleName = (role) => {
  if (!role) return null;
  const raw = typeof role === 'string'
    ? role
    : (role?.name || '');
  if (!raw) return null;
  const standardized = raw.toUpperCase().replace(/\s+/g, '_').trim();
  return ROLE_NORMALIZATION_MAP[standardized] || standardized;
};

const hasRole = (user, allowedRoles = []) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const normalized = normalizeRoleName(user?.role);
  if (!normalized) return false;
  return allowedRoles.some((role) => role === normalized);
};

const NAV_ITEMS = [
  {
    id: 'main-menu',
    label: 'Main Menu',
    path: ROUTES.MAIN_MENU,
    icon: 'list',
    roleOnly: ['ADMINISTRATOR'],
  },
  {
    id: 'users',
    label: 'Users',
    path: ROUTES.USERS,
    icon: 'people',
    permissions: [PERMISSION_IDS.VIEW_ALL_USERS], // View All Users
  },
  {
    id: 'roles',
    label: 'Roles',
    path: ROUTES.ROLES,
    icon: 'shield',
    permissions: [PERMISSION_IDS.VIEW_ALL_ROLES], // View All Roles
  },
  {
    id: 'departments',
    label: 'Departments',
    path: ROUTES.DEPARTMENTS,
    icon: 'building',
    permissions: [PERMISSION_IDS.VIEW_ALL_DEPARTMENTS, PERMISSION_IDS.UPDATE_DEPARTMENT], // View All Departments + Update Department
    requireAll: true,
  },
  {
    id: 'forms',
    label: 'Templates',
    path: ROUTES.TEMPLATES,
    icon: 'fileText',
    // Permissions are handled by customPermissionLogic
    customPermissionLogic: (hasPermission) => {
      return hasPermission(PERMISSION_IDS.VIEW_ALL_TEMPLATE);
    },
  },
  {
    id: 'system-config',
    label: 'Global Fields',
    path: ROUTES.SYSTEM_CONFIG,
    icon: 'gear',
    permissions: [PERMISSION_IDS.VIEW_ALL_GLOBAL_FIELDS], // View All Global Fields
  },
  {
    id: 'academic-dashboard',
    label: 'Academic Dashboard',
    path: '/academic/dashboard',
    icon: 'house',
    roleOnly: ['ACADEMIC_DEPARTMENT'],
  },
  {
    id: 'trainee-dashboard',
    label: 'Trainee Dashboard',
    path: '/trainee/dashboard',
    icon: 'house',
    roleOnly: ['TRAINEE'],
  },
  {
    id: 'enrolled-courses',
    label: 'Enrolled Courses',
    path: ROUTES.COURSES_ENROLLED,
    icon: 'book',
    roleOnly: ['TRAINEE'],
  },
  {
    id: 'all-assessments',
    label: 'All Assessment Events',
    path: ROUTES.ASSESSMENTS_MY_ASSESSMENTS,
    icon: 'checkCircle',
    roleOnly: ['TRAINEE'],
    children: [
      {
        id: 'your-assessments',
        label: 'Your Assessment Events',
        path: ROUTES.ASSESSMENTS_MY_ASSESSMENTS,
        roleOnly: ['TRAINEE'],
      },
      {
        id: 'signature-required',
        label: 'Signature Required Forms',
        path: ROUTES.ASSESSMENTS_SIGNATURE_REQUIRED,
        roleOnly: ['TRAINEE'],
      },
    ],
  },
  {
    id: 'create-issue',
    label: 'Issue Reporting',
    path: ROUTES.REPORTS_CREATE,
    icon: 'fileEarmarkText',
    permissions: [PERMISSION_IDS.VIEW_SUBMITTED_REPORTS], // View Submitted Reports
  },
  {
    id: 'assigned-assessments',
    label: 'Assigned Assessment Events',
    path: ROUTES.ASSESSMENTS_UPCOMING,
    icon: 'clock',
    roleOnly: ['TRAINER'],
  },
  {
    id: 'instructed-courses',
    label: 'Assigned Courses',
    path: ROUTES.COURSES_INSTRUCTED,
    icon: 'book',
    roleOnly: ['TRAINER'],
  },
  {
    id: 'department-dashboard',
    label: 'Department Dashboard',
    path: '/department-head/dashboard',
    icon: 'building',
    roleOnly: ['DEPARTMENT_HEAD'],
  },
  {
    id: 'assessment-review-requests',
    label: 'Assessment Review Requests',
    path: ROUTES.DEPARTMENT_REVIEW_REQUESTS,
    icon: 'clipboardCheck',
    roleOnly: ['DEPARTMENT_HEAD'],
  },
  {
    id: 'incidents-feedback',
    label: 'Incidents / Feedback Reports',
    path: ROUTES.REPORTS,
    icon: 'exclamationTriangle',
    permissions: [
      PERMISSION_IDS.VIEW_ALL_INCIDENT_FEEDBACK_REPORT,
      PERMISSION_IDS.ACKNOWLEDGE_INCIDENT_REPORTS,
    ],
    requireAll: true,
  },
];

export const getAllNavItems = () => NAV_ITEMS;

const userHasRequiredPermissions = (item, hasPermission) => {
  if (!item.permissions || item.permissions.length === 0) {
    return true;
  }
  if (item.requireAll) {
    return item.permissions.every((code) => hasPermission(code));
  }
  return item.permissions.some((code) => hasPermission(code));
};

const userFailsExcludePermissions = (item, hasPermission) => {
  if (!item.excludePermissions || item.excludePermissions.length === 0) {
    return false;
  }
  return item.excludePermissions.some((code) => hasPermission(code));
};

const filterNavItems = (items, user, hasPermission) => {
  return items.reduce((acc, item) => {
    // Role-only gating (used only when item has no PERM defined)
    if (item.roleOnly && !hasRole(user, item.roleOnly)) {
      return acc;
    }

    // Exclude when user has any of the exclude permissions
    if (userFailsExcludePermissions(item, hasPermission)) {
      return acc;
    }

    // Permission check
    let hasAccess;
    if (item.customPermissionLogic) {
      hasAccess = item.customPermissionLogic(hasPermission);
    } else {
      hasAccess = userHasRequiredPermissions(item, hasPermission);
    }

    // Children
    let children = [];
    if (item.children && item.children.length > 0) {
      children = filterNavItems(item.children, user, hasPermission);
    }

    // Decide if parent should be visible
    const shouldInclude =
      hasAccess ||
      children.length > 0 ||
      (!item.permissions && !item.customPermissionLogic && (!item.children || item.children.length === 0));

    if (!shouldInclude) {
      return acc;
    }

    acc.push({
      ...item,
      children,
    });

    return acc;
  }, []);
};

export const getAccessibleNavItems = (user, hasPermission) => {
  return filterNavItems(NAV_ITEMS, user, hasPermission);
};

/**
 * Get the first accessible navigation item path
 * This is used for redirecting users to their first accessible page
 * 
 * @param {Object} user - User object from AuthContext
 * @param {Function} hasPermission - Function to check if user has a permission
 * @param {string} fallbackPath - Fallback path if no accessible items found (default: '/dashboard')
 * @returns {string} First accessible navigation item path
 */
export const getFirstAccessibleRoute = (
  user, 
  hasPermission,
  fallbackPath = ROUTES.DASHBOARD
) => {
  // If no user or permissions, return fallback
  if (!user) {
    return fallbackPath;
  }

  // Get accessible navigation items
  const accessibleItems = getAccessibleNavItems(user, hasPermission);
  
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

export const isAdministrator = (user) => hasRole(user, ['ADMINISTRATOR']);
export const isAcademicDepartment = (user) => hasRole(user, ['ACADEMIC_DEPARTMENT']);
export const isTrainer = (user) => hasRole(user, ['TRAINER']);
export const isDepartmentHead = (user) => hasRole(user, ['DEPARTMENT_HEAD']);
export const isTrainee = (user) => hasRole(user, ['TRAINEE']);