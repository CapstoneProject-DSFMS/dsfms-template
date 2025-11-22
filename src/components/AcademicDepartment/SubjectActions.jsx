import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Eye, Archive, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';

const SubjectActions = ({ subject, onView, onEdit, onDelete }) => {
  const handleViewClick = () => {
    onView && onView(subject.id);
  };

  const handleDeleteClick = () => {
    onDelete && onDelete(subject.id);
  };

  return (
    <PermissionWrapper 
      permissions={[PERMISSION_IDS.VIEW_SUBJECT_DETAIL, PERMISSION_IDS.ARCHIVE_SUBJECT]}
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
            permission: PERMISSION_IDS.VIEW_SUBJECT_DETAIL
          },
          { type: 'divider' },
          {
            label: 'Archive Subject',
            icon: <Archive />,
            className: 'text-warning',
            onClick: handleDeleteClick,
            permission: PERMISSION_IDS.ARCHIVE_SUBJECT
          }
        ]}
      />
    </PermissionWrapper>
  );
};

export default SubjectActions;
