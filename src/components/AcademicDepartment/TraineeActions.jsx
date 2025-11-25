import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Eye, PersonX, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';

const TraineeActions = ({ trainee, onView, onRemove }) => {
  const handleViewClick = () => {
    onView && onView(trainee);
  };

  const handleRemoveClick = () => {
    onRemove && onRemove(trainee);
  };

  return (
    <PermissionWrapper 
      permission={PERMISSION_IDS.REMOVE_TRAINEE_FROM_ENROLLMENT}
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
            onClick: handleViewClick
          },
          { type: 'divider' },
          {
            label: 'Remove from Course',
            icon: <PersonX />,
            className: 'text-danger',
            onClick: handleRemoveClick,
            permission: PERMISSION_IDS.REMOVE_TRAINEE_FROM_ENROLLMENT
          }
        ]}
      />
    </PermissionWrapper>
  );
};

export default TraineeActions;