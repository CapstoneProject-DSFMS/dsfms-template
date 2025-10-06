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
  const { departments, loading: departmentsLoading } = useDepartmentManagement();
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(
    location.pathname.startsWith('/academic/course/')
  );
  
  // Update dropdown state when location changes
  useEffect(() => {
    setShowDepartmentDropdown(location.pathname.startsWith('/academic/course/'));
  }, [location.pathname]);
  
  // Debug log
  console.log('🔍 Sidebar - User role:', user?.role);
  console.log('🔍 Sidebar - User object:', user);
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
  ];

  // Filter nav items based on user permissions and role
  const navItems = allNavItems.filter(item => {
    // For ADMIN role, show all items based on permissions
    if (user?.role === 'ADMIN') {
      return hasModuleAccess(item.module) || hasPermission(item.permission);
    }
    // For ACADEMIC_DEPARTMENT role, only show dashboard
    if (user?.role === 'ACADEMIC_DEPARTMENT') {
      return item.id === 'dashboard';
    }
    // Default behavior for other roles
    return hasModuleAccess(item.module) || hasPermission(item.permission);
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
            <div
              className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link text-nowrap ${collapsed ? "justify-content-center" : ""} ${location.pathname.startsWith('/academic/course/') ? "active" : ""}`}
              style={{
                minHeight: collapsed ? "48px" : "auto",
                cursor: "pointer",
                backgroundColor: location.pathname.startsWith('/academic/course/') ? "rgba(255, 255, 255, 0.1)" : "transparent"
              }}
              onClick={() => !collapsed && setShowDepartmentDropdown(!showDepartmentDropdown)}
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
                  <span className="sidebar-nav-label">Department</span>
                  <ChevronDown
                    size={16}
                    className="ms-auto"
                    style={{
                      transform: showDepartmentDropdown ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease"
                    }}
                  />
                </>
              )}
            </div>
            
            {/* Department dropdown items */}
            {!collapsed && showDepartmentDropdown && (
              <Nav className="flex-column ms-3 mt-2">
                {departmentsLoading ? (
                  <Nav.Item className="mb-2">
                    <div className="sidebar-nav-link d-flex align-items-center py-2 pe-1 rounded nav-link text-white-50">
                      <ChevronRightIcon size={14} className="me-1" />
                      <span>Loading departments...</span>
                    </div>
                  </Nav.Item>
                ) : (
                  activeDepartments.map((department) => {
                    const isDepartmentActive = location.pathname === `/academic/course/${department.id}`;
                    return (
                      <Nav.Item key={department.id} className="mb-1">
                        <Link
                          to={`/academic/course/${department.id}`}
                          className={`sidebar-nav-link d-flex align-items-center py-1 pe-1 rounded nav-link ${isDepartmentActive ? "text-white" : "text-white-50"}`}
                          style={{
                            fontSize: "0.85rem",
                            paddingLeft: "0.5rem",
                            backgroundColor: isDepartmentActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            wordWrap: "break-word",
                            overflowWrap: "break-word"
                          }}
                          onClick={onClose}
                        >
                          <ChevronRightIcon size={13} className="me-1" />
                          <span>{department.name}</span>
                        </Link>
                      </Nav.Item>
                    );
                  })
                )}
              </Nav>
            )}
          </Nav.Item>
        )}
      </Nav>
    </div>
  );
};

export default Sidebar;
