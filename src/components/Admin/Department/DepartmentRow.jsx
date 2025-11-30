import React from 'react';
import { Badge } from 'react-bootstrap';
import PortalUnifiedDropdown from '../../Common/PortalUnifiedDropdown';
import PermissionWrapper from '../../Common/PermissionWrapper';
import { Eye, PersonX, ThreeDotsVertical } from 'react-bootstrap-icons';
import { PERMISSION_IDS } from '../../../constants/permissionIds';

const DepartmentRow = ({ department, index, onView, onToggleStatus }) => {
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
        <div className="fw-medium text-dark">
          {department.name}
        </div>
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
          {department.code}
        </Badge>
      </td>
      
      <td className="border-neutral-200 align-middle hide-mobile">
        <span className="text-dark">
          {department.departmentHead ? (
            (() => {
              const { lastName, middleName, firstName } = department.departmentHead;
              const fullName = [lastName, middleName, firstName]
                .filter(Boolean)
                .join(' ');
              return fullName || department.departmentHead.name || 'Not assigned';
            })()
          ) : (
            'Not assigned'
          )}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle hide-mobile">
        <span className="text-dark">
          {department.coursesCount}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle hide-mobile">
        <span className="text-dark">
          {department.traineesCount}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle hide-mobile">
        <span className="text-dark">
          {department.trainersCount}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <Badge 
          bg={getStatusVariant(department.status)}
          className="px-2 py-1 d-flex align-items-center"
          style={{ 
            fontSize: '0.75rem',
            width: 'fit-content'
          }}
        >
          <span className="me-1" style={{ fontSize: '0.8rem' }}>
            {getStatusIcon(department.status)}
          </span>
          {department.status}
        </Badge>
      </td>
      
      <td className="border-neutral-200 align-middle text-center show-mobile">
        <PermissionWrapper 
          permissions={[PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL, PERMISSION_IDS.UPDATE_DEPARTMENT]}
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
              // Only show View Details for ACTIVE departments
              ...(department.status === 'ACTIVE' ? [{
                label: 'View Details',
                icon: <Eye />,
                onClick: () => onView(department),
                permission: PERMISSION_IDS.VIEW_DEPARTMENT_IN_DETAIL
              }] : []),
              // Only show divider if View Details is shown
              ...(department.status === 'ACTIVE' ? [{ type: 'divider' }] : []),
              {
                label: department.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
                icon: <PersonX />,
                className: department.status === 'ACTIVE' ? 'text-danger' : 'text-success',
                onClick: () => onToggleStatus(department),
                permission: PERMISSION_IDS.UPDATE_DEPARTMENT
              }
            ]}
          />
        </PermissionWrapper>
      </td>
    </tr>
  );
};

export default DepartmentRow;
