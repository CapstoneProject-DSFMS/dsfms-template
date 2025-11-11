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
import { API_PERMISSIONS } from "../../constants/apiPermissions";
import { useAuth } from "../../hooks/useAuth";
import useDepartmentManagement from "../../hooks/useDepartmentManagement";

const Sidebar = ({ collapsed, onClose }) => {
  const { hasModuleAccess, hasPermission } = usePermissions();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Normalize role name - handle both string and object, and different variants
  // This is used throughout the component for role checks
  // Normalize: convert space to underscore, uppercase, and handle both variants
  const rawRoleName = typeof user?.role === 'string' 
    ? user.role 
    : (user?.role?.name || '');
  
  // Normalize role name: 'ACADEMIC DEPARTMENT' -> 'ACADEMIC_DEPARTMENT'
  // Also handle 'ACADEMIC_DEPT' -> 'ACADEMIC_DEPARTMENT'
  const userRoleName = rawRoleName
    .toUpperCase()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
  
  // Check if user is Academic Department role (handle variants)
  const isAcademicRole = userRoleName === 'ACADEMIC_DEPARTMENT' || 
                        userRoleName === 'ACADEMIC_DEPT' ||
                        userRoleName.startsWith('ACADEMIC');
  
  // Only load departments for ACADEMIC_DEPARTMENT role (handle both variants)
  const { departments, loading: departmentsLoading } = useDepartmentManagement(isAcademicRole);
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

  // Filter nav items based on user permissions and role
  const navItems = useMemo(() => {
    // Re-normalize role name inside useMemo to ensure consistency
    const rawRoleName = typeof user?.role === 'string' 
      ? user.role 
      : (user?.role?.name || '');
    
    const normalizedRoleName = rawRoleName
      .toUpperCase()
      .replace(/\s+/g, '_')
      .trim();
    
    const allNavItems = [
      {
        id: "main-menu",
        label: "Main Menu",
        icon: List,
        path: "/admin/main-menu",
        permission: null, // No specific permission, will check individual actions
        module: "ADMIN"
      },
      {
        id: "users",
        label: "User Management",
        icon: People,
        path: "/admin/users",
        permission: API_PERMISSIONS.USERS.VIEW_ALL,
        module: "USERS"
      },
      {
        id: "roles",
        label: "Role Management",
        icon: Shield,
        path: "/admin/roles",
        permission: API_PERMISSIONS.ROLES.VIEW_ALL,
        module: "ROLES"
      },
      {
        id: "departments",
        label: "Departments",
        icon: Building,
        path: "/admin/departments",
        permission: API_PERMISSIONS.DEPARTMENTS.VIEW_ALL,
        module: "DEPARTMENTS"
      },
      {
        id: "forms",
        label: "Template List",
        icon: FileText,
        path: "/admin/forms",
        permission: API_PERMISSIONS.TEMPLATES.VIEW_ALL,
        module: "TEMPLATES"
      },
      {
        id: "system-config",
        label: "System Configuration",
        icon: Gear,
        path: "/admin/system-config",
        permission: API_PERMISSIONS.GLOBAL_FIELDS.VIEW_ALL,
        module: "GLOBAL_FIELDS"
      },
      {
        id: "academic-dashboard",
        label: "Academic Dashboard",
        icon: House,
        path: "/academic/dashboard",
        module: "ACADEMIC"
      },
      {
        id: "trainee-dashboard",
        label: "Trainee Dashboard",
        icon: PersonCheck,
        path: "/trainee/dashboard",
        permission: API_PERMISSIONS.TRAINEES.VIEW_DETAIL,
        module: "TRAINEES"
      },
      {
        id: "enrolled-courses",
        label: "Enrolled Course List",
        icon: PersonCheck,
        path: "/trainee/enrolled-courses",
        permission: API_PERMISSIONS.TRAINEES.VIEW_COURSES,
        module: "TRAINEES"
      },
      {
        id: "all-assessments",
        label: "All Assessments",
        icon: PersonCheck,
        path: "/trainee/all-assessments",
        permission: API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS,
        module: "TRAINEES",
        children: [
          {
            id: "your-assessments",
            label: "Your Assessments",
            path: "/trainee/your-assessments",
            permission: API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS,
            module: "TRAINEES"
          },
          {
            id: "signature-required",
            label: "Signature Required List",
            path: "/trainee/signature-required",
            permission: API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS,
            module: "TRAINEES"
          },
          {
            id: "completion-required",
            label: "Section Completion Required List",
            path: "/trainee/completion-required",
            permission: API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS,
            module: "TRAINEES"
          }
        ]
      },
      {
        id: "create-issue",
        label: "Create Incident/Feedback Report",
        icon: PersonCheck,
        path: "/trainee/create-incident-feedback-report",
        permission: API_PERMISSIONS.TRAINEES.VIEW_ALL,
        module: "TRAINEES"
      },
      // Trainer Navigation Items
      {
        id: "upcoming-assessments",
        label: "List Upcoming Assessment",
        icon: Clock,
        path: "/trainer/upcoming-assessments",
        permission: API_PERMISSIONS.ASSESSMENTS.VIEW_ALL,
        module: "TRAINER"
      },
      {
        id: "assessment-results",
        label: "List Assessment Result",
        icon: CheckCircle,
        path: "/trainer/assessment-results",
        permission: API_PERMISSIONS.ASSESSMENTS.VIEW_RESULTS,
        module: "TRAINER"
      },
      {
        id: "instructed-courses",
        label: "List Instructed Course",
        icon: Book,
        path: "/trainer/instructed-courses",
        permission: API_PERMISSIONS.COURSES.VIEW_ALL,
        module: "TRAINER"
      },
      // Department Head Navigation Items
      {
        id: "department-dashboard",
        label: "Department Dashboard",
        icon: Building,
        path: "/department-head/dashboard",
        module: "DEPARTMENT_HEAD"
      },
      {
        id: "my-department-details",
        label: "My Department Details",
        icon: Book,
        path: "/department-head/my-department-details",
        permission: API_PERMISSIONS.DEPARTMENTS.VIEW_DETAIL,
        module: "DEPARTMENT_HEAD"
      },
      {
        id: "assessment-review-requests",
        label: "List Assessment Review Requests",
        icon: ClipboardCheck,
        path: "/department-head/assessment-review-requests",
        permission: API_PERMISSIONS.ASSESSMENTS.VIEW_ALL,
        module: "DEPARTMENT_HEAD"
      },
      // SQA Navigation Items
      {
        id: "issue-list",
        label: "Issue List",
        icon: ExclamationTriangle,
        path: "/sqa/issues",
        permission: API_PERMISSIONS.SQA.VIEW_TEMPLATES,
        module: "SQA"
      },
      {
        id: "feedback-list",
        label: "Feedback List",
        icon: ChatDots,
        path: "/sqa/feedback",
        permission: API_PERMISSIONS.SQA.VIEW_TEMPLATES,
        module: "SQA"
      },
      {
        id: "template-list",
        label: "Template List",
        icon: FileEarmarkText,
        path: "/sqa/templates",
        permission: API_PERMISSIONS.SQA.VIEW_TEMPLATES,
        module: "SQA",
        children: [
          {
            id: "template-history",
            label: "List History Version",
            path: "/sqa/templates/history",
            permission: API_PERMISSIONS.SQA.VIEW_TEMPLATE_DETAIL,
            module: "SQA"
          },
          {
            id: "template-sections",
            label: "Section List",
            path: "/sqa/templates/sections",
            permission: API_PERMISSIONS.SQA.VIEW_TEMPLATE_DETAIL,
            module: "SQA"
          },
          {
            id: "template-fields",
            label: "Field List",
            path: "/sqa/templates/fields",
            permission: API_PERMISSIONS.SQA.VIEW_TEMPLATE_DETAIL,
            module: "SQA"
          },
          {
            id: "template-export",
            label: "PDF Preview for Export",
            path: "/sqa/templates/export",
            permission: API_PERMISSIONS.SQA.VIEW_TEMPLATE_DETAIL,
            module: "SQA"
          }
        ]
      },
    ];

    return allNavItems.filter(item => {
    // Debug logging - Commented out to reduce console noise
    // console.log(`🔍 Filtering item: ${item.id}`, {
    //   userRole: user?.role,
    //   itemModule: item.module,
    //   itemPermission: item.permission,
    //   hasModuleAccess: hasModuleAccess(item.module),
    //   hasPermission: hasPermission(item.permission)
    // });
    
    // For ADMINISTRATOR role, show only admin-specific items
    if (normalizedRoleName === 'ADMINISTRATOR') {
      // Define admin-specific items that should be visible (including main-menu)
      const adminItems = ['main-menu', 'users', 'roles', 'departments', 'forms', 'system-config'];
      
      // Check if this is an admin item
      const isAdminItem = adminItems.includes(item.id);
      
      if (!isAdminItem) {
        // console.log(`🔍 ADMINISTRATOR role - Non-admin item ${item.id}: BLOCKED (ADMINISTRATOR should only see admin items)`);
        return false; // Block all non-admin items for ADMINISTRATOR
      }
      
      // For main-menu, always show (permissions checked for individual actions)
      if (item.id === 'main-menu') {
        return true;
      }
      
      // For admin items, use normal permission check
      const hasAccess = hasModuleAccess(item.module) || hasPermission(item.permission);
      // console.log(`🔍 ADMINISTRATOR role - ${item.id}: ${hasAccess}`);
      return hasAccess;
    }
    // For ACADEMIC_DEPARTMENT role (handle variants: ACADEMIC_DEPARTMENT, ACADEMIC_DEPT, ACADEMIC DEPARTMENT)
    // Normalize and check if starts with ACADEMIC
    const isAcademicRole = normalizedRoleName === 'ACADEMIC_DEPARTMENT' || 
                          normalizedRoleName === 'ACADEMIC_DEPT' ||
                          normalizedRoleName.startsWith('ACADEMIC');
    
    if (isAcademicRole) {
      const isAcademicItem = ['academic-dashboard'].includes(item.id);
      // Block all other items - only show academic-dashboard
      return isAcademicItem;
    }
    // For TRAINEE role, show all trainee-related items
    if (normalizedRoleName === 'TRAINEE') {
      const isTraineeItem = ['trainee-dashboard', 'enrolled-courses', 'all-assessments', 'create-issue'].includes(item.id);
      // console.log(`🔍 TRAINEE role - ${item.id}: ${isTraineeItem}`);
      return isTraineeItem;
    }
    // For TRAINER role, show only trainer-specific items (no trainee dashboard)
    if (normalizedRoleName === 'TRAINER') {
      const isTrainerItem = ['upcoming-assessments', 'assessment-results', 'instructed-courses'].includes(item.id);
      // console.log(`🔍 TRAINER role - ${item.id}: ${isTrainerItem}`);
      return isTrainerItem;
    }
    // For SQA_AUDITOR role, show all SQA-related items
    if (normalizedRoleName === 'SQA_AUDITOR') {
      const isSQAItem = ['issue-list', 'feedback-list', 'template-list'].includes(item.id);
      // console.log(`🔍 SQA_AUDITOR role - ${item.id}: ${isSQAItem}`);
      return isSQAItem;
    }
    // For DEPARTMENT_HEAD role, show department head-specific items
    if (normalizedRoleName === 'DEPARTMENT_HEAD') {
      const isDepartmentHeadItem = ['department-dashboard', 'my-department-details', 'assessment-review-requests'].includes(item.id);
      // console.log(`🔍 DEPARTMENT_HEAD role - ${item.id}: ${isDepartmentHeadItem}`);
      return isDepartmentHeadItem;
    }
    // Default behavior for other roles
    const hasAccess = hasModuleAccess(item.module) || hasPermission(item.permission);
    // console.log(`🔍 Default role - ${item.id}: ${hasAccess}`);
    return hasAccess;
  });
  }, [user, hasModuleAccess, hasPermission]);

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
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "hidden",
        overflowX: "hidden",
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
          if (item.id === 'all-assessments' && user?.role === 'TRAINEE') {
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
                        navigate('/trainee/all-assessments');
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
                  {!collapsed && isAssessmentDropdownOpen && (
                    <div className="mt-2 ms-4">
                      {item.children && item.children.map((child) => (
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
        {isAcademicRole && (
          <Nav.Item className="mb-3">
            <Link
              to="/academic/assessment-events"
              className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${collapsed ? "justify-content-center" : ""} ${location.pathname === '/academic/assessment-events' ? "active" : ""}`}
              style={{
                minHeight: collapsed ? "48px" : "auto",
                backgroundColor: location.pathname === '/academic/assessment-events' ? "rgba(255, 255, 255, 0.1)" : "transparent",
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
        {isAcademicRole && (
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
                        navigate('/academic/departments');
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
