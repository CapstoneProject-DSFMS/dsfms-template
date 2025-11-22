import React from 'react';
import { Eye, Pencil, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { PERMISSION_IDS } from '../../constants/permissionIds';

const TraineeActions = ({ trainee, onRefresh }) => (
  <PermissionWrapper 
    permissions={[PERMISSION_IDS.VIEW_USER_IN_DETAIL, PERMISSION_IDS.UPDATE_USER, PERMISSION_IDS.DISABLE_USER]}
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
          onClick: () => window.location.href = `/trainee/${trainee.id}`,
          permission: PERMISSION_IDS.VIEW_USER_IN_DETAIL
        },
        {
          label: 'Edit Trainee',
          icon: <Pencil />,
          onClick: () => window.location.href = `/trainee/${trainee.id}/edit`,
          permission: PERMISSION_IDS.UPDATE_USER
        },
        { type: 'divider' },
        {
          label: 'Delete Trainee',
          icon: <Trash />,
          className: 'text-danger',
          onClick: () => {
            // TODO: Implement delete functionality
            console.log('Delete trainee:', trainee.id);
          },
          permission: PERMISSION_IDS.DISABLE_USER
        }
      ]}
    />
  </PermissionWrapper>
);

export default TraineeActions;
