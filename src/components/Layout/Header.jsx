import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { 
  PersonCircle, 
  BoxArrowRight,
  List,
  X
} from 'react-bootstrap-icons';
import useProfile from '../../hooks/useProfile';
import '../../styles/dropdown-clean.css';

const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { profile, loading, getDisplayName, getRoleName } = useProfile();
  
  // Map routes to titles
  const getTitleFromPath = (path) => {
    const routes = {
      '/admin': 'Dashboard',
      '/admin/dashboard': 'Dashboard',
      '/admin/users': 'User Management',
      '/admin/roles': 'Role Management',
      '/admin/departments': 'Department Management',
      '/admin/profile': 'Profile',
      '/admin/forms': 'Form Templates',
      '/admin/system-config': 'System Configuration'
    };
    
    // Check for department detail page (pattern: /admin/departments/:id)
    if (path.startsWith('/admin/departments/') && path !== '/admin/departments') {
      return 'Edit Department Detail';
    }
    
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

  const handleProfileClick = () => {
    navigate('/admin/profile');
    setShowProfileMenu(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDesktopDropdown(false);
      }
    };

    if (showDesktopDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDesktopDropdown]);

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
          <div className="d-none d-lg-block ms-auto" style={{ position: 'relative' }}>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                className="text-primary-custom p-0 d-flex align-items-center"
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setShowDesktopDropdown(!showDesktopDropdown)}
              >
                <PersonCircle size={32} className="me-2" />
                <span>{loading ? 'Loading...' : getDisplayName()}</span>
              </button>
              
              
              {/* Real dropdown - use CSS classes */}
              <div
                className={`custom-dropdown ${showDesktopDropdown ? 'show' : 'hide'}`}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  zIndex: 9999,
                  minWidth: '200px',
                  backgroundColor: 'white',
                  border: '1px solid rgba(0,0,0,0.15)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0',
                  width: '200px',
                  height: 'auto',
                  overflow: 'visible'
                }}
              >
                  <div className="dropdown-header">                  
                    <div className="fw-bold text-primary-custom">
                      {loading ? 'Loading...' : getDisplayName()}
                    </div>
                    <small className="text-muted">
                      {loading ? 'Loading...' : profile?.email || 'No email'}
                    </small>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item d-flex align-items-center text-primary-custom"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.25rem 1rem'
                    }}
                    onClick={() => {
                      setShowDesktopDropdown(false);
                      handleProfileClick();
                    }}
                  >
                    <PersonCircle className="me-2" size={16} />
                    Profile
                  </button>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item d-flex align-items-center text-danger"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.25rem 1rem'
                    }}
                    onClick={() => {
                      setShowDesktopDropdown(false);
                      handleLogout();
                    }}
                  >
                  <BoxArrowRight className="me-2" size={16} />
                  Logout
                </button>
              </div>
            </div>
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
          
          <div className="profile-name">
            {loading ? 'Loading...' : getDisplayName()}
          </div>
          <div className="profile-email">
            {loading ? 'Loading...' : profile?.email || 'No email'}
          </div>
        </div>

        {/* Profile Menu Items */}
        <ul className="profile-menu-items">
          <li className="profile-menu-item">
            <a 
              href="#" 
              className="profile-menu-link"
              onClick={(e) => {
                e.preventDefault();
                handleProfileClick();
              }}
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
