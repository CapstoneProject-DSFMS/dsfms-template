/**
 * UC (Use Case) to Permission Mapping
 * Maps each UC ID to the corresponding permission name(s) from BE response
 * 
 * Structure: Feature Group -> Feature -> UC -> Permissions
 */

export const UC_PERMISSIONS_MAPPING = {
  // ============================================
  // User & Access Management
  // ============================================
  
  // Authentication (UC-01 to UC-03)
  // Note: Authentication typically doesn't require permissions, but included for completeness
  "UC-01": [], // Login - No permission required
  "UC-02": [], // Logout - No permission required
  "UC-03": ["Change Password"], // Reset Password
  
  // User Management (UC-04 to UC-09)
  "UC-04": ["Create User"],
  "UC-05": ["Bulk Create Users"],
  "UC-06": ["View All Users", "View User In Detail", "Update User", "Enable User", "Disable User"], // Manage User
  "UC-07": ["View All Users"],
  "UC-08": ["Update User"],
  "UC-09": ["Enable User", "Disable User"],
  
  // Role Management (UC-10 to UC-14)
  "UC-10": ["Create Role"],
  "UC-11": ["View All Roles", "View Role In Detail", "Update Role", "Enable Role", "Disable Role"], // Manage Roles
  "UC-12": ["View All Roles"],
  "UC-13": ["Update Role"],
  "UC-14": ["Enable Role", "Disable Role"],
  
  // User Profile Management (UC-15 to UC-18)
  "UC-15": ["View My Profile", "Update My Profile", "Change Password"], // Manage Own Profile
  "UC-16": ["View My Profile"],
  "UC-17": ["Update My Profile"], // Configure Signature - uses profile update
  "UC-18": ["Update My Profile", "Change Password"],
  
  // ============================================
  // Academic Management
  // ============================================
  
  // Department Management (UC-19 to UC-23)
  "UC-19": ["Create Department"],
  "UC-20": ["View All Departments", "View Department In Detail", "Update Department", "Enable Department", "Delete Department"], // Manage Departments
  "UC-21": ["View All Departments"],
  "UC-22": ["Update Department"],
  "UC-23": ["Enable Department", "Delete Department"], // Disable/Enable Department
  
  // Course Management (UC-24 to UC-28)
  "UC-24": ["Create Course"],
  "UC-25": ["View All Courses", "View Course In Detail", "Update Course", "Archive Course"], // Manage Courses
  "UC-26": ["View All Courses", "View Course In Detail"],
  "UC-27": ["Update Course"],
  "UC-28": ["Archive Course"],
  
  // Subject Management (UC-29 to UC-34)
  "UC-29": ["Create Bulk Subjects"],
  "UC-30": ["Create Subject"],
  "UC-31": ["List Subjects", "View Subject Detail", "Create Subject", "Update Subject", "Archive Subject"], // Manage Subjects
  "UC-32": ["List Subjects"],
  "UC-33": ["Update Subject"],
  "UC-34": ["Archive Subject"],
  
  // Trainee Enrollment (UC-35 to UC-38)
  "UC-35": ["Assign Trainees to Subject"], // Enroll Trainee
  "UC-36": ["View Trainee Subject Enrollments", "Assign Trainees to Subject", "Remove Trainee from Subject"], // Manage Trainee Enrollment
  "UC-37": ["View Trainee Subject Enrollments"],
  "UC-38": ["Remove Trainee from Subject", "Remove Subject Enrollments"],
  
  // ============================================
  // Template & Form Management
  // ============================================
  
  // Template Management (UC-39 to UC-47)
  "UC-39": ["Create Template"],
  "UC-40": ["Edit Template Basics", "Refresh Draft Template"], // Edit Draft Template
  "UC-41": ["Resubmit Rejected Template"], // Submit Template
  "UC-42": ["Delete Template"], // Delete Draft Template - Note: BE might use different name
  "UC-43": ["View All Templates", "View Template Details", "Update Template Status", "Create Template Version"], // Manage Template
  "UC-44": ["Create Template Version"], // Update Template Version
  "UC-45": ["Update Template Status"], // Disable/Enable Template
  "UC-46": ["Approve or Reject Template"],
  "UC-47": ["Download Content PDF", "Download Configuration PDF"], // Download Template As PDF
  
  // Assessment Forms Management (UC-48 to UC-52)
  "UC-48": ["Create Assessment"], // Create Assessment Form
  "UC-49": ["List Assessment Events", "List Department Assessments", "List Course Assessments", "List Subject Assessments"], // Manage Assessment Forms
  "UC-50": ["Update Assessment Event"],
  "UC-51": ["List My Assessment Events", "List Assessment Events"], // View All Assessment Forms
  "UC-52": ["Update Assessment Event"], // Archive Assessment Form - might need separate permission
  
  // ============================================
  // Assessment Process
  // ============================================
  
  // Assessment Execution (UC-53 to UC-56)
  "UC-53": ["List Assessments", "View Assessment Details"], // View All Assessments
  "UC-54": ["Save Section Values"], // Fill and Save Assessment Draft
  "UC-55": ["Confirm Trainee Participation"], // Sign Confirm Assessment
  "UC-56": ["Submit Assessment"],
  
  // Assessment Results Approval (UC-57 to UC-59)
  "UC-57": ["Approve or Reject Assessment"],
  "UC-58": ["List Assessments"], // View All Assessment Requests
  "UC-59": ["View Assessment Details", "Download Assessment Result"], // View All Assessment Results
  
  // ============================================
  // Reporting & Analytics
  // ============================================
  
  // Incident Reporting (UC-60 to UC-64)
  "UC-60": ["List All Reports", "Respond to Report", "Acknowledge Report Receipt"], // Manage All Incident/Feedback Report
  "UC-61": ["List All Reports", "List My Reports", "View Report Detail"], // View All Incident/Feedback Report
  "UC-62": ["Submit Report Request"],
  "UC-63": ["Cancel Report"],
  "UC-64": ["View Report Detail", "Respond to Report", "Acknowledge Report Receipt"], // Review Incident/Feedback Report
  
  // Analytics Dashboard (UC-65)
  "UC-65": ["Academic Overview Dashboard"], 
  
  // ============================================
  // System Management
  // ============================================
  
  // System Configuration (UC-66 to UC-70)
  "UC-66": ["Create Global Field"], 
  "UC-67": ["List Global Fields", "View Global Field In Detail", "Update Global Field", "Delete Global Field"], // Manage Global Fields
  "UC-68": ["List Global Fields"],
  "UC-69": ["Update Global Field"],
  "UC-70": ["Delete Global Field"], 
};

/**
 * Reverse mapping: Permission Name -> UC_IDs
 * Useful for finding which UC(s) a permission belongs to
 */
export const PERMISSION_TO_UC = (() => {
  const mapping = {};
  Object.entries(UC_PERMISSIONS_MAPPING).forEach(([ucId, permissions]) => {
    permissions.forEach(permission => {
      if (!mapping[permission]) {
        mapping[permission] = [];
      }
      mapping[permission].push(ucId);
    });
  });
  return mapping;
})();

/**
 * Feature Group to Permissions mapping
 * Groups permissions by Feature Group and Feature
 */
export const FEATURE_GROUP_PERMISSIONS = {
  "User & Access Management": {
    "Authentication": {
      permissions: [],
      ucs: ["UC-01", "UC-02", "UC-03"]
    },
    "User Management": {
      permissions: [
        "Create User",
        "Bulk Create Users",
        "View All Users",
        "View User In Detail",
        "Update User",
        "Enable User",
        "Disable User"
      ],
      ucs: ["UC-04", "UC-05", "UC-06", "UC-07", "UC-08", "UC-09"]
    },
    "Role Management": {
      permissions: [
        "Create Role",
        "View All Roles",
        "View Role In Detail",
        "Update Role",
        "Enable Role",
        "Disable Role"
      ],
      ucs: ["UC-10", "UC-11", "UC-12", "UC-13", "UC-14"]
    },
    "User Profile Management": {
      permissions: [
        "View My Profile",
        "Update My Profile",
        "Change Password"
      ],
      ucs: ["UC-15", "UC-16", "UC-17", "UC-18"]
    }
  },
  "Academic Management": {
    "Department Management": {
      permissions: [
        "Create Department",
        "View All Departments",
        "View Department In Detail",
        "Update Department",
        "Enable Department",
        "Delete Department"
      ],
      ucs: ["UC-19", "UC-20", "UC-21", "UC-22", "UC-23"]
    },
    "Course Management": {
      permissions: [
        "Create Course",
        "View All Courses",
        "View Course In Detail",
        "Update Course",
        "Archive Course"
      ],
      ucs: ["UC-24", "UC-25", "UC-26", "UC-27", "UC-28"]
    },
    "Subject Management": {
      permissions: [
        "Create Subject",
        "Create Bulk Subjects",
        "List Subjects",
        "View Subject Detail",
        "Update Subject",
        "Archive Subject"
      ],
      ucs: ["UC-29", "UC-30", "UC-31", "UC-32", "UC-33", "UC-34"]
    },
    "Trainee Enrollment": {
      permissions: [
        "Assign Trainees to Subject",
        "View Trainee Subject Enrollments",
        "Remove Trainee from Subject",
        "Remove Subject Enrollments"
      ],
      ucs: ["UC-35", "UC-36", "UC-37", "UC-38"]
    }
  },
  "Template & Form Management": {
    "Template Management": {
      permissions: [
        "Create Template",
        "Edit Template Basics",
        "Refresh Draft Template",
        "Resubmit Rejected Template",
        "View All Templates",
        "View Template Details",
        "Create Template Version",
        "Update Template Status",
        "Approve or Reject Template",
        "Download Content PDF",
        "Download Configuration PDF"
      ],
      ucs: ["UC-39", "UC-40", "UC-41", "UC-42", "UC-43", "UC-44", "UC-45", "UC-46", "UC-47"]
    },
    "Assessment Forms Management": {
      permissions: [
        "Create Assessment",
        "Create Bulk Assessments",
        "List Assessment Events",
        "List Department Assessments",
        "List Course Assessments",
        "List Subject Assessments",
        "List My Assessment Events",
        "Update Assessment Event",
        "Toggle Trainee Lock"
      ],
      ucs: ["UC-48", "UC-49", "UC-50", "UC-51", "UC-52"]
    }
  },
  "Assessment Process": {
    "Assessment Execution": {
      permissions: [
        "List Assessments",
        "View Assessment Details",
        "View Assessment Sections",
        "View Section Fields",
        "Save Section Values",
        "Submit Assessment",
        "Confirm Trainee Participation",
        "View Trainee Sections",
        "Download Assessment Result"
      ],
      ucs: ["UC-53", "UC-54", "UC-55", "UC-56"]
    },
    "Assessment Results Approval": {
      permissions: [
        "Approve or Reject Assessment",
        "List Assessments",
        "View Assessment Details",
        "Download Assessment Result"
      ],
      ucs: ["UC-57", "UC-58", "UC-59"]
    }
  },
  "Reporting & Analytics": {
    "Incident Reporting": {
      permissions: [
        "List All Reports",
        "List My Reports",
        "View Report Detail",
        "Submit Report Request",
        "Cancel Report",
        "Respond to Report",
        "Acknowledge Report Receipt"
      ],
      ucs: ["UC-60", "UC-61", "UC-62", "UC-63", "UC-64"]
    },
    "Analytics Dashboard": {
      permissions: [
        "Academic Overview Dashboard"
      ],
      ucs: ["UC-65"]
    }
  },
  "System Management": {
    "System Configuration": {
      permissions: [
        "Create Global Field",
        "List Global Fields",
        "View Global Field In Detail",
        "View All Global Fields In Detail",
        "Update Global Field",
        "Delete Global Field",
        "View Global Field"
      ],
      ucs: ["UC-66", "UC-67", "UC-68", "UC-69", "UC-70"]
    }
  }
};

/**
 * Get permissions for a specific UC
 * @param {string} ucId - UC ID (e.g., "UC-01")
 * @returns {string[]} Array of permission names
 */
export const getPermissionsForUC = (ucId) => {
  return UC_PERMISSIONS_MAPPING[ucId] || [];
};

/**
 * Get UC IDs for a specific permission
 * @param {string} permissionName - Permission name from BE
 * @returns {string[]} Array of UC IDs
 */
export const getUCsForPermission = (permissionName) => {
  return PERMISSION_TO_UC[permissionName] || [];
};

/**
 * Get all permissions for a feature group
 * @param {string} featureGroup - Feature group name
 * @returns {string[]} Array of all permission names in the feature group
 */
export const getPermissionsForFeatureGroup = (featureGroup) => {
  const group = FEATURE_GROUP_PERMISSIONS[featureGroup];
  if (!group) return [];
  
  const allPermissions = new Set();
  Object.values(group).forEach(feature => {
    if (feature.permissions) {
      feature.permissions.forEach(perm => allPermissions.add(perm));
    }
  });
  return Array.from(allPermissions);
};

/**
 * Get all permissions for a specific feature
 * @param {string} featureGroup - Feature group name
 * @param {string} feature - Feature name
 * @returns {string[]} Array of permission names
 */
export const getPermissionsForFeature = (featureGroup, feature) => {
  const group = FEATURE_GROUP_PERMISSIONS[featureGroup];
  if (!group || !group[feature]) return [];
  return group[feature].permissions || [];
};

