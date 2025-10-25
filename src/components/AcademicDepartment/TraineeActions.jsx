import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Eye, PersonX, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const TraineeActions = ({ trainee, onView, onRemove }) => {
  const handleViewClick = () => {
    onView && onView(trainee);
  };

  const handleRemoveClick = () => {
    onRemove && onRemove(trainee);
  };

  return (
    <PermissionWrapper 
      permissions={[API_PERMISSIONS.TRAINEES.VIEW_DETAIL, API_PERMISSIONS.TRAINEES.DELETE]}
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
            permission: API_PERMISSIONS.TRAINEES.VIEW_DETAIL
          },
          { type: 'divider' },
          {
            label: 'Remove from Course',
            icon: <PersonX />,
            className: 'text-danger',
            onClick: handleRemoveClick,
            permission: API_PERMISSIONS.TRAINEES.DELETE
          }
        ]}
      />
    </PermissionWrapper>
  );
};

export default TraineeActions;