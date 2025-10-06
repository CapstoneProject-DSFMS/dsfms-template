import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { People } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';

const CourseTable = ({
  courses,
  loading,
  actionsComponent: ActionsComponent,
  onView,
  onEdit,
  onDelete,
}) => {
  const { sortedData, sortConfig, handleSort, getSortIcon, getSortClass } = useTableSort(courses);

  if (loading) {
    return <LoadingSkeleton rows={4} columns={6} />;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No courses found</h5>
          <p>This department doesn't have any courses yet.</p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
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
            fontWeight: isActive ? '700' : '600'
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
    <div className="department-table-container">
      <Table hover className="mb-0 table-mobile-responsive">
        <thead className="sticky-header bg-gradient-primary-custom">
          <tr>
            <SortableHeader columnKey="name" className="show-mobile">
              Course Name
            </SortableHeader>
            <SortableHeader columnKey="code" className="show-mobile">
              Code
            </SortableHeader>
            <SortableHeader columnKey="duration" className="show-mobile">
              Duration
            </SortableHeader>
            <SortableHeader columnKey="trainers" className="show-mobile">
              Trainers
            </SortableHeader>
            <th className="border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 text-center show-mobile">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((course, index) => (
            <tr key={course.id}>
              <td className="show-mobile">
                <div 
                  className="fw-semibold text-primary cursor-pointer"
                  onClick={() => onView(course.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {course.name}
                </div>
              </td>
              <td className="show-mobile">
                <Badge 
                  bg="secondary" 
                  className="px-2 py-1"
                  style={{ 
                    fontSize: '0.75rem',
                    width: 'fit-content'
                  }}
                >
                  {course.code}
                </Badge>
              </td>
              <td className="show-mobile">
                <span className="text-dark">
                  {course.duration || 'N/A'}
                </span>
              </td>
              <td className="show-mobile">
                <div className="d-flex align-items-center">
                  <People size={14} className="me-1 text-muted" />
                  <span className="text-dark">
                    {course.trainers || 0}
                  </span>
                </div>
              </td>
              <td className="text-center show-mobile">
                <ActionsComponent 
                  course={course} 
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CourseTable;
