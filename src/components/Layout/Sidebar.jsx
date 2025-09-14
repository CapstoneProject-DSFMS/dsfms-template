import React from 'react';
import { Nav } from 'react-bootstrap';
import { 
  House, 
  People, 
  Shield, 
  Building, 
  FileText, 
  FileEarmarkText,
  ChevronLeft,
  ChevronRight
} from 'react-bootstrap-icons';

const Sidebar = ({ collapsed }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House, path: '/dashboard' },
    { id: 'users', label: 'User Management', icon: People, path: '/dashboard/users' },
    { id: 'roles', label: 'Role Management', icon: Shield, path: '/dashboard/roles' },
    { id: 'departments', label: 'Departments', icon: Building, path: '/dashboard/departments' },
    { id: 'forms', label: 'Forms', icon: FileText, path: '/dashboard/forms' },
    { id: 'templates', label: 'Templates', icon: FileEarmarkText, path: '/dashboard/templates' }
  ];

  return (
    <div 
      className={`bg-primary-custom text-white d-flex flex-column transition-all`}
      style={{ 
        width: collapsed ? '60px' : '250px',
        minHeight: '100vh',
        transition: 'width 0.3s ease'
      }}
    >
      {/* Logo/Brand */}
      <div className="p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          {!collapsed && (
            <h5 className="mb-0 text-white">DSFMS</h5>
          )}
          {collapsed && (
            <div className="mx-auto">
              <House size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <Nav className="flex-column flex-grow-1 p-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Nav.Item key={item.id} className="mb-1">
              <Nav.Link
                href={item.path}
                className={`text-white d-flex align-items-center py-2 px-3 rounded transition-all ${
                  collapsed ? 'justify-content-center' : ''
                }`}
                style={{
                  transition: 'all 0.2s ease',
                  border: 'none',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <IconComponent size={20} className={collapsed ? '' : 'me-3'} />
                {!collapsed && <span>{item.label}</span>}
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-top border-secondary">
        <button
          className="btn btn-link text-white p-2 w-100 border-0"
          style={{ background: 'transparent' }}
          onClick={() => {/* Toggle handled by parent */}}
        >
          <div className="d-flex align-items-center justify-content-center">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="ms-2">Collapse</span>}
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
