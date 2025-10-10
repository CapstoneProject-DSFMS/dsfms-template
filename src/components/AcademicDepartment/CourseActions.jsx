import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { Eye, XCircle, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const CourseActions = ({ course, onView, onDisable }) => {
  const [showDropdown, setShowDropdown] = useState(false);

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

  return (
    <div className="position-relative course-actions-dropdown" style={{ zIndex: showDropdown ? 1060 : 'auto' }}>
      <Button
        variant="light"
        size="sm"
        className="border-0"
        onClick={() => {
          console.log('🔍 CourseActions - Toggle clicked');
          setShowDropdown(!showDropdown);
        }}
      >
        <ThreeDotsVertical size={16} />
      </Button>
      
      {showDropdown && (
        <div 
          className="position-absolute bg-white border rounded shadow-lg"
          style={{
            top: '100%',
            right: 0,
            zIndex: 1060,
            minWidth: '150px',
            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            borderRadius: '0.375rem'
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
      
      {showDropdown && (
        <div 
          className="position-fixed"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1055
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default CourseActions;
