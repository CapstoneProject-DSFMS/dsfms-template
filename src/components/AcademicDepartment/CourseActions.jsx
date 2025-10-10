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
    <div className="position-relative course-actions-dropdown">
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
          className="position-absolute bg-white border rounded shadow-sm"
          style={{
            top: '100%',
            right: 0,
            zIndex: 1050,
            minWidth: '150px'
          }}
        >
          <div 
            className="dropdown-item border-bottom"
            onClick={handleViewClick}
            style={{ cursor: 'pointer' }}
          >
            <Eye className="me-2" size={16} />
            View Details
          </div>
          
          <div 
            className="dropdown-item text-warning"
            onClick={handleDisableClick}
            style={{ cursor: 'pointer' }}
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
            zIndex: 999
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default CourseActions;
