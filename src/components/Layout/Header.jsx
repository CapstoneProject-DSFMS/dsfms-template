import React from 'react';
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { 
  Bell, 
  PersonCircle, 
  Gear, 
  BoxArrowRight,
  List
} from 'react-bootstrap-icons';

const Header = ({ onToggleSidebar }) => {
  const handleLogout = () => {
    // Handle logout logic
    console.log('Logout clicked');
  };

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      className="border-bottom border-neutral-200 shadow-sm"
      style={{ minHeight: '60px' }}
    >
      <div className="container-fluid">
        {/* Sidebar Toggle */}
        <Button
          variant="link"
          className="text-primary-custom p-2 me-3"
          onClick={onToggleSidebar}
          style={{ border: 'none', background: 'transparent' }}
        >
          <List size={20} />
        </Button>

        {/* Brand/Title */}
        <Navbar.Brand className="text-primary-custom fw-bold">
          Admin Dashboard
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {/* Notifications */}
            <Nav.Item className="me-3">
              <Button
                variant="link"
                className="text-primary-custom p-2 position-relative"
                style={{ border: 'none', background: 'transparent' }}
              >
                <Bell size={20} />
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.6rem' }}
                >
                  3
                </span>
              </Button>
            </Nav.Item>

            {/* Settings */}
            <Nav.Item className="me-3">
              <Button
                variant="link"
                className="text-primary-custom p-2"
                style={{ border: 'none', background: 'transparent' }}
              >
                <Gear size={20} />
              </Button>
            </Nav.Item>

            {/* User Dropdown */}
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
                <Dropdown.Item href="#settings" className="text-primary-custom">
                  <Gear className="me-2" />
                  Settings
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
