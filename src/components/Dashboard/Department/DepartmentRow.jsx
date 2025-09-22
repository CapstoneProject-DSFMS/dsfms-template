import React from 'react';
import { Badge } from 'react-bootstrap';
import { ActionDropdown } from '../../Common';

const DepartmentRow = ({ department, index, onView, onEdit, onDelete, onToggleStatus }) => {
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
          {department.departmentHead?.name || 'Not assigned'}
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
        <ActionDropdown
          item={department}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          viewLabel="View Details"
          editLabel="Edit Department"
          toggleLabel={department.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          statusField="status"
          activeValue="ACTIVE"
          inactiveValue="INACTIVE"
        />
      </td>
    </tr>
  );
};

export default DepartmentRow;
