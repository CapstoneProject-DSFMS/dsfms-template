import React from 'react';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { Eye, Trash, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const EnrolledTraineeActions = ({ trainee, onViewSubjects, onRemoveTrainee }) => (
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
        label: 'View Subject List',
        icon: <Eye />,
        onClick: () => onViewSubjects(trainee),
        permission: API_PERMISSIONS.SUBJECTS.VIEW_DETAIL
      },
      { type: 'divider' },
      {
        label: 'Remove Trainee',
        icon: <Trash />,
        className: 'text-danger',
        onClick: () => onRemoveTrainee(trainee.id),
        permission: API_PERMISSIONS.SUBJECTS.DELETE
      }
    ]}
  />
);

export default EnrolledTraineeActions;
