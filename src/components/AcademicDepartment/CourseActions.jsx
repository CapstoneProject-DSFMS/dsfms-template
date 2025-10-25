import React from 'react';
import { Button } from 'react-bootstrap';
import { Eye, XCircle, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const CourseActions = ({ course, onView, onDisable }) => {
  const handleViewClick = () => {
    onView(course.id);
  };

  const handleArchiveClick = () => {
    onDisable(course.id);
  };

  return (
    <PermissionWrapper 
      permissions={[API_PERMISSIONS.COURSES.VIEW_DETAIL, API_PERMISSIONS.COURSES.UPDATE]}
      fallback={null}
    >
      <PortalUnifiedDropdown
        align="end"
        className="table-dropdown"
        placement="bottom-end"
        trigger={{
          variant: 'link',
          className: 'btn btn-link p-0 text-primary-custom',
          style: { border: 'none', background: 'transparent' },
          children: <ThreeDotsVertical size={16} />
        }}
        items={[
          {
            label: 'View Details',
            icon: <Eye />,
            onClick: handleViewClick,
            permission: API_PERMISSIONS.COURSES.VIEW_DETAIL
          },
          { type: 'divider' },
          {
            label: 'Archive Course',
            icon: <XCircle />,
            className: 'text-warning',
            onClick: handleArchiveClick,
            permission: API_PERMISSIONS.COURSES.UPDATE
          }
        ]}
      />
    </PermissionWrapper>
  );
};

export default CourseActions;
