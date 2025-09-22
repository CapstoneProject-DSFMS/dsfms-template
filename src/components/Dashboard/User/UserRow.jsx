import React from 'react';
import { Badge } from 'react-bootstrap';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS_BY_UC } from '../../../constants/permissions';
import PermissionWrapper from '../../Common/PermissionWrapper';
import { Dropdown } from 'react-bootstrap';
import { Eye, Pencil, PersonX, ThreeDotsVertical } from 'react-bootstrap-icons';
import '../../../styles/dropdown-clean.css';

const UserRow = ({ user, index, onView, onEdit, onDisable }) => {
  
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
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="light" 
              size="sm" 
              id={`user-actions-${user.id}`} 
              className="border-0"
            >
              <ThreeDotsVertical size={16} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm">
              <Dropdown.Item 
                onClick={() => onView(user)}
                className="d-flex align-items-center transition-all"
                style={{
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  e.target.style.paddingLeft = '1.5rem';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.paddingLeft = '1rem';
                }}
              >
                <Eye className="me-2" size={16} />
                View Details
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => onEdit(user)}
                className="d-flex align-items-center transition-all"
                style={{
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  e.target.style.paddingLeft = '1.5rem';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.paddingLeft = '1rem';
                }}
              >
                <Pencil className="me-2" size={16} />
                Edit User
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                onClick={() => onDisable(user)}
                className="d-flex align-items-center transition-all text-danger"
                style={{
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                  e.target.style.paddingLeft = '1.5rem';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.paddingLeft = '1rem';
                }}
              >
                <PersonX className="me-2" size={16} />
                {user.status === 'Active' ? 'Disable User' : 'Enable User'}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </PermissionWrapper>
      </td>
    </tr>
  );
};

export default UserRow;
