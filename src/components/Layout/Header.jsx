import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { 
  PersonCircle, 
  BoxArrowRight,
  List,
  X
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import useProfile from '../../hooks/useProfile';
import '../../styles/dropdown-clean.css';

// Force remove box shadow from dropdown
const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  right: '0',
  zIndex: 9999,
  minWidth: '250px',
  maxWidth: '300px',
  backgroundColor: 'white',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: '0.375rem',
  padding: '0.5rem 0',
  width: 'auto',
  height: 'auto',
  overflow: 'visible',
  boxShadow: 'none !important',
  WebkitBoxShadow: 'none !important',
  MozBoxShadow: 'none !important'
};

const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isLoading } = useAuth();
  const { profile, getDisplayName: getProfileDisplayName } = useProfile();
  
  // Helper functions
  const getDisplayName = () => {
    if (!user) return 'Loading...';
    
    // Try to get fullName from profile first (most accurate)
    if (profile && getProfileDisplayName() && getProfileDisplayName() !== 'Loading...') {
      return getProfileDisplayName();
    }
    
    // Try to get fullName from user object
    if (user.fullName && user.fullName !== 'User') {
      return user.fullName;
    }
    
    // If user has firstName and lastName, construct full name
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    // Fallback to name or default
    return user.name || 'User';
  };
  
  const getEmail = () => {
    if (!user) return 'No email';
    return user.email || 'No email';
  };
  
  // Map routes to titles
  const getTitleFromPath = (path) => {
    const routes = {
      // Admin routes
      '/admin': 'Dashboard',
      '/admin/dashboard': 'Dashboard',
      '/admin/users': 'User Management',
      '/admin/roles': 'Role Management',
      '/admin/departments': 'Department Management',
      '/admin/profile': 'Profile',
      '/admin/forms': 'Form Templates',
      '/admin/system-config': 'System Configuration',
      
      // Academic routes
      '/academic': 'Academic Dashboard',
      '/academic/dashboard': 'Academic Dashboard',
      '/academic/departments': 'Department Management',
      '/academic/profile': 'Profile',
      
      // Trainee routes
      '/trainee': 'Trainee Portal',
      '/trainee/academic-details': 'Academic Details',
      '/trainee/enrolled-courses': 'Enrolled Course List',
      '/trainee/assessment-pending': 'Assessment Pending List',
      '/trainee/create-issue': 'Create Issue Report/Feedback',
      '/trainee/assessment-pending/signature-required': 'Signature Required List',
      '/trainee/assessment-pending/section-completion': 'Section Completion Required List'
    };
    
    // Check for department detail page (pattern: /admin/departments/:id)
    if (path.startsWith('/admin/departments/') && path !== '/admin/departments') {
      return 'Edit Department Detail';
    }
    
    // Check for academic department pages (pattern: /academic/departments/:id)
    if (path.startsWith('/academic/departments/') && path !== '/academic/departments') {
      return 'Department Courses';
    }
    
    // Check for enroll trainees page (pattern: /academic/course/:id/enroll-trainees)
    if (path.includes('/enroll-trainees')) {
      return 'Trainee Enrollments';
    }
    
    // Check for course detail page (pattern: /academic/course/:id)
    if (path.startsWith('/academic/course/') && !path.includes('/subject/')) {
      return 'Department Details';
    }
    
    // Check for course detail page (pattern: /academic/course-detail/:id)
    if (path.startsWith('/academic/course-detail/')) {
      return 'Course Details';
    }
    
    // Check for subject detail page (pattern: /academic/course/:courseId/subject/:subjectId)
    if (path.includes('/subject/')) {
      return 'Subject Details';
    }
    
    // Check for enroll trainees page (pattern: /academic/course/:id/enroll-trainees)
    if (path.includes('/enroll-trainees')) {
      return 'Enroll Trainees';
    }
    
    // Check for trainee detail pages (pattern: /trainee/:traineeId)
    if (path.startsWith('/trainee/') && path !== '/trainee' && 
        !path.startsWith('/trainee/academic-details') &&
        !path.startsWith('/trainee/enrolled-courses') &&
        !path.startsWith('/trainee/assessment-pending') &&
        !path.startsWith('/trainee/create-issue')) {
      return 'Trainee Details';
    }
    
    // Check for trainee course detail (pattern: /trainee/:traineeId/course/:courseId)
    if (path.match(/^\/trainee\/[^\/]+\/course\/[^\/]+$/)) {
      return 'Course Details';
    }
    
    // Check for trainee subject detail (pattern: /trainee/:traineeId/course/:courseId/subject/:subjectId)
    if (path.match(/^\/trainee\/[^\/]+\/course\/[^\/]+\/subject\/[^\/]+$/)) {
      return 'Subject Details';
    }
    
    // Check for trainee assessments (pattern: /trainee/:traineeId/assessments)
    if (path.match(/^\/trainee\/[^\/]+\/assessments$/)) {
      return 'Assessment Details';
    }
    
    // Check for signature pad (pattern: /trainee/:traineeId/signature-pad/:documentId)
    if (path.match(/^\/trainee\/[^\/]+\/signature-pad\/[^\/]+$/)) {
      return 'Digital Signature';
    }
    
    // Check for assessment section (pattern: /trainee/:traineeId/assessment-section/:sectionId)
    if (path.match(/^\/trainee\/[^\/]+\/assessment-section\/[^\/]+$/)) {
      return 'Assessment Section';
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
                  cursor: 'pointer',
                  boxShadow: 'none',
                  WebkitBoxShadow: 'none',
                  MozBoxShadow: 'none'
                }}
                onClick={() => setShowDesktopDropdown(!showDesktopDropdown)}
              >
                <PersonCircle size={32} className="me-2" />
                <span>{isLoading ? 'Loading...' : getDisplayName()}</span>
              </button>
              
              
              {/* Real dropdown - use CSS classes */}
              <div
                className={`custom-dropdown ${showDesktopDropdown ? 'show' : 'hide'}`}
                style={dropdownStyle}
              >
                  <div className="dropdown-header" style={{ padding: '0.5rem 1rem', wordBreak: 'break-all' }}>                  
                    <div className="fw-bold text-primary-custom">
                      {isLoading ? 'Loading...' : getDisplayName()}
                    </div>
                    <small className="text-muted" style={{ 
                      wordBreak: 'break-all', 
                      whiteSpace: 'normal',
                      lineHeight: '1.2'
                    }}>
                      {isLoading ? 'Loading...' : getEmail()}
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
            {isLoading ? 'Loading...' : getDisplayName()}
          </div>
          <div className="profile-email">
            {isLoading ? 'Loading...' : getEmail()}
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
