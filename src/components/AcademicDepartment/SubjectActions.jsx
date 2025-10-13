import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Eye, SlashCircle, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const SubjectActions = ({ subject, onView, onEdit, onDelete }) => {
  const handleViewClick = () => {
    console.log('🔍 SubjectActions - View Details clicked for subject:', subject.id);
    onView && onView(subject.id);
  };

  const handleDeleteClick = () => {
    console.log('🔍 SubjectActions - Delete Subject clicked for subject:', subject.id);
    onDelete && onDelete(subject.id);
  };

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
      items={[
        {
          label: 'View Details',
          icon: <Eye />,
          onClick: handleViewClick,
          permission: API_PERMISSIONS.SUBJECTS.VIEW_DETAIL
        },
        { type: 'divider' },
        {
          label: 'Disable Subject',
          icon: <SlashCircle />,
          className: 'text-warning',
          onClick: handleDeleteClick,
          permission: API_PERMISSIONS.SUBJECTS.DELETE
        }
      ]}
    />
  );
};

export default SubjectActions;
