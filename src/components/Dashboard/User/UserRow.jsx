import React from 'react';
import { Badge } from 'react-bootstrap';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS_BY_UC } from '../../../constants/permissions';
import PermissionWrapper from '../../Common/PermissionWrapper';
import { ActionDropdown } from '../../Common';

const UserRow = ({ user, index, onView, onEdit, onDisable }) => {
  const { hasPermission } = useAuth();
  
  const getStatusVariant = (status) => {
    return status === 'Active' ? 'success' : 'secondary';
  };

  const getStatusIcon = (status) => {
    return status === 'Active' ? '●' : '○';
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
          permission={PERMISSIONS_BY_UC['UC-06'].title}
          fallback={null}
        >
          <ActionDropdown
            item={user}
            onView={onView}
            onEdit={onEdit}
            onToggleStatus={onDisable}
            viewLabel="View Details"
            editLabel="Edit User"
            toggleLabel={user.status === 'Active' ? 'Disable User' : 'Enable User'}
            statusField="status"
            activeValue="Active"
            inactiveValue="Inactive"
          />
        </PermissionWrapper>
      </td>
    </tr>
  );
};

export default UserRow;
