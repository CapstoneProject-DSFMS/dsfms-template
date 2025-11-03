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
  
  // Debug logging to help diagnose permission issues
  if (process.env.NODE_ENV === 'development') {
    const coursePermissions = userPermissions?.filter(p => 
      (p.name?.toLowerCase().includes('course') || p.path?.includes('/courses')) &&
      (p.name?.toLowerCase().includes('detail') || p.name?.toLowerCase().includes('update') || p.name?.toLowerCase().includes('archive'))
    ) || [];
    
    // Get all course-related permissions for detailed analysis
    const allCoursePermissions = userPermissions?.filter(p => 
      p.name?.toLowerCase().includes('course') || 
      p.path?.includes('/courses') ||
      p.path?.includes('/course')
    ) || [];
    
    console.log('🔍 CourseActions Permission Check:', {
      courseId: course?.id,
      courseStatus: course?.status,
      checkingPermissions: {
        VIEW_DETAIL: {
          constant: API_PERMISSIONS.COURSES.VIEW_DETAIL,
          hasPermission: canViewDetail,
          checkingIn: {
            names: userPermissions?.some(p => p.name === API_PERMISSIONS.COURSES.VIEW_DETAIL),
            paths: userPermissions?.some(p => p.path === API_PERMISSIONS.COURSES.VIEW_DETAIL.replace(/^[A-Z]+\s/, '')),
            ids: userPermissions?.some(p => p.id === API_PERMISSIONS.COURSES.VIEW_DETAIL)
          }
        },
        ARCHIVE: {
          constant: API_PERMISSIONS.COURSES.ARCHIVE,
          hasPermission: canArchive,
          checkingIn: {
            names: userPermissions?.some(p => p.name === API_PERMISSIONS.COURSES.ARCHIVE),
            paths: userPermissions?.some(p => p.path === API_PERMISSIONS.COURSES.ARCHIVE.replace(/^[A-Z]+\s/, '')),
            ids: userPermissions?.some(p => p.id === API_PERMISSIONS.COURSES.ARCHIVE)
          }
        },
        UPDATE: {
          constant: API_PERMISSIONS.COURSES.UPDATE,
          hasPermission: canUpdate,
          checkingIn: {
            names: userPermissions?.some(p => p.name === API_PERMISSIONS.COURSES.UPDATE),
            paths: userPermissions?.some(p => p.path === API_PERMISSIONS.COURSES.UPDATE.replace(/^[A-Z]+\s/, '')),
            ids: userPermissions?.some(p => p.id === API_PERMISSIONS.COURSES.UPDATE)
          }
        },
        FINAL_ARCHIVE_PERMISSION: canArchiveCourse
      },
      relevantPermissions: coursePermissions.map(p => ({
        name: p.name,
        path: p.path,
        id: p.id,
        method: p.method
      })),
      allCoursePermissions: allCoursePermissions.map(p => ({
        name: p.name,
        path: p.path,
        id: p.id,
        method: p.method
      })),
      // Show first 10 permissions for debugging
      sampleUserPermissions: userPermissions?.slice(0, 10).map(p => ({ 
        name: p.name, 
        path: p.path,
        id: p.id,
        method: p.method
      })) || []
    });
    
    // Log permissions that might match
    console.log('🔍 Potential Matches:', {
      viewDetailMatches: userPermissions?.filter(p => 
        p.name?.toLowerCase().includes('view') && p.name?.toLowerCase().includes('course') && p.name?.toLowerCase().includes('detail') ||
        p.path?.includes('/courses') && (p.path?.includes('/:id') || p.path?.includes('/:courseId'))
      ).map(p => ({ name: p.name, path: p.path, method: p.method })),
      archiveMatches: userPermissions?.filter(p => 
        p.name?.toLowerCase().includes('archive') && p.name?.toLowerCase().includes('course') ||
        p.path?.includes('/courses') && p.path?.includes('archive')
      ).map(p => ({ name: p.name, path: p.path, method: p.method })),
      updateMatches: userPermissions?.filter(p => 
        p.name?.toLowerCase().includes('update') && p.name?.toLowerCase().includes('course') ||
        p.path?.includes('/courses') && (p.method === 'PUT' || p.method === 'PATCH')
      ).map(p => ({ name: p.name, path: p.path, method: p.method }))
    });
  }
  
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
      className: 'text-warning',
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
