import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} />
      
      <div className="flex-grow-1 d-flex flex-column">
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-grow-1 bg-light-custom">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
