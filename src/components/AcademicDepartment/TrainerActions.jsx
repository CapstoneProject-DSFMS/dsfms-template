import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Pencil, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const TrainerActions = ({ trainer, onEdit, onDelete }) => (
  <PermissionWrapper 
    permissions={[API_PERMISSIONS.SUBJECTS.UPDATE, API_PERMISSIONS.SUBJECTS.REMOVE_INSTRUCTOR]}
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
          label: 'Edit Trainer',
          icon: <Pencil />,
          onClick: () => onEdit(trainer.id),
          permission: API_PERMISSIONS.SUBJECTS.UPDATE
        },
        { type: 'divider' },
        {
          label: 'Remove Trainer',
          icon: <Trash />,
          className: 'text-danger',
          onClick: () => onDelete(trainer.id),
          permission: API_PERMISSIONS.SUBJECTS.REMOVE_INSTRUCTOR
        }
      ]}
    />
  </PermissionWrapper>
);

export default TrainerActions;

