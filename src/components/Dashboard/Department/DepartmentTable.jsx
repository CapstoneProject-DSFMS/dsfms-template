import React from 'react';
import { Table } from 'react-bootstrap';
import DepartmentRow from './DepartmentRow';
import { LoadingSkeleton, SortIcon } from '../../Common';
import useTableSort from '../../../hooks/useTableSort';
import '../../../styles/scrollable-table.css';

const DepartmentTable = ({
  departments,
  loading,
  onView,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(departments);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={6} />;
  }

  if (departments.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No departments found</h5>
          <p>Try adjusting your search criteria or add a new department.</p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`border-neutral-200 text-primary-custom fw-semibold ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.08)';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{ 
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '600' : '500'
          }}>
            {children}
          </span>
          <div 
            className="ms-2 d-flex align-items-center"
            style={{ 
              minWidth: '20px',
              justifyContent: 'center'
            }}
          >
            <SortIcon 
              direction={direction} 
              size={14}
            />
          </div>
        </div>
        {isActive && (
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, var(--bs-primary), var(--bs-info))',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </th>
    );
  };

  return (
    <div className="scrollable-table-container">
      <Table hover className="mb-0 table-mobile-responsive table-padded" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            <SortableHeader columnKey="name" className="show-mobile">
              Department Name
            </SortableHeader>
            <SortableHeader columnKey="code" className="show-mobile">
              Code
            </SortableHeader>
            <SortableHeader columnKey="departmentHead.name" className="hide-mobile">
              Department Head
            </SortableHeader>
            <SortableHeader columnKey="coursesCount" className="hide-mobile">
              Courses
            </SortableHeader>
            <SortableHeader columnKey="traineesCount" className="hide-mobile">
              Trainees
            </SortableHeader>
            <SortableHeader columnKey="trainersCount" className="hide-mobile">
              Trainers
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <th className="border-neutral-200 text-primary-custom fw-semibold text-center show-mobile">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((department, index) => (
            <DepartmentRow
              key={department.id}
              department={department}
              index={index}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DepartmentTable;
