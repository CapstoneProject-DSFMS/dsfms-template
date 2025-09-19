import React from "react";
import { Nav, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  House,
  People,
  Shield,
  Building,
  FileText,
  Airplane, // Add this import
  ChevronLeft,
  ChevronRight,
  Gear,
  X,
} from "react-bootstrap-icons";
import logo from "../../assets/logo-light.png";

const Sidebar = ({ collapsed, onClose }) => {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: House,
      path: "/admin/dashboard",
    },
    {
      id: "users",
      label: "User Management",
      icon: People,
      path: "/admin/users",
    },
    {
      id: "roles",
      label: "Role Management",
      icon: Shield,
      path: "/admin/roles",
    },
    {
      id: "departments",
      label: "Departments",
      icon: Building,
      path: "/admin/departments",
    },
    {
      id: "forms",
      label: "Form Templates",
      icon: FileText,
      path: "/admin/forms",
    },
    {
      id: "system-config",
      label: "System Configuration",
      icon: Gear,
      path: "/admin/system-config",
    },
  ];

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
                style={{ width: "30%", marginRight: "0px" }}
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
      </Nav>
    </div>
  );
};

export default Sidebar;
