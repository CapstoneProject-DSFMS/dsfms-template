import React from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { Eye, Pencil, Trash, ThreeDots, ShieldX } from 'react-bootstrap-icons';
import DisableRoleButton from './DisableRoleButton';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS_BY_UC } from '../../../constants/permissions';
import PermissionWrapper from '../../Common/PermissionWrapper';

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
              {getStatusIcon(role.status)}
            </span>
            {role.status}
          </Badge>
        </td>
        
        <td className="border-neutral-200 align-middle text-center">
          <div className="d-flex justify-content-center gap-1">
            {/* Disable Role Button */}
            {role.status === 'Active' && (
              <PermissionWrapper 
                permission={PERMISSIONS_BY_UC['UC-07'].title}
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
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                className="text-primary-custom p-1"
                style={{ 
                  border: 'none', 
                  background: 'transparent',
                  boxShadow: 'none'
                }}
              >
                <ThreeDots size={16} />
              </Dropdown.Toggle>

              <Dropdown.Menu className="border-0 shadow">
                <Dropdown.Item
                  onClick={() => onView(role)}
                  className="text-primary-custom d-flex align-items-center"
                >
                  <Eye className="me-2" size={16} />
                  View Details
                </Dropdown.Item>
                <PermissionWrapper 
                  permission={PERMISSIONS_BY_UC['UC-07'].title}
                  fallback={null}
                >
                  <Dropdown.Item
                    onClick={() => onEdit(role)}
                    className="text-primary-custom d-flex align-items-center"
                  >
                    <Pencil className="me-2" size={16} />
                    Edit Role
                  </Dropdown.Item>
                </PermissionWrapper>
                <PermissionWrapper 
                  permission={PERMISSIONS_BY_UC['UC-07'].title}
                  fallback={null}
                >
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => onDelete(role.id)}
                    className="text-danger d-flex align-items-center"
                  >
                    <Trash className="me-2" size={16} />
                    Delete Role
                  </Dropdown.Item>
                </PermissionWrapper>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </td>
      </tr>
    </>
  );
};

export default RoleRow;
