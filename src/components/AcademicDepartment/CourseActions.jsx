import React from 'react';
import { Eye, XCircle, ThreeDotsVertical } from 'react-bootstrap-icons';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';

const CourseActions = ({ course, onView, onDisable }) => {
  const handleViewClick = () => {
    onView && onView(course.id);
  };

  const handleArchiveClick = () => {
    onDisable && onDisable(course.id);
  };

  return (
    <PermissionWrapper 
      permissions={[PERMISSION_IDS.VIEW_COURSE_DETAILS, PERMISSION_IDS.ARCHIVE_COURSE, PERMISSION_IDS.UPDATE_COURSE]}
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
            permission: PERMISSION_IDS.VIEW_COURSE_DETAILS
          },
          { type: 'divider' },
          {
            label: 'Archive Course',
            icon: <XCircle />,
            className: 'text-danger',
            onClick: handleArchiveClick,
            permission: PERMISSION_IDS.ARCHIVE_COURSE
          }
        ]}
      />
    </PermissionWrapper>
  );
};

export default CourseActions;
