import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { 
  PersonCircle, 
  BoxArrowRight,
  List,
  X
} from 'react-bootstrap-icons';

const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Map routes to titles
  const getTitleFromPath = (path) => {
    const routes = {
      '/admin': 'Dashboard',
      '/admin/dashboard': 'Dashboard',
      '/admin/users': 'User Management',
      '/admin/roles': 'Role Management',
      '/admin/departments': 'Department Management',
      '/admin/forms': 'Form Templates',
      '/admin/system-config': 'System Configuration'
    };
    return routes[path] || 'Dashboard';
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Get basename dynamically
    const getBasename = () => {
      if (import.meta.env.DEV) {
        return "/";
      }
      const pathname = window.location.pathname;
      if (pathname.includes('/dsfms-template')) {
        return "/dsfms-template";
      }
      return "/";
    };
    
    // Redirect to login - use basename only, don't add extra '/'
    window.location.href = getBasename();
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const closeProfileMenu = () => {
    setShowProfileMenu(false);
  };

  return (
    <>
      <Navbar 
        bg="white" 
        expand="lg" 
        className="border-bottom border-neutral-200 shadow-sm"
        style={{ minHeight: '60px' }}
      >
        <div className="container-fluid">
          <Button
            variant="link"
            className="text-primary-custom p-2 me-3"
            onClick={onToggleSidebar}
            style={{ border: 'none', background: 'transparent' }}
          >
            <List size={20} />
          </Button>

          <Navbar.Brand className="text-primary-custom fw-bold custom-title">
            {getTitleFromPath(location.pathname)}
          </Navbar.Brand>

          {/* Desktop Profile Menu */}
          <div className="d-none d-lg-block ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="text-primary-custom p-0 d-flex align-items-center"
                style={{ border: 'none', background: 'transparent', textDecoration: 'none' }}
              >
                <PersonCircle size={32} className="me-2" />
                <span>Admin User</span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="border-0 shadow">
                <Dropdown.Header className="text-primary-custom">
                  <div className="fw-bold">Admin User</div>
                  <small className="text-muted">admin@company.com</small>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item href="#profile" className="text-primary-custom">
                  <PersonCircle className="me-2" />
                  Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={handleLogout}
                  className="text-danger"
                >
                  <BoxArrowRight className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Mobile/Tablet Profile Icon - Replaces right hamburger */}
          <div 
            className="d-lg-none text-primary-custom p-2"
            onClick={toggleProfileMenu}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              textDecoration: 'none',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            <PersonCircle size={32} />
          </div>
        </div>
      </Navbar>

      {/* Profile Menu Overlay */}
      {showProfileMenu && (
        <div 
          className={`profile-menu-overlay ${showProfileMenu ? 'show' : ''}`}
          onClick={closeProfileMenu}
        />
      )}

      {/* Profile Menu Slide Panel */}
      <div className={`profile-menu-slide ${showProfileMenu ? 'show' : ''}`}>
        {/* Profile Menu Header */}
        <div className="profile-menu-header">
          <button 
            className="profile-menu-close"
            onClick={closeProfileMenu}
            aria-label="Close profile menu"
          >
            <X size={20} />
          </button>
          
          <div className="profile-avatar">
            <PersonCircle size={40} />
          </div>
          
          <div className="profile-name">Admin User</div>
          <div className="profile-email">admin@company.com</div>
        </div>

        {/* Profile Menu Items */}
        <ul className="profile-menu-items">
          <li className="profile-menu-item">
            <a 
              href="#profile" 
              className="profile-menu-link"
              onClick={closeProfileMenu}
            >
              <PersonCircle className="icon" />
              Profile
            </a>
          </li>
          <li className="profile-menu-item">
            <a 
              href="#" 
              className="profile-menu-link danger"
              onClick={(e) => {
                e.preventDefault();
                closeProfileMenu();
                handleLogout();
              }}
            >
              <BoxArrowRight className="icon" />
              Logout
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;
