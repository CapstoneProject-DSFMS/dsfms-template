import React from 'react';
import { Badge } from 'react-bootstrap';
import { useAuth } from '../../../hooks/useAuth';
import PermissionWrapper from '../../Common/PermissionWrapper';
import PortalUnifiedDropdown from '../../Common/PortalUnifiedDropdown';
import { Eye, Pencil, PersonX, ThreeDotsVertical } from 'react-bootstrap-icons';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';

const UserRow = ({ user, index, onView, onEdit, onDisable }) => {
  
  const getStatusVariant = (status) => {
    return status === 'ACTIVE' ? 'success' : 'secondary';
  };

  const getStatusIcon = (status) => {
    return status === 'ACTIVE' ? '●' : '○';
  };

  return (
    <tr 
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
      style={{
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
      }}
    >
      <td className="border-neutral-200 align-middle show-mobile">
        <span className="fw-semibold text-primary-custom">
          {user.eid}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <div className="fw-medium text-dark">
          {user.fullName}
        </div>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <span className="text-dark">
          {user.email}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <Badge 
          bg="secondary" 
          className="px-2 py-1"
          style={{ 
            backgroundColor: 'var(--bs-secondary)',
            fontSize: '0.75rem'
          }}
        >
          {user.role}
        </Badge>
      </td>
      
      <td className="border-neutral-200 align-middle hide-mobile">
        <span className="text-dark">
          {user.department}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <Badge 
          bg={getStatusVariant(user.status)}
          className="px-2 py-1 d-flex align-items-center"
          style={{ 
            fontSize: '0.75rem',
            width: 'fit-content'
          }}
        >
          <span className="me-1" style={{ fontSize: '0.8rem' }}>
            {getStatusIcon(user.status)}
          </span>
          {user.status}
        </Badge>
      </td>
      
      <td className="border-neutral-200 align-middle text-center show-mobile">
        <PermissionWrapper 
          permissions={[API_PERMISSIONS.USERS.VIEW_DETAIL, API_PERMISSIONS.USERS.UPDATE]}
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
                onClick: () => onView(user),
                permission: API_PERMISSIONS.USERS.VIEW_DETAIL
              },
              {
                label: 'Edit User',
                icon: <Pencil />,
                onClick: () => onEdit(user),
                permission: API_PERMISSIONS.USERS.UPDATE
              },
              { type: 'divider' },
              {
                label: user.status === 'ACTIVE' ? 'Disable User' : 'Enable User',
                icon: <PersonX />,
                className: 'text-danger',
                onClick: () => onDisable(user),
                permission: API_PERMISSIONS.USERS.UPDATE
              }
            ]}
          />
        </PermissionWrapper>
      </td>
    </tr>
  );
};

export default UserRow;
