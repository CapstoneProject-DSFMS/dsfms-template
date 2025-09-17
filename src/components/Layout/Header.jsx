import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { 
  PersonCircle, 
  BoxArrowRight,
  List
} from 'react-bootstrap-icons';

const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  
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
        return "/dsfms-template";
      }
      const pathname = window.location.pathname;
      if (pathname.includes('/dsfms-template')) {
        return "/dsfms-template";
      }
      return "/";
    };
    
    // Redirect to login
    window.location.href = getBasename() + '/';
  };

  return (
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

        <Navbar.Brand className="text-primary-custom fw-bold">
          {getTitleFromPath(location.pathname)}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="text-primary-custom p-0 d-flex align-items-center"
                style={{ border: 'none', background: 'transparent', textDecoration: 'none' }}
              >
                <PersonCircle size={32} className="me-2" />
                <span className="d-none d-md-inline">Admin User</span>
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
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default Header;
