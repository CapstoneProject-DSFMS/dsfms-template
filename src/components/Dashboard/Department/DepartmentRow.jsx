import React from 'react';
import { Badge } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';
import { Eye, Pencil, PersonX, ThreeDotsVertical } from 'react-bootstrap-icons';

const DepartmentRow = ({ department, index, onView, onEdit, onToggleStatus }) => {
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
        <Dropdown align="end">
          <Dropdown.Toggle 
            variant="light" 
            size="sm" 
            id={`department-actions-${department.id}`} 
            className="border-0"
          >
            <ThreeDotsVertical size={16} />
          </Dropdown.Toggle>
          <Dropdown.Menu className="shadow-sm">
            <Dropdown.Item 
              onClick={() => onView(department)}
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
              onClick={() => onEdit(department)}
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
              Edit Department
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item 
              onClick={() => onToggleStatus(department)}
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
              {department.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </td>
    </tr>
  );
};

export default DepartmentRow;
