import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  House, 
  People, 
  Shield, 
  Building, 
  FileText,
  Airplane, // Add this import
  ChevronLeft,
  ChevronRight,
  Gear
} from 'react-bootstrap-icons';

const Sidebar = ({ collapsed }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House, path: '/admin/dashboard' },
    { id: 'users', label: 'User Management', icon: People, path: '/admin/users' },
    { id: 'roles', label: 'Role Management', icon: Shield, path: '/admin/roles' },
    { id: 'departments', label: 'Departments', icon: Building, path: '/admin/departments' },
    { id: 'forms', label: 'Form Templates', icon: FileText, path: '/admin/forms' },
    { id: 'system-config', label: 'System Configuration', icon: Gear, path: '/admin/system-config' },
  ];

  return (
    <div 
      className={`bg-primary-custom text-white d-flex flex-column transition-all ${collapsed ? 'sidebar-collapsed' : ''}`}
      style={{ 
        width: collapsed ? '60px' : '250px',
        minHeight: '100vh',
        transition: 'width 0.3s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Logo/Brand */}
      <div className="p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center justify-content-center">
          {!collapsed && (
            <h5 className="mb-0 text-white text-nowrap">DSFMS</h5>
          )}
          {collapsed && (
            <div>
              <Airplane size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <Nav className="flex-column flex-grow-1 p-3">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Nav.Item key={item.id} className="mb-3">
              <Link
                to={item.path}
                className={`text-white d-flex align-items-center py-3 px-3 rounded transition-all nav-link text-nowrap ${
                  collapsed ? 'justify-content-center' : ''
                }`}
                style={{
                  transition: 'all 0.2s ease',
                  border: 'none',
                  background: 'transparent',
                  textDecoration: 'none',
                  minHeight: collapsed ? '48px' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <IconComponent 
                  size={20} 
                  className={collapsed ? '' : 'me-3'} 
                  style={{
                    display: 'inline-block',
                    flexShrink: 0
                  }}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </Nav.Item>
          );
        })}
      </Nav>
    </div>
  );
};

export default Sidebar;
