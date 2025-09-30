import React, { useState } from "react";
import { Nav, Button, Collapse } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
  House,
  Book,
  FileText,
  People,
  ClipboardCheck,
  BarChart,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Airplane
} from "react-bootstrap-icons";
import logo from "../../assets/logo-light.png";

const AcademicSidebar = ({ collapsed, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: House,
      path: "/academic/dashboard",
    },
    {
      id: "course-management",
      label: "Course Management",
      icon: Book,
      hasSubmenu: true,
      subItems: [
        { id: "courses", label: "Course List", path: "/academic/courses" },
        { id: "create-course", label: "Create Course", path: "/academic/courses/create" },
      ]
    },
    {
      id: "subject-management",
      label: "Subject Management",
      icon: FileText,
      hasSubmenu: true,
      subItems: [
        { id: "subjects", label: "Subject List", path: "/academic/subjects" },
        { id: "bulk-import", label: "Bulk Import", path: "/academic/subjects/bulk-import" },
      ]
    },
    {
      id: "enrollment",
      label: "Trainee Enrollment",
      icon: People,
      path: "/academic/enrollment",
    },
    {
      id: "assessment-forms",
      label: "Assessment Forms",
      icon: ClipboardCheck,
      path: "/academic/assessment-forms",
    },
    {
      id: "assessment-history",
      label: "Assessment History",
      icon: BarChart,
      path: "/academic/assessment-history",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (item.path) {
      return isActive(item.path);
    }
    if (item.hasSubmenu) {
      return item.subItems.some(subItem => isActive(subItem.path));
    }
    return false;
  };

  return (
    <div className="bg-primary-custom h-100 d-flex flex-column">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
        {!collapsed && (
          <div className="d-flex align-items-center">
            <img src={logo} alt="Logo" height="32" className="me-2" />
            <div>
              <div className="fw-bold text-white">Academic Department</div>
              <small className="text-light opacity-75">DSFMS</small>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="d-flex align-items-center justify-content-center w-100">
            <Airplane size={24} className="text-white" />
          </div>
        )}

        <div className="d-flex align-items-center">
          {onClose && (
            <Button
              variant="link"
              className="text-white p-1 me-2 d-lg-none"
              onClick={onClose}
            >
              <X size={20} />
            </Button>
          )}
          
          <Button
            variant="link"
            className="text-white p-1"
            onClick={() => {/* Toggle logic will be handled by parent */}}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow-1 overflow-auto">
        <Nav className="flex-column">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isExpanded = expandedItems[item.id];
            const isItemActive = isParentActive(item);

            return (
              <div key={item.id}>
                {/* Main Item */}
                <Nav.Item>
                  {item.hasSubmenu ? (
                    <div>
                      <Nav.Link
                        className={`d-flex align-items-center text-white ${collapsed ? 'justify-content-center' : ''} ${isItemActive ? 'bg-primary-custom-dark' : ''}`}
                        style={{ padding: collapsed ? '0.75rem 0.5rem' : '0.75rem 1rem' }}
                        onClick={() => !collapsed && toggleExpanded(item.id)}
                      >
                        <IconComponent size={20} className={collapsed ? '' : 'me-3'} />
                        {!collapsed && (
                          <>
                            <span className="flex-grow-1">{item.label}</span>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRightIcon size={16} />}
                          </>
                        )}
                      </Nav.Link>
                      
                      {/* Submenu */}
                      {!collapsed && (
                        <Collapse in={isExpanded}>
                          <div>
                            {item.subItems.map((subItem) => (
                              <Nav.Link
                                key={subItem.id}
                                as={Link}
                                to={subItem.path}
                                className={`d-flex align-items-center text-white-50 ps-5 ${isActive(subItem.path) ? 'bg-primary-custom-dark text-white' : ''}`}
                                style={{ padding: '0.5rem 1rem 0.5rem 3rem' }}
                              >
                                <span>{subItem.label}</span>
                              </Nav.Link>
                            ))}
                          </div>
                        </Collapse>
                      )}
                    </div>
                  ) : (
                    <Nav.Link
                      as={Link}
                      to={item.path}
                      className={`d-flex align-items-center text-white ${collapsed ? 'justify-content-center' : ''} ${isActive(item.path) ? 'bg-primary-custom-dark' : ''}`}
                      style={{ padding: collapsed ? '0.75rem 0.5rem' : '0.75rem 1rem' }}
                    >
                      <IconComponent size={20} className={collapsed ? '' : 'me-3'} />
                      {!collapsed && <span>{item.label}</span>}
                    </Nav.Link>
                  )}
                </Nav.Item>
              </div>
            );
          })}
        </Nav>
      </div>
    </div>
  );
};

export default AcademicSidebar;
