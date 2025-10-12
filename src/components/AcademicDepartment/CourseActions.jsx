import React, { useState, useRef, useEffect } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { Eye, XCircle, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const CourseActions = ({ course, onView, onDisable }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const handleViewClick = () => {
    console.log('🔍 CourseActions - View Details clicked for course:', course.id);
    setShowDropdown(false);
    onView(course.id);
  };

  const handleDisableClick = () => {
    console.log('🔍 CourseActions - Disable Course clicked for course:', course.id);
    setShowDropdown(false);
    onDisable(course.id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Position dropdown dynamically using fixed positioning
  useEffect(() => {
    if (showDropdown && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuElement = menuRef.current;

      let top = buttonRect.bottom + 5; // Default: open 5px below the button
      let left = buttonRect.left; // Default: align left edge with button

      // Check if dropdown goes off screen at the bottom
      if (top + menuElement.offsetHeight > window.innerHeight) {
        // If it does, try to open upwards
        top = buttonRect.top - menuElement.offsetHeight - 5; // 5px margin above button
        // If opening upwards also goes off screen at the top, fallback to top of viewport
        if (top < 0) {
          top = 5; // 5px from top of viewport
        }
      }

      // Check if dropdown goes off screen at the right
      if (left + menuElement.offsetWidth > window.innerWidth) {
        // If it does, align right edge with button's right edge
        left = buttonRect.right - menuElement.offsetWidth;
        // If aligning right also goes off screen at the left, fallback to left of viewport
        if (left < 0) {
          left = 5; // 5px from left of viewport
        }
      }

      // Apply calculated fixed position
      menuElement.style.top = `${top}px`;
      menuElement.style.left = `${left}px`;
      menuElement.style.position = 'fixed'; // Ensure it's fixed
    }
  }, [showDropdown]);

  return (
    <div className="position-relative course-actions-dropdown">
      <Button
        variant="light"
        size="sm"
        className="border-0"
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation(); // Prevent row click event
          console.log('🔍 CourseActions - Toggle clicked');
          setShowDropdown(!showDropdown);
        }}
      >
        <ThreeDotsVertical size={16} />
      </Button>
      
      {showDropdown && (
        <div 
          ref={menuRef}
          className="bg-white border rounded shadow-lg"
          style={{
            position: 'fixed',
            zIndex: 1060,
            minWidth: '150px',
            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            borderRadius: '0.375rem',
            top: '0',
            left: '0'
          }}
        >
          <div 
            className="dropdown-item border-bottom"
            onClick={handleViewClick}
            style={{ 
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.15s ease-in-out'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Eye className="me-2" size={16} />
            View Details
          </div>
          
          <div 
            className="dropdown-item text-warning"
            onClick={handleDisableClick}
            style={{ 
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.15s ease-in-out'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <XCircle className="me-2" size={16} />
            Disable Course
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseActions;
