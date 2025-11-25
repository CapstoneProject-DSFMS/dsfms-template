import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const storedValue = localStorage.getItem('sidebarCollapsed');
      return storedValue ? storedValue === 'true' : false;
    } catch {
      return false;
    }
  });
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Debug: Log sidebar state changes
  useEffect(() => {
    if (isMobile) {
      console.log('🔍 Sidebar state:', { isMobile, sidebarOpen });
    }
  }, [isMobile, sidebarOpen]);


  // Check if screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      const isMobileSize = window.innerWidth <= 768;
      setIsMobile(isMobileSize);
      
      // Close sidebar when switching from mobile to desktop
      if (!isMobileSize && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [sidebarOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    } catch {
      // Ignore write errors (e.g., private mode)
    }
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = useCallback(() => {
    console.log('🔍 closeSidebar called', { isMobile, sidebarOpen });
    if (isMobile) {
      console.log('✅ Setting sidebarOpen to false');
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      <div className={`sidebar-desktop ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      {isMobile && (
        <>
          {/* Mobile/Tablet Sidebar Overlay - Must cover entire screen */}
          {sidebarOpen && (
            <div 
              className="sidebar-mobile-overlay"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeSidebar();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeSidebar();
              }}
              style={{ cursor: 'pointer' }}
            />
          )}
          
          {/* Mobile Sidebar - Rendered after overlay with smooth animation */}
          <div 
            className={`sidebar-mobile ${sidebarOpen ? 'show' : ''}`}
            onClick={(e) => {
              // Stop propagation to prevent overlay from receiving click
              e.stopPropagation();
            }}
          >
            {sidebarOpen && <Sidebar collapsed={false} onClose={closeSidebar} />}
          </div>
        </>
      )}
      
      <div 
        className={`flex-grow-1 d-flex flex-column ${isMobile ? 'main-content-mobile' : ''} ${!isMobile && sidebarCollapsed ? 'sidebar-collapsed-active' : ''}`}
        style={{
          marginLeft: !isMobile ? (sidebarCollapsed ? '60px' : '260px') : '0',
          transition: 'margin-left 0.3s ease',
          width: !isMobile ? `calc(100% - ${sidebarCollapsed ? '60px' : '260px'})` : '100%',
        }}
      >
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-grow-1 bg-light-custom" style={{ overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
