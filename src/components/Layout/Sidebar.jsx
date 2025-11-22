import React, { useState, useEffect, useRef, useMemo } from "react";
import { Nav, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  People,
  Shield,
  Building,
  FileText,
  Airplane,
  ChevronLeft,
  ChevronRight,
  Gear,
  X,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  PersonCheck,
  ExclamationTriangle,
  ChatDots,
  FileEarmarkText,
  CalendarEvent,
  CheckCircle,
  Book,
  ClipboardCheck,
  Clock,
  List,
} from "react-bootstrap-icons";
import logo from "../../assets/logo-light.png";
import { usePermissions } from "../../hooks/usePermissions";
import { getNavigationPermission } from "../../constants/navigationPermissions";
import { useAuth } from "../../hooks/useAuth";
import useDepartmentManagement from "../../hooks/useDepartmentManagement";
import { PERMISSION_IDS } from "../../constants/permissionIds";
import { ROUTES } from "../../constants/routes";

const Sidebar = ({ collapsed, onClose }) => {
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user has Academic Dashboard permission (replaces role check)
  const hasAcademicDashboard = hasPermission(PERMISSION_IDS.ACADEMIC_OVERVIEW_DASHBOARD);
  
  // Helper function to check if user is Administrator
  const isAdministrator = () => {
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
  
  // Helper function to check if user is Academic Department
  const isAcademicDepartment = () => {
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
  
  // Helper function to check if user is Trainer
  const isTrainer = () => {
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
  
  // Helper function to check if user is Department Head
  const isDepartmentHead = () => {
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
  
  // Helper function to check if user is Trainee
  const isTrainee = () => {
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
  
  // Load departments if user has academic dashboard permission
  const { departments, loading: departmentsLoading } = useDepartmentManagement(hasAcademicDashboard);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [isAssessmentDropdownOpen, setIsAssessmentDropdownOpen] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const dropdownRef = useRef(null);
  
  
  // Debug log - Commented out to reduce console noise
  // console.log('🔍 Sidebar - User role:', user?.role);
  // console.log('🔍 Sidebar - User object:', user);
  // console.log('🔍 Sidebar - User permissions:', userPermissions);
  // console.log('🔍 Sidebar - Departments:', departments);
  
  // Filter active departments - Commented out as not used
  // const activeDepartments = departments.filter(dept => dept.status === 'ACTIVE');

  // Check if dropdown is scrollable
  useEffect(() => {
    if (dropdownRef.current && isDepartmentDropdownOpen) {
      const element = dropdownRef.current;
      const isScrollable = element.scrollHeight > element.clientHeight;
      setIsScrollable(isScrollable);
    }
  }, [isDepartmentDropdownOpen, departments]);

  // Filter nav items based on user permissions (PERMISSION-BASED, not role-based)
  // BUT: Administrator and Academic Department roles have role-based filtering to only show items according to UC list
  const navItems = useMemo(() => {
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
    // UC-21: View All Departments → "Department" dropdown (rendered separately, not in navItems)
    // UC-65: View Analytics Dashboard → "academic-dashboard"
    // UC-48-51: Assessment Forms Management → "Assessment Events" (rendered separately, not in navItems)
    const ACADEMIC_DEPT_ALLOWED_ITEMS = [
      // Note: "departments" is NOT included here because Academic Department has its own "Department" dropdown
      // (rendered separately below, not in navItems)
      "academic-dashboard",    // UC-65: View Analytics Dashboard
      // Note: Assessment Events and Department dropdown are rendered separately below, not in navItems
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

    const allNavItems = [
      {
        id: "main-menu",
        label: "Main Menu",
        icon: List,
        path: ROUTES.MAIN_MENU,
        // Main Menu is hardcoded for Administrator role only
        isAdminOnly: true, // Special flag for role-based check
      },
      {
        id: "users",
        label: "User Management",
        icon: People,
        path: ROUTES.USERS,
        // User Management page requires at least ONE of these permissions (UC-06: Manage User)
        // Using permission IDs for accurate checking
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
        icon: Shield,
        path: ROUTES.ROLES,
        permission: PERMISSION_IDS.VIEW_ALL_ROLES,
      },
      {
        id: "departments",
        label: "Departments",
        icon: Building,
        path: ROUTES.DEPARTMENTS,
        permission: PERMISSION_IDS.VIEW_ALL_DEPARTMENTS,
      },
      {
        id: "forms",
        label: "Template List",
        icon: FileText,
        path: ROUTES.TEMPLATES,
        permission: PERMISSION_IDS.VIEW_ALL_TEMPLATES,
      },
      {
        id: "system-config",
        label: "System Configuration",
        icon: Gear,
        path: ROUTES.SYSTEM_CONFIG,
        permission: PERMISSION_IDS.LIST_GLOBAL_FIELDS,
      },
      {
        id: "academic-dashboard",
        label: "Academic Dashboard",
        icon: House,
        path: "/academic/dashboard",
        permission: PERMISSION_IDS.ACADEMIC_OVERVIEW_DASHBOARD,
      },
      {
        id: "trainee-dashboard",
        label: "Trainee Dashboard",
        icon: PersonCheck,
        path: ROUTES.DASHBOARD,
        permission: PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS, // Trainee dashboard requires enrollment view permission
      },
      {
        id: "enrolled-courses",
        label: "Enrolled Course List",
        icon: PersonCheck,
        path: ROUTES.COURSES_ENROLLED,
        permission: PERMISSION_IDS.VIEW_TRAINEE_SUBJECT_ENROLLMENTS,
      },
      {
        id: "all-assessments",
        label: "All Assessments",
        icon: PersonCheck,
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
        icon: PersonCheck,
        path: ROUTES.REPORTS_CREATE,
        permission: PERMISSION_IDS.SUBMIT_REPORT_REQUEST,
      },
      // Trainer Navigation Items
      {
        id: "upcoming-assessments",
        label: "List Upcoming Assessment",
        icon: Clock,
        path: ROUTES.ASSESSMENTS_UPCOMING,
        permission: PERMISSION_IDS.LIST_ASSESSMENTS,
      },
      {
        id: "assessment-results",
        label: "List Assessment Result",
        icon: CheckCircle,
        path: ROUTES.ASSESSMENTS_RESULTS,
        permission: PERMISSION_IDS.LIST_ASSESSMENTS, // ✅ Match với route permission
      },
      {
        id: "instructed-courses",
        label: "List Instructed Course",
        icon: Book,
        path: ROUTES.COURSES_INSTRUCTED,
        permission: PERMISSION_IDS.VIEW_ALL_COURSES,
      },
      // Department Head Navigation Items
      {
        id: "department-dashboard",
        label: "Department Dashboard",
        icon: Building,
        path: "/department-head/dashboard", // Department Head specific dashboard route
        permission: PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL,
      },
      {
        id: "my-department-details",
        label: "My Department Details",
        icon: Book,
        path: ROUTES.DEPARTMENT_MY_DETAILS,
        permission: PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL,
      },
      {
        id: "assessment-review-requests",
        label: "List Assessment Review Requests",
        icon: ClipboardCheck,
        path: ROUTES.DEPARTMENT_REVIEW_REQUESTS,
        permission: PERMISSION_IDS.LIST_ASSESSMENTS,
      },
      // SQA Navigation Items
      {
        id: "issue-list",
        label: "Issue List",
        icon: ExclamationTriangle,
        path: ROUTES.REPORTS_ISSUES,
        permission: PERMISSION_IDS.LIST_ALL_REPORTS,
      },
      {
        id: "feedback-list",
        label: "Feedback List",
        icon: ChatDots,
        path: ROUTES.REPORTS_FEEDBACK,
        permission: PERMISSION_IDS.LIST_ALL_REPORTS,
      },
      {
        id: "template-list",
        label: "Template List",
        icon: FileEarmarkText,
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

    // Filter items based on permissions (with special role-based checks for Admin-only items)
    return allNavItems.filter(item => {
      // ⭐ ROLE-BASED FILTERING FOR ADMINISTRATOR
      // Administrator role: Only show items in ADMINISTRATOR_ALLOWED_ITEMS list
      // This prevents Administrator from seeing items that belong to other roles
      // (even if they have the permissions, according to UC list, they shouldn't see them)
      if (isAdministrator()) {
        // Special case: Main Menu is hardcoded for Administrator role only
        if (item.isAdminOnly) {
          return true;
        }
        // Only show items in the allowed list
        return ADMINISTRATOR_ALLOWED_ITEMS.includes(item.id);
      }
      
      // ⭐ ROLE-BASED FILTERING FOR ACADEMIC DEPARTMENT
      // Academic Department role: Only show items in ACADEMIC_DEPT_ALLOWED_ITEMS list
      // This prevents Academic Department from seeing items that belong to other roles
      // (even if they have the permissions, according to UC list, they shouldn't see them)
      // Example: Academic Dept has LIST_ASSESSMENTS permission but shouldn't see "List Upcoming Assessment" (UC-53: Trainer, Trainee)
      if (isAcademicDepartment()) {
        // Only show items in the allowed list
        return ACADEMIC_DEPT_ALLOWED_ITEMS.includes(item.id);
      }
      
      // ⭐ ROLE-BASED FILTERING FOR TRAINER
      // Trainer role: Only show items in TRAINER_ALLOWED_ITEMS list
      // This prevents Trainer from seeing items that belong to other roles
      // (even if they have the permissions, according to UC list, they shouldn't see them)
      // Example: Trainer has SUBMIT_REPORT_REQUEST permission but shouldn't see "Create Incident/Feedback Report" (UC-62: Trainer, Trainee - but not in Trainer sidebar)
      // Example: Trainer has LIST_ALL_REPORTS permission but shouldn't see "Issue List" and "Feedback List" (UC-60: SQA Auditor)
      if (isTrainer()) {
        // Only show items in the allowed list
        return TRAINER_ALLOWED_ITEMS.includes(item.id);
      }
      
      // ⭐ ROLE-BASED FILTERING FOR DEPARTMENT HEAD
      // Department Head role: Only show items in DEPT_HEAD_ALLOWED_ITEMS list
      // This prevents Department Head from seeing items that belong to other roles
      // (even if they have the permissions, according to UC list, they shouldn't see them)
      // Example: Department Head has VIEW_ALL_COURSES permission but shouldn't see "List Instructed Course" (UC-26: Academic Dept, Dept Head, Trainer - but not in Dept Head sidebar)
      if (isDepartmentHead()) {
        // Only show items in the allowed list
        return DEPT_HEAD_ALLOWED_ITEMS.includes(item.id);
      }
      
      // ⭐ ROLE-BASED FILTERING FOR TRAINEE
      // Trainee role: Only show items in TRAINEE_ALLOWED_ITEMS list
      // This prevents Trainee from seeing items that belong to other roles
      // (even if they have the permissions, according to UC list, they shouldn't see them)
      // Example: Trainee has LIST_ALL_REPORTS permission (UC-61) but shouldn't see "Issue List" and "Feedback List" (UC-60: SQA Auditor)
      if (isTrainee()) {
        // Only show items in the allowed list
        return TRAINEE_ALLOWED_ITEMS.includes(item.id);
      }
      
      // ⭐ PERMISSION-BASED FILTERING FOR OTHER ROLES
      // For non-Administrator, non-Academic Department, non-Trainer, non-Department Head, and non-Trainee roles, check permissions as usual
      
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
      
      // Debug logging to see what's happening
      // Reduced logging: only log when needed for debugging
      // Uncomment if you need to debug sidebar filtering
      // if (process.env.NODE_ENV === 'development') {
      //   if (item.permissions) {
      //     console.log(`🔍 Sidebar Filter - Item: ${item.id}, Permissions: [${item.permissions.join(', ')}], RequireAll: ${item.requireAll}, HasAccess: ${hasAccess}`);
      //   } else {
      //     console.log(`🔍 Sidebar Filter - Item: ${item.id}, Permission: "${item.permission}", HasAccess: ${hasAccess}`);
      //   }
      // }
      
      // Also check children permissions if item has children
      if (item.children && item.children.length > 0) {
        const hasChildAccess = item.children.some(child => {
          // Support both single permission and multiple permissions
          if (child.permissions && child.permissions.length > 0) {
            return hasAnyPermission(child.permissions);
          } else if (child.permission) {
            return hasPermission(child.permission);
          }
          return true; // No permission required
        });
        
        // Show parent if user has access to parent OR any child
        return hasAccess || hasChildAccess;
      }
      
      return hasAccess;
    }).map(item => {
      // Filter children based on permissions
      // Special case: For "all-assessments", if parent is visible (passed role-based and permission filtering),
      // keep all children since they all use the same permissions
      if (item.id === 'all-assessments' && item.children && item.children.length > 0) {
        // If parent is visible, all children should be visible too (they share the same permissions)
        // Since parent already passed permission check, keep ALL children (they all have same permissions as parent)
        // Don't filter children - if parent is visible, children should be visible too
        const filteredChildren = item.children; // Keep all children since parent passed filter
        
        // Debug log for all-assessments children
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 All Assessments - Parent permissions:', item.permissions || [item.permission]);
          console.log('🔍 All Assessments - Original children count:', item.children.length);
          console.log('🔍 All Assessments - Keeping all children (parent passed filter)');
          console.log('🔍 All Assessments - Children:', filteredChildren.map(c => ({ id: c.id, label: c.label, permissions: c.permissions || [c.permission] })));
        }
        
        return {
          ...item,
          children: filteredChildren
        };
      }
      
      // For other items, filter children normally
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: item.children.filter(child => {
            // Support both single permission and multiple permissions
            if (child.permissions && child.permissions.length > 0) {
              return hasAnyPermission(child.permissions);
            } else if (child.permission) {
              return hasPermission(child.permission);
            }
            return true; // No permission required
          })
        };
      }
      return item;
    });
      }, [hasPermission, hasAnyPermission, user?.role, isAdministrator, isAcademicDepartment, isTrainer, isDepartmentHead, isTrainee]);

  // Debug log after navItems is initialized - Commented out to reduce console noise
  // console.log('🔍 Sidebar - Filtered navItems:', navItems);
  // console.log('🔍 Sidebar - Dashboard permission check:', {
  //   permission: API_PERMISSIONS.DASHBOARD.VIEW,
  //   hasPermission: hasPermission(API_PERMISSIONS.DASHBOARD.VIEW),
  //   hasModuleAccess: hasModuleAccess('DASHBOARD'),
  //   userRole: user?.role,
  //   userPermissions: userPermissions?.map(p => p.name).filter(name => name.includes('dashboard') || name.includes('DASHBOARD'))
  // });
  // 
  // // Debug TRAINEE permissions
  // console.log('🔍 Sidebar - TRAINEE permissions check:', {
  //   userRole: user?.role,
  //   TRAINEES_VIEW_DETAIL: {
  //     permission: API_PERMISSIONS.TRAINEES.VIEW_DETAIL,
  //     hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_DETAIL)
  //   },
  //   TRAINEES_VIEW_COURSES: {
  //     permission: API_PERMISSIONS.TRAINEES.VIEW_COURSES,
  //     hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_COURSES)
  //   },
  //   TRAINEES_VIEW_ASSESSMENTS: {
  //     permission: API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS,
  //     hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS)
  //   },
  //   TRAINEES_VIEW_ALL: {
  //     permission: API_PERMISSIONS.TRAINEES.VIEW_ALL,
  //     hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_ALL)
  //   },
  //   allUserPermissions: userPermissions?.map(p => p.name)
  // });

  return (
    <div
      className={`bg-primary-custom text-white d-flex flex-column transition-all ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
      style={{
        width: collapsed ? "60px" : "260px",
        minHeight: "100vh",
        transition: "width 0.3s ease",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        overflowY: "hidden",
        overflowX: "hidden",
        zIndex: 1000,
        flexShrink: 0,
      }}
    >
      {/* Logo/Brand */}
      <div className="p-3 border-bottom border-secondary bg-gradient-primary-custom position-relative">
        <div className="d-flex align-items-center justify-content-center">
          {!collapsed && (
            <>
              <img
                src={logo}
                alt="Logo"
                style={{ width: "50%", marginRight: "0px" }}
              />
            </>
          )}
          {collapsed && (
            <div>
              <Airplane size={24} />
            </div>
          )}
        </div>
        
        {/* Mobile close button */}
        {onClose && (
          <Button
            variant="link"
            className="position-absolute top-0 end-0 text-white p-2 d-md-none"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent' }}
          >
            <X size={20} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <Nav className="flex-column flex-grow-1 p-3 bg-gradient-primary-custom">
        {/* Regular nav items */}
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          // Debug logging
          // console.log(`🔍 Sidebar - Item: ${item.id}, Path: ${item.path}, Current: ${location.pathname}, Active: ${isActive}`); // Commented out to reduce console noise
          
          // Special handling for All Assessments dropdown
          // Show assessment dropdown if user has List Assessments permission
          // For Trainee: check "GET /assessments/user-events", for other roles: check LIST_ASSESSMENTS UUID
          let hasListAssessmentsPermission = false;
          if (item.id === 'all-assessments') {
            if (item.permissions && item.permissions.length > 0) {
              // Check if user has ANY of the permissions (for Trainee: "GET /assessments/user-events", for others: LIST_ASSESSMENTS UUID)
              hasListAssessmentsPermission = hasAnyPermission(item.permissions);
            } else if (item.permission) {
              // Fallback to single permission check
              hasListAssessmentsPermission = hasPermission(item.permission);
            }
          }
          
          // Debug log for permission check
          if (item.id === 'all-assessments' && process.env.NODE_ENV === 'development') {
            console.log('🔍 All Assessments Permission Check:', {
              itemId: item.id,
              permissions: item.permissions || [item.permission],
              hasPermission: hasListAssessmentsPermission,
              hasChildren: !!item.children,
              childrenCount: item.children?.length || 0,
              children: item.children?.map(c => ({ id: c.id, label: c.label, permissions: c.permissions || [c.permission] })) || []
            });
          }
          
          if (item.id === 'all-assessments' && hasListAssessmentsPermission) {
            // Debug log for dropdown rendering
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 Rendering All Assessments dropdown:', {
                itemId: item.id,
                hasChildren: !!item.children,
                childrenCount: item.children?.length || 0,
                children: item.children?.map(c => ({ id: c.id, label: c.label, permission: c.permission })) || [],
                isDropdownOpen: isAssessmentDropdownOpen,
                collapsed: collapsed
              });
            }
            
            return (
              <Nav.Item key={item.id} className="mb-3">
                <div className="position-relative">
                  {/* Assessment dropdown trigger */}
                  <div
                    className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${collapsed ? "justify-content-center" : ""} ${location.pathname.startsWith('/trainee/signature-required') || location.pathname.startsWith('/trainee/completion-required') || location.pathname.startsWith('/trainee/your-assessments') ? "active" : ""}`}
                    style={{
                      minHeight: collapsed ? "48px" : "auto",
                      backgroundColor: location.pathname.startsWith('/trainee/signature-required') || location.pathname.startsWith('/trainee/completion-required') || location.pathname.startsWith('/trainee/your-assessments') ? "rgba(255, 255, 255, 0.1)" : "transparent",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      if (collapsed) {
                        navigate(ROUTES.ASSESSMENTS_MY_ASSESSMENTS);
                        onClose();
                      } else {
                        setIsAssessmentDropdownOpen(!isAssessmentDropdownOpen);
                      }
                    }}
                  >
                    <IconComponent
                      size={20}
                      className={collapsed ? "me-2" : "me-3"}
                      style={{
                        display: "inline-block",
                        flexShrink: 0,
                        transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
                      }}
                    />
                    {!collapsed && (
                      <>
                        <span className="sidebar-nav-label flex-grow-1" style={{ overflowWrap: 'break-word', lineHeight: '1.2' }}>{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={`ms-auto transition-transform ${isAssessmentDropdownOpen ? "rotate-180" : ""}`}
                          style={{
                            transition: "transform 0.3s ease"
                          }}
                        />
                      </>
                    )}
                  </div>

                  {/* All Assessments dropdown menu */}
                  {!collapsed && isAssessmentDropdownOpen && item.children && item.children.length > 0 && (
                    <div className="mt-2 ms-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.path}
                          className="sidebar-nav-link text-white d-flex align-items-center py-2 pe-1 rounded nav-link"
                          style={{
                            backgroundColor: location.pathname === child.path ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            whiteSpace: 'normal',
                            overflowWrap: 'break-word'
                          }}
                          onClick={onClose}
                        >
                          <span className="sidebar-nav-label">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {/* Debug: Show message if no children */}
                  {!collapsed && isAssessmentDropdownOpen && (!item.children || item.children.length === 0) && (
                    <div className="mt-2 ms-4 text-white-50 small">
                      No children available
                    </div>
                  )}
                </div>
              </Nav.Item>
            );
          }
          
          // Regular nav items
          return (
            <Nav.Item key={item.id} className="mb-3">
              <Link
                to={item.path}
                className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${collapsed ? "justify-content-center" : ""} ${isActive ? "active" : ""}`}
                style={{
                  minHeight: collapsed ? "48px" : "auto",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  whiteSpace: collapsed ? 'nowrap' : 'normal',
                  overflowWrap: collapsed ? 'normal' : 'break-word'
                }}
                onClick={() => {
                  // console.log(`🔍 Sidebar - Clicked on: ${item.id}, navigating to: ${item.path}`);
                  // console.log(`🔍 Sidebar - Current location:`, window.location.href);
                  // console.log(`🔍 Sidebar - Current pathname:`, window.location.pathname);
                  onClose(); // Close sidebar on mobile when link is clicked
                }}
              >
                <IconComponent
                  size={20}
                  className={collapsed ? "me-2" : "me-3"}
                  style={{
                    display: "inline-block",
                    flexShrink: 0,
                    transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
                  }}
                />
                {!collapsed && <span className="sidebar-nav-label" style={{ overflowWrap: 'break-word', lineHeight: '1.2' }}>{item.label}</span>}
              </Link>
            </Nav.Item>
          );
        })}

        {/* Assessment Event - Academic Department */}
        {/* ⭐ Administrator role: Do not show Academic Department items */}
        {!isAdministrator() && hasAcademicDashboard && (
          <Nav.Item className="mb-3">
            <Link
              to={ROUTES.ASSESSMENT_EVENTS}
              className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${collapsed ? "justify-content-center" : ""} ${location.pathname === ROUTES.ASSESSMENT_EVENTS ? "active" : ""}`}
              style={{
                minHeight: collapsed ? "48px" : "auto",
                backgroundColor: location.pathname === ROUTES.ASSESSMENT_EVENTS ? "rgba(255, 255, 255, 0.1)" : "transparent",
                whiteSpace: collapsed ? 'nowrap' : 'normal',
                overflowWrap: collapsed ? 'normal' : 'break-word'
              }}
              onClick={() => {
                onClose();
              }}
            >
              <CalendarEvent
                size={20}
                className={collapsed ? "me-2" : "me-3"}
                style={{
                  display: "inline-block",
                  flexShrink: 0,
                  transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
                }}
              />
              {!collapsed && <span className="sidebar-nav-label" style={{ overflowWrap: 'break-word', lineHeight: '1.2' }}>Assessment Event</span>}
            </Link>
          </Nav.Item>
        )}

        {/* Department dropdown */}
        {/* ⭐ Administrator role: Do not show Academic Department items */}
        {!isAdministrator() && hasAcademicDashboard && (
          <Nav.Item className="mb-3">
            <div className="position-relative">
              {/* Department dropdown trigger */}
              <div
                className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${collapsed ? "justify-content-center" : ""} ${location.pathname.startsWith('/academic/departments') ? "active" : ""}`}
                style={{
                  minHeight: collapsed ? "48px" : "auto",
                  backgroundColor: location.pathname.startsWith('/academic/departments') ? "rgba(255, 255, 255, 0.1)" : "transparent",
                }}
              >
                <Building
                  size={20}
                  className={collapsed ? "me-2" : "me-3"}
                  style={{
                    display: "inline-block",
                    flexShrink: 0,
                    transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
                  }}
                />
                {!collapsed && (
                  <>
                    <span 
                      className="sidebar-nav-label flex-grow-1"
                      style={{ cursor: "pointer", overflowWrap: 'break-word', lineHeight: '1.2' }}
                      onClick={() => {
                        setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen);
                        navigate('/academic/departments'); // Keep old route for now (academic-specific)
                      }}
                    >
                      Department
                    </span>
                    <ChevronDown
                      size={16}
                      className="ms-auto"
                      style={{
                        transition: "transform 0.3s ease",
                        cursor: "pointer",
                        transform: isDepartmentDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
                      }}
                      onClick={() => {
                        setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen);
                      }}
                    />
                  </>
                )}
              </div>

              {/* Department dropdown menu */}
              {!collapsed && isDepartmentDropdownOpen && (
                <div 
                  ref={dropdownRef}
                  className={`position-absolute start-0 end-0 mt-1 sidebar-department-dropdown ${isScrollable ? 'scrollable' : ''}`}
                  style={{
                    zIndex: 1000,
                    maxHeight: "300px",
                    overflowY: "auto"
                  }}
                >
                  {/* Individual departments */}
                  {departmentsLoading ? (
                    <div className="px-3 py-2 text-white-50 sidebar-department-loading">
                      <small>Loading departments...</small>
                    </div>
                  ) : departments.length > 0 ? (
                    departments.map((dept) => (
                      <Link
                        key={dept.id}
                        to={`/academic/course/${dept.id}`}
                        className={`d-block px-3 py-2 text-white text-decoration-none d-flex align-items-center sidebar-department-item ${location.pathname === `/academic/course/${dept.id}` ? 'active' : ''}`}
                        style={{
                          fontSize: "0.875rem",
                          backgroundColor: location.pathname === `/academic/course/${dept.id}` ? "rgba(255, 255, 255, 0.15)" : "transparent",
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        onClick={() => {
                          // Không đóng dropdown, chỉ đóng sidebar trên mobile
                          onClose && onClose();
                        }}
                      >
                        <ChevronRight size={12} className="me-2 sidebar-department-chevron" />
                        {dept.code}
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-white-50">
                      <small>No departments found</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Nav.Item>
        )}
      </Nav>
    </div>
  );
};

export default Sidebar;
