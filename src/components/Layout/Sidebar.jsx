import React, { useState, useEffect } from "react";
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
} from "react-bootstrap-icons";
import logo from "../../assets/logo-light.png";
import { usePermissions } from "../../hooks/usePermissions";
import { API_PERMISSIONS } from "../../constants/apiPermissions";
import { useAuth } from "../../hooks/useAuth";
import useDepartmentManagement from "../../hooks/useDepartmentManagement";

const Sidebar = ({ collapsed, onClose }) => {
  const { hasModuleAccess, hasPermission, userPermissions } = usePermissions();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Only load departments for ACADEMIC_DEPARTMENT role
  const { departments, loading: departmentsLoading } = useDepartmentManagement(user?.role === 'ACADEMIC_DEPARTMENT');
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [isAssessmentDropdownOpen, setIsAssessmentDropdownOpen] = useState(false);
  
  
  // Debug log
  console.log('🔍 Sidebar - User role:', user?.role);
  console.log('🔍 Sidebar - User object:', user);
  console.log('🔍 Sidebar - User permissions:', userPermissions);
  console.log('🔍 Sidebar - Departments:', departments);
  
  // Filter active departments
  const activeDepartments = departments.filter(dept => dept.status === 'ACTIVE');

  const allNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: House,
      path: "/admin/dashboard",
      permission: API_PERMISSIONS.DASHBOARD.VIEW,
      module: "DASHBOARD"
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
      label: "Form Templates",
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
      id: "academic-details",
      label: "Academic Details",
      icon: PersonCheck,
      path: "/trainee/academic-details",
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
      id: "assessment-pending",
      label: "Assessment Pending List",
      icon: PersonCheck,
      path: "/trainee/assessment-pending",
      permission: API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS,
      module: "TRAINEES"
    },
    {
      id: "create-issue",
      label: "Create Issue Report/Feedback",
      icon: PersonCheck,
      path: "/trainee/create-issue",
      permission: API_PERMISSIONS.TRAINEES.VIEW_ALL,
      module: "TRAINEES"
    },
  ];

  // Filter nav items based on user permissions and role
  const navItems = allNavItems.filter(item => {
    // Debug logging
    console.log(`🔍 Filtering item: ${item.id}`, {
      userRole: user?.role,
      itemModule: item.module,
      itemPermission: item.permission,
      hasModuleAccess: hasModuleAccess(item.module),
      hasPermission: hasPermission(item.permission)
    });
    
    // For ADMINISTRATOR role, show all items based on permissions
    if (user?.role === 'ADMINISTRATOR') {
      const hasAccess = hasModuleAccess(item.module) || hasPermission(item.permission);
      console.log(`🔍 ADMINISTRATOR role - ${item.id}: ${hasAccess}`);
      return hasAccess;
    }
    // For ACADEMIC_DEPARTMENT role, only show dashboard
    if (user?.role === 'ACADEMIC_DEPARTMENT') {
      const isDashboard = item.id === 'dashboard';
      console.log(`🔍 ACADEMIC_DEPARTMENT role - ${item.id}: ${isDashboard}`);
      return isDashboard;
    }
    // For TRAINEE role, show all trainee-related items
    if (user?.role === 'TRAINEE') {
      const isTraineeItem = ['academic-details', 'enrolled-courses', 'assessment-pending', 'create-issue'].includes(item.id);
      console.log(`🔍 TRAINEE role - ${item.id}: ${isTraineeItem}`);
      return isTraineeItem;
    }
    // Default behavior for other roles
    const hasAccess = hasModuleAccess(item.module) || hasPermission(item.permission);
    console.log(`🔍 Default role - ${item.id}: ${hasAccess}`);
    return hasAccess;
  }).map(item => {
    // Override dashboard path and label for ACADEMIC_DEPARTMENT role
    if (user?.role === 'ACADEMIC_DEPARTMENT' && item.id === 'dashboard') {
      return {
        ...item,
        path: '/academic/dashboard',
        label: 'Academic Dashboard'
      };
    }
    return item;
  });

  // Debug log after navItems is initialized
  console.log('🔍 Sidebar - Filtered navItems:', navItems);
  console.log('🔍 Sidebar - Dashboard permission check:', {
    permission: API_PERMISSIONS.DASHBOARD.VIEW,
    hasPermission: hasPermission(API_PERMISSIONS.DASHBOARD.VIEW),
    hasModuleAccess: hasModuleAccess('DASHBOARD'),
    userRole: user?.role,
    userPermissions: userPermissions?.map(p => p.name).filter(name => name.includes('dashboard') || name.includes('DASHBOARD'))
  });
  
  // Debug TRAINEE permissions
  console.log('🔍 Sidebar - TRAINEE permissions check:', {
    userRole: user?.role,
    TRAINEES_VIEW_DETAIL: {
      permission: API_PERMISSIONS.TRAINEES.VIEW_DETAIL,
      hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_DETAIL)
    },
    TRAINEES_VIEW_COURSES: {
      permission: API_PERMISSIONS.TRAINEES.VIEW_COURSES,
      hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_COURSES)
    },
    TRAINEES_VIEW_ASSESSMENTS: {
      permission: API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS,
      hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_ASSESSMENTS)
    },
    TRAINEES_VIEW_ALL: {
      permission: API_PERMISSIONS.TRAINEES.VIEW_ALL,
      hasPermission: hasPermission(API_PERMISSIONS.TRAINEES.VIEW_ALL)
    },
    allUserPermissions: userPermissions?.map(p => p.name)
  });

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
          console.log(`🔍 Sidebar - Item: ${item.id}, Path: ${item.path}, Current: ${location.pathname}, Active: ${isActive}`);
          
          // Special handling for Assessment Pending List dropdown
          if (item.id === 'assessment-pending' && user?.role === 'TRAINEE') {
            return (
              <Nav.Item key={item.id} className="mb-3">
                <div className="position-relative">
                  {/* Assessment dropdown trigger */}
                  <div
                    className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link text-nowrap ${collapsed ? "justify-content-center" : ""} ${location.pathname.startsWith('/trainee/assessment') ? "active" : ""}`}
                    style={{
                      minHeight: collapsed ? "48px" : "auto",
                      backgroundColor: location.pathname.startsWith('/trainee/assessment') ? "rgba(255, 255, 255, 0.1)" : "transparent",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      if (!collapsed) {
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
                        <span className="sidebar-nav-label flex-grow-1">{item.label}</span>
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

                  {/* Assessment dropdown menu */}
                  {!collapsed && isAssessmentDropdownOpen && (
                    <div className="mt-2 ms-4">
                      <Link
                        to="/trainee/assessment-pending/signature-required"
                        className="sidebar-nav-link text-white d-flex align-items-center py-2 pe-1 rounded nav-link"
                        style={{
                          backgroundColor: location.pathname === '/trainee/assessment-pending/signature-required' ? "rgba(255, 255, 255, 0.1)" : "transparent",
                          whiteSpace: 'normal',
                          wordWrap: 'break-word'
                        }}
                        onClick={onClose}
                      >
                        <span className="sidebar-nav-label">Signature Required List</span>
                      </Link>
                      <Link
                        to="/trainee/assessment-pending/section-completion"
                        className="sidebar-nav-link text-white d-flex align-items-center py-2 pe-1 rounded nav-link"
                        style={{
                          backgroundColor: location.pathname === '/trainee/assessment-pending/section-completion' ? "rgba(255, 255, 255, 0.1)" : "transparent",
                          whiteSpace: 'normal',
                          wordWrap: 'break-word'
                        }}
                        onClick={onClose}
                      >
                        <span className="sidebar-nav-label">Section Completion Required List</span>
                      </Link>
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
                className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link ${collapsed ? "justify-content-center text-nowrap" : ""} ${isActive ? "active" : ""}`}
                style={{
                  minHeight: collapsed ? "48px" : "auto",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  whiteSpace: collapsed ? 'nowrap' : 'normal',
                  wordWrap: collapsed ? 'normal' : 'break-word'
                }}
                onClick={(e) => {
                  console.log(`🔍 Sidebar - Clicked on: ${item.id}, navigating to: ${item.path}`);
                  console.log(`🔍 Sidebar - Current location:`, window.location.href);
                  console.log(`🔍 Sidebar - Current pathname:`, window.location.pathname);
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
                {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
              </Link>
            </Nav.Item>
          );
        })}

        {/* Department dropdown */}
        {user?.role === 'ACADEMIC_DEPARTMENT' && (
          <Nav.Item className="mb-3">
            <div className="position-relative">
              {/* Department dropdown trigger */}
              <div
                className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link text-nowrap ${collapsed ? "justify-content-center" : ""} ${location.pathname.startsWith('/academic/departments') ? "active" : ""}`}
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
                      style={{ cursor: "pointer" }}
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
                  className="position-absolute start-0 end-0 mt-1"
                  style={{
                    zIndex: 1000,
                    maxHeight: "300px",
                    overflowY: "auto"
                  }}
                >
                  {/* Individual departments */}
                  {departmentsLoading ? (
                    <div className="px-3 py-2 text-white-50">
                      <small>Loading departments...</small>
                    </div>
                  ) : departments.length > 0 ? (
                    departments.map((dept) => (
                      <Link
                        key={dept.id}
                        to={`/academic/course/${dept.id}`}
                        className="d-block px-3 py-2 text-white text-decoration-none d-flex align-items-center"
                        style={{
                          fontSize: "0.875rem",
                          backgroundColor: location.pathname === `/academic/course/${dept.id}` ? "rgba(255, 255, 255, 0.1)" : "transparent",
                          transition: "background-color 0.2s ease"
                        }}
                        onClick={() => {
                          // Không đóng dropdown, chỉ đóng sidebar trên mobile
                          onClose && onClose();
                        }}
                        onMouseEnter={(e) => {
                          if (location.pathname !== `/academic/course/${dept.id}`) {
                            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (location.pathname !== `/academic/course/${dept.id}`) {
                            e.target.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        <ChevronRight size={12} className="me-2" />
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
