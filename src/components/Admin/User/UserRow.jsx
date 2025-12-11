import React from 'react';
import { Badge } from 'react-bootstrap';
import { useAuth } from '../../../hooks/useAuth';
import PermissionWrapper from '../../Common/PermissionWrapper';
import PortalUnifiedDropdown from '../../Common/PortalUnifiedDropdown';
import { Eye, Pencil, PersonX, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PERMISSION_IDS } from '../../../constants/permissionIds';

const UserRow = ({ user, index, onView, onEdit, onDisable }) => {
  
  const getStatusVariant = (status) => {
    return status === 'ACTIVE' ? 'success' : 'secondary';
  };

  const getStatusIcon = (status) => {
    return status === 'ACTIVE' ? '●' : '○';
  };

  // Kiểm tra xem người dùng TRONG BẢNG có phải là ADMINISTRATOR hay không.
  // Đây KHÔNG phải là kiểm tra vai trò của người dùng đang đăng nhập.
  const isAdmin = user.role === 'ADMINISTRATOR';

  return (
    <tr 
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} user-management-row`}
      style={{
        transition: 'background-color 0.2s ease',
        willChange: 'background-color'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
      }}
    >
      <td className="align-middle show-mobile">
        <span className="fw-semibold text-primary-custom">
          {user.eid}
        </span>
      </td>
      
      <td className="align-middle show-mobile">
        <div className="fw-medium text-dark">
          {user.fullName}
        </div>
      </td>
      
      <td className="align-middle show-mobile" style={{ maxWidth: '200px', overflow: 'hidden' }}>
        <span className="text-dark" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </span>
      </td>
      
      <td className="align-middle show-mobile">
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
      
      <td className="align-middle hide-mobile">
        <span className="text-dark">
          {user.department}
        </span>
      </td>
      
      <td className="align-middle show-mobile">
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
      
      <td className="align-middle text-center show-mobile">
        <PermissionWrapper 
          permissions={[PERMISSION_IDS.VIEW_USER_IN_DETAIL, PERMISSION_IDS.UPDATE_USER]}
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
                permission: PERMISSION_IDS.VIEW_USER_IN_DETAIL
              },
              {
                label: 'Edit User',
                icon: <Pencil />,
                onClick: () => onEdit(user),
                permission: PERMISSION_IDS.UPDATE_USER,
                disabled: isAdmin || user.status === 'DISABLED' // <-- Vô hiệu hóa nếu người dùng trong bảng là ADMINISTRATOR
              },
              { type: 'divider' },
              {
                label: user.status === 'ACTIVE' ? 'Disable User' : 'Enable User',
                icon: <PersonX />,
                className: 'text-danger',
                onClick: () => onDisable(user),
                permission: PERMISSION_IDS.UPDATE_USER,
                disabled: isAdmin // <-- Vô hiệu hóa nếu người dùng trong bảng là ADMINISTRATOR
              }
            ]}
          />
        </PermissionWrapper>
      </td>
    </tr>
  );
};

export default UserRow;
