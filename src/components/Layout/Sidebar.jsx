import React, { useState } from "react";
import { Nav, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
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

const Sidebar = ({ collapsed, onClose }) => {
  const { hasModuleAccess, hasPermission } = usePermissions();
  const { user } = useAuth();
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  
  // Debug log
  console.log('🔍 Sidebar - User role:', user?.role);
  console.log('🔍 Sidebar - User object:', user);
  
  // Hardcoded courses data for Academic Department
  const courses = [
    { id: 1, name: "Cabin Crew Training", code: "CCT" },
    { id: 2, name: "Flight Crew Training", code: "FCTD" },
    { id: 3, name: "Ground Operations Training", code: "GOT" },
    { id: 4, name: "Ground Affairs Training", code: "GAT" },
    { id: 5, name: "Technical & Aircraft Maintenance", code: "TAMT" },
    { id: 6, name: "Safety & Quality Assurance", code: "SQA" }
  ];

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
  });

  return (
    <div
      className={`bg-primary-custom text-white d-flex flex-column transition-all ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
      style={{
        width: collapsed ? "60px" : "250px",
        minHeight: "100vh",
        transition: "width 0.3s ease",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
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
          return (
            <Nav.Item key={item.id} className="mb-3">
              <Link
                to={item.path}
                className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link text-nowrap ${collapsed ? "justify-content-center" : ""}`}
                style={{
                  minHeight: collapsed ? "48px" : "auto",
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
              className={`sidebar-nav-link text-white d-flex align-items-center py-3 pe-1 rounded nav-link text-nowrap ${collapsed ? "justify-content-center" : ""}`}
              style={{
                minHeight: collapsed ? "48px" : "auto",
                cursor: "pointer"
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
                {courses.map((course) => (
                  <Nav.Item key={course.id} className="mb-2">
                    <Link
                      to={`/academic/course/${course.id}`}
                      className="sidebar-nav-link text-white-50 d-flex align-items-center py-2 pe-1 rounded nav-link text-nowrap"
                      style={{
                        fontSize: "0.9rem",
                        paddingLeft: "1rem"
                      }}
                      onClick={onClose}
                    >
                      <ChevronRightIcon size={14} className="me-2" />
                      <span>{course.name}</span>
                    </Link>
                  </Nav.Item>
                ))}
              </Nav>
            )}
          </Nav.Item>
        )}
      </Nav>
    </div>
  );
};

export default Sidebar;
