import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Pencil, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const TrainerActions = ({ trainer, onEdit, onDelete }) => (
  <PortalUnifiedDropdown
    align="end"
    className="table-dropdown"
    placement="bottom-end"
    trigger={{
      variant: 'light',
      className: 'btn btn-light btn-sm border-0',
      children: <ThreeDotsVertical size={16} />
    }}
    items={[
      {
        label: 'Edit Trainer',
        icon: <Pencil />,
        onClick: () => onEdit(trainer.trainer_user_id),
        permission: API_PERMISSIONS.SUBJECTS.UPDATE
      },
      { type: 'divider' },
      {
        label: 'Remove Trainer',
        icon: <Trash />,
        className: 'text-danger',
        onClick: () => onDelete(trainer.trainer_user_id),
        permission: API_PERMISSIONS.SUBJECTS.REMOVE_INSTRUCTOR
      }
    ]}
  />
);

export default TrainerActions;

