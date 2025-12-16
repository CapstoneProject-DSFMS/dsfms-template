import React from 'react';
import { Badge } from 'react-bootstrap';
import { useAuth } from '../../../hooks/useAuth';
import PermissionWrapper from '../../Common/PermissionWrapper';
import PortalUnifiedDropdown from '../../Common/PortalUnifiedDropdown';
import DisableRoleButton from './DisableRoleButton';
import { Eye, Pencil, Trash, ShieldX } from 'react-bootstrap-icons';
import { PERMISSION_IDS } from '../../../constants/permissionIds';
// import '../../../styles/dropdown-clean.css'; // Moved to dropdown-unified.css in App.jsx

const RoleRow = ({ role, index, onView, onEdit, onDelete, onDisable }) => {
  const { hasPermission } = useAuth();
  
  const getStatusVariant = (status) => {
    return status === 'Active' ? 'success' : 'secondary';
  };

  const getStatusIcon = (status) => {
    return status === 'Active' ? '●' : '○';
  };

  return (
    <>
      {/* Status Banner for Inactive Roles */}
      {role.status === 'Inactive' && (
        <tr className="bg-warning bg-opacity-10">
          <td colSpan="4" className="border-0 py-2">
            <div className="d-flex align-items-center text-warning">
              <ShieldX className="me-2" size={16} />
              <small className="fw-semibold">
                This role is currently disabled and cannot be assigned to new users.
              </small>
            </div>
          </td>
        </tr>
      )}
      
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
        <td className="border-neutral-200 align-middle">
          <div>
            <div className="fw-semibold text-primary-custom">
              {role.name}
            </div>
            <small className="text-muted">
              {role.permissions?.length || 0} permission{role.permissions?.length !== 1 ? 's' : ''}
            </small>
          </div>
        </td>
        
        <td className="border-neutral-200 align-middle">
          <div className="d-flex align-items-center">
            <span className="fw-medium text-dark me-2">
              {role.assignedUsers}
            </span>
            <small className="text-muted">
              user{role.assignedUsers !== 1 ? 's' : ''}
            </small>
          </div>
        </td>
        
        <td className="border-neutral-200 align-middle">
          <Badge 
            bg={getStatusVariant(role.status)}
            className="px-2 py-1 d-flex align-items-center"
            style={{ 
              fontSize: '0.75rem',
              width: 'fit-content'
            }}
          >
            <span className="me-1" style={{ fontSize: '0.8rem' }}>
              {getStatusIcon(role.status)} TEST
            </span>
            {role.status?.replace(/_/g, ' ')}
          </Badge>
        </td>
        
        <td className="border-neutral-200 align-middle text-center">
          <div className="d-flex justify-content-center gap-1">
            {/* Disable Role Button - Hide for ADMIN role */}
            {role.status === 'Active' && role.name.toLowerCase() !== 'administrator' && (
              <PermissionWrapper 
                permission={PERMISSION_IDS.DISABLE_ROLE}
                fallback={null}
              >
                <DisableRoleButton
                  roleId={role.id}
                  roleName={role.name}
                  onDisable={onDisable}
                  size="sm"
                />
              </PermissionWrapper>
            )}
            
            {/* Actions Dropdown */}
            <PermissionWrapper 
              permissions={[PERMISSION_IDS.VIEW_ROLE_IN_DETAIL, PERMISSION_IDS.UPDATE_ROLE]}
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
                  children: (
                    <span className="d-flex align-items-center">
                      <span className="me-1">⋯</span>
                      <span style={{ fontSize: '0.7rem' }}>▼</span>
                    </span>
                  )
                }}
                items={[
                  {
                    label: 'View Details',
                    icon: <Eye />,
                    onClick: () => onView(role),
                    permission: PERMISSION_IDS.VIEW_ROLE_IN_DETAIL
                  },
                  {
                    label: 'Edit Role',
                    icon: <Pencil />,
                    onClick: () => onEdit(role),
                    permission: PERMISSION_IDS.UPDATE_ROLE
                  },
                  // Only show delete option if role is not ADMIN
                  ...(role.name.toLowerCase() !== 'administrator' ? [
                    { type: 'divider' },
                    {
                      label: 'Delete Role',
                      icon: <Trash />,
                      className: 'text-danger',
                      onClick: () => onDelete(role),
                      permission: PERMISSION_IDS.DISABLE_ROLE
                    }
                  ] : [])
                ]}
              />
            </PermissionWrapper>
          </div>
        </td>
      </tr>
    </>
  );
};

export default RoleRow;
