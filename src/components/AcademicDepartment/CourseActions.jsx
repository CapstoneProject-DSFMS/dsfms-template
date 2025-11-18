import React from 'react';
import { Eye, XCircle, ThreeDotsVertical, ArrowCounterclockwise } from 'react-bootstrap-icons';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { usePermissions } from '../../hooks/usePermissions';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const CourseActions = ({ course, onView, onDisable, onRestore }) => {
  const { hasPermission, userPermissions, userRole } = usePermissions();
  
  // Check permissions
  const canViewDetail = hasPermission(API_PERMISSIONS.COURSES.VIEW_DETAIL);
  const canArchive = hasPermission(API_PERMISSIONS.COURSES.ARCHIVE);
  // Fallback to UPDATE permission if ARCHIVE permission doesn't exist
  const canUpdate = hasPermission(API_PERMISSIONS.COURSES.UPDATE);
  const canRestore = hasPermission(API_PERMISSIONS.COURSES.RESTORE);
  const canArchiveCourse = canArchive || canUpdate; // Use ARCHIVE if available, otherwise fallback to UPDATE
  
  // Check if course is already archived
  const isArchived = course?.status === 'ARCHIVED';
  
  const handleViewClick = () => {
    if (onView && canViewDetail) {
      onView(course.id);
    }
  };

  const handleArchiveClick = () => {
    if (onDisable && canArchiveCourse && !isArchived) {
      onDisable(course.id);
    }
  };

  const handleRestoreClick = () => {
    if (onRestore && canRestore && isArchived) {
      onRestore(course.id);
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

  // Show Archive or Restore based on course status
  if (isArchived) {
    items.push({
      label: 'Restore Course',
      icon: <ArrowCounterclockwise />,
      className: 'text-success',
      onClick: handleRestoreClick,
      disabled: !canRestore
    });
  } else {
    items.push({
      label: 'Archive Course',
      icon: <XCircle />,
      className: 'text-danger',
      onClick: handleArchiveClick,
      disabled: !canArchiveCourse
    });
  }

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
