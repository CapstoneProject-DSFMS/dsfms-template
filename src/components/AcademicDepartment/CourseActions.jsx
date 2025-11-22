import React from 'react';
import { Eye, XCircle, ThreeDotsVertical } from 'react-bootstrap-icons';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_IDS } from '../../constants/permissionIds';

const CourseActions = ({ course, onView, onDisable }) => {
  const { hasPermission, userPermissions, userRole } = usePermissions();
  
  // Check permissions
  const canViewDetail = hasPermission(PERMISSION_IDS.VIEW_COURSE_IN_DETAIL);
  const canArchive = hasPermission(PERMISSION_IDS.ARCHIVE_COURSE);
  // Fallback to UPDATE permission if ARCHIVE permission doesn't exist
  const canUpdate = hasPermission(PERMISSION_IDS.UPDATE_COURSE);
  const canArchiveCourse = canArchive || canUpdate; // Use ARCHIVE if available, otherwise fallback to UPDATE
  
  const handleViewClick = () => {
    if (onView && canViewDetail) {
      onView(course.id);
    }
  };

  const handleArchiveClick = () => {
    if (onDisable && canArchiveCourse) {
      onDisable(course.id);
    }
  };

  // Build items array - always show dropdown for consistency
  const items = [];
  
  items.push({
    label: 'View Details',
    icon: <Eye />,
    onClick: handleViewClick,
    disabled: !canViewDetail
  });

  items.push({ type: 'divider' });

  // Only show Archive action (courses with ARCHIVED status are filtered out upstream)
  items.push({
    label: 'Archive Course',
    icon: <XCircle />,
    className: 'text-danger',
    onClick: handleArchiveClick,
    disabled: !canArchiveCourse
  });

  return (
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
      items={items}
    />
  );
};

export default CourseActions;
