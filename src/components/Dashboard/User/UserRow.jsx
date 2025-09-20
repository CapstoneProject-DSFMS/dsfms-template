import React from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { Eye, Pencil, PersonX, CheckCircle, ThreeDots } from 'react-bootstrap-icons';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS } from '../../../constants/permissions';
import PermissionWrapper from '../../Common/PermissionWrapper';

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
              onClick={() => onView(user)}
              className="text-primary-custom d-flex align-items-center"
            >
              <Eye className="me-2" size={16} />
              View Details
            </Dropdown.Item>
            <PermissionWrapper 
              permission={PERMISSIONS.MANAGE_USERS}
              fallback={null}
            >
              <Dropdown.Item
                onClick={() => onEdit(user)}
                className="text-primary-custom d-flex align-items-center"
              >
                <Pencil className="me-2" size={16} />
                Edit User
              </Dropdown.Item>
            </PermissionWrapper>
            <PermissionWrapper 
              permission={PERMISSIONS.MANAGE_USERS}
              fallback={null}
            >
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => onDisable(user)}
                className={`d-flex align-items-center ${
                  user.status === 'Active' ? 'text-warning' : 'text-success'
                }`}
              >
                {user.status === 'Active' ? (
                  <>
                    <PersonX className="me-2" size={16} />
                    Disable User
                  </>
                ) : (
                  <>
                    <CheckCircle className="me-2" size={16} />
                    Enable User
                  </>
                )}
              </Dropdown.Item>
            </PermissionWrapper>
          </Dropdown.Menu>
        </Dropdown>
      </td>
    </tr>
  );
};

export default UserRow;
