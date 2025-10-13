import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Pencil, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const TraineeActions = ({ trainee, onEdit, onDelete }) => (
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
        label: 'Edit Trainee',
        icon: <Pencil />,
        onClick: () => onEdit(trainee.id),
        permission: API_PERMISSIONS.SUBJECTS.UPDATE
      },
      {
        label: 'Remove Trainee',
        icon: <Trash />,
        className: 'text-danger',
        onClick: () => onDelete(trainee.id),
        permission: API_PERMISSIONS.SUBJECTS.REMOVE_TRAINEE
      }
    ]}
  />
);

export default TraineeActions;

