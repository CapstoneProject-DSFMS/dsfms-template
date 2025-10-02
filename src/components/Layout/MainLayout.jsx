import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // Check if screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <div className={`sidebar-desktop ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-mobile-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`sidebar-mobile ${sidebarOpen ? 'show' : ''}`}>
        <Sidebar collapsed={false} onClose={closeSidebar} />
      </div>
      
      <div className={`flex-grow-1 d-flex flex-column ${isMobile ? 'main-content-mobile' : ''}`}>
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-grow-1 bg-light-custom">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
