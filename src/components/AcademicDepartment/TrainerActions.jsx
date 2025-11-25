import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Pencil, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';

const TrainerActions = ({ trainer, onEdit, onDelete }) => (
  <PermissionWrapper 
    permissions={[PERMISSION_IDS.UPDATE_SUBJECT, PERMISSION_IDS.REMOVE_TRAINERS]}
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
          permission: PERMISSION_IDS.UPDATE_SUBJECT
        },
        { type: 'divider' },
        {
          label: 'Remove Trainer',
          icon: <Trash />,
          className: 'text-danger',
          onClick: () => onDelete(trainer.id),
          permission: PERMISSION_IDS.REMOVE_TRAINERS
        }
      ]}
    />
  </PermissionWrapper>
);

export default TrainerActions;

