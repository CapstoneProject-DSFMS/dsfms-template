import React from 'react';
import { Eye, Pencil, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const TraineeActions = ({ trainee, onRefresh }) => (
  <PermissionWrapper 
    permissions={[API_PERMISSIONS.TRAINEES.VIEW_DETAIL, API_PERMISSIONS.TRAINEES.UPDATE, API_PERMISSIONS.TRAINEES.DELETE]}
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
          permission: API_PERMISSIONS.TRAINEES.VIEW_DETAIL
        },
        {
          label: 'Edit Trainee',
          icon: <Pencil />,
          onClick: () => window.location.href = `/trainee/${trainee.id}/edit`,
          permission: API_PERMISSIONS.TRAINEES.UPDATE
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
          permission: API_PERMISSIONS.TRAINEES.DELETE
        }
      ]}
    />
  </PermissionWrapper>
);

export default TraineeActions;
