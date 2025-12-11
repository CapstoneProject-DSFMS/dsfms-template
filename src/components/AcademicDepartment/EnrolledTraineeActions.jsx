import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Eye, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';

const EnrolledTraineeActions = ({ trainee, onViewSubjects, onRemoveTrainee }) => (
  <PermissionWrapper 
    permissions={[PERMISSION_IDS.VIEW_SUBJECT_DETAILS, PERMISSION_IDS.REMOVE_TRAINEE_FROM_ENROLLMENT]}
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
          label: 'View Subject List',
          icon: <Eye />,
          onClick: () => onViewSubjects(trainee),
            permission: PERMISSION_IDS.VIEW_SUBJECT_DETAILS
        },
        { type: 'divider' },
        {
          label: 'Remove Trainee',
          icon: <Trash />,
          className: 'text-danger',
          onClick: () => onRemoveTrainee(trainee.id),
            permission: PERMISSION_IDS.REMOVE_TRAINEE_FROM_ENROLLMENT
        }
      ]}
    />
  </PermissionWrapper>
);

export default EnrolledTraineeActions;
