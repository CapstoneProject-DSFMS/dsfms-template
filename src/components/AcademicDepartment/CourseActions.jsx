import React from 'react';
import { Button } from 'react-bootstrap';
import { Eye, XCircle, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import PortalDropdown from '../Common/PortalDropdown';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const CourseActions = ({ course, onView, onDisable }) => {
  const handleViewClick = () => {
    console.log('🔍 CourseActions - View Details clicked for course:', course.id);
    onView(course.id);
  };

  const handleArchiveClick = () => {
    console.log('🔍 CourseActions - Archive Course clicked for course:', course.id);
    onDisable(course.id);
  };

  return (
    <div className="position-relative course-actions-dropdown">
      <PortalDropdown
        trigger={<ThreeDotsVertical size={16} />}
        placement="bottom-end"
        className="d-inline-block"
      >
        <button 
          onClick={handleViewClick}
          className="dropdown-item d-flex align-items-center transition-all border-bottom"
          style={{ 
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <Eye className="me-2" size={16} />
          View Details
        </button>
        
        <button 
          onClick={handleArchiveClick}
          className="dropdown-item d-flex align-items-center transition-all text-warning"
          style={{ 
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <XCircle className="me-2" size={16} />
          Archive Course
        </button>
      </PortalDropdown>
    </div>
  );
};

export default CourseActions;
