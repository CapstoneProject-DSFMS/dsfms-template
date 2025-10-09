import React, { useState, useEffect } from "react";
import { Nav, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
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
  const { departments, loading: departmentsLoading } = useDepartmentManagement();
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  
  
  // Debug log
  console.log('🔍 Sidebar - User role:', user?.role);
  console.log('🔍 Sidebar - User object:', user);
  console.log('🔍 Sidebar - User permissions:', userPermissions);
  console.log('🔍 Sidebar - Departments:', departments);
  
  // Filter active departments for Academic Department
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
      id: "trainees",
      label: "Trainee Management",
      icon: PersonCheck,
      path: "/trainee",
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

  return (
    <div
      className={`bg-primary-custom text-white d-flex flex-column transition-all ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
      style={{
        width: collapsed ? "60px" : "280px",
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
          
          return (
            <Nav.Item key={item.id} className="mb-3">
              <Link
                to={item.path}
                className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link text-nowrap ${collapsed ? "justify-content-center" : ""} ${isActive ? "active" : ""}`}
                style={{
                  minHeight: collapsed ? "48px" : "auto",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
                }}
                onClick={onClose} // Close sidebar on mobile when link is clicked
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

        {/* Academic Department - Department dropdown */}
        {user?.role === 'ACADEMIC_DEPARTMENT' && (
          <Nav.Item className="mb-3">
            <div className="position-relative">
              {/* Department dropdown trigger */}
              <div
                className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link text-nowrap ${collapsed ? "justify-content-center" : ""} ${location.pathname.startsWith('/academic/departments') ? "active" : ""}`}
                style={{
                  minHeight: collapsed ? "48px" : "auto",
                  backgroundColor: location.pathname.startsWith('/academic/departments') ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  cursor: "pointer"
                }}
                onClick={() => {
                  if (!collapsed) {
                    setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen);
                  }
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
                    <span className="sidebar-nav-label flex-grow-1">Department</span>
                    <ChevronDown
                      size={16}
                      className={`ms-auto transition-transform ${isDepartmentDropdownOpen ? "rotate-180" : ""}`}
                      style={{
                        transition: "transform 0.3s ease"
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
