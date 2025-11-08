import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { Calendar, GeoAlt, FileText } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';

const CourseTable = ({
  courses,
  loading,
  actionsComponent: ActionsComponent,
  onView,
  onDisable,
  onRestore,
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
        className={`fw-semibold ${className}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#214760';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bs-primary)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{ 
            transition: 'all 0.3s ease',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'white'
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
              color="white"
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
              background: 'rgba(255, 255, 255, 0.5)',
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
            <SortableHeader columnKey="startDate" className="show-mobile">
              Start Date
            </SortableHeader>
            <SortableHeader columnKey="endDate" className="show-mobile">
              End Date
            </SortableHeader>
            <SortableHeader columnKey="venue" className="show-mobile">
              Venue
            </SortableHeader>
            <SortableHeader columnKey="note" className="show-mobile">
              Note
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <th 
              className="fw-semibold text-center show-mobile"
              style={{
                backgroundColor: 'var(--bs-primary)',
                color: 'white',
                borderColor: 'var(--bs-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
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
                <div className="d-flex align-items-center">
                  <Calendar size={14} className="me-1 text-muted" />
                  <span className="text-dark">
                    {course.startDate || 'N/A'}
                  </span>
                </div>
              </td>
              <td className="show-mobile">
                <div className="d-flex align-items-center">
                  <Calendar size={14} className="me-1 text-muted" />
                  <span className="text-dark">
                    {course.endDate || 'N/A'}
                  </span>
                </div>
              </td>
              <td className="show-mobile">
                <div className="d-flex align-items-center">
                  <GeoAlt size={14} className="me-1 text-muted" />
                  <span className="text-dark">
                    {course.venue || 'N/A'}
                  </span>
                </div>
              </td>
              <td className="show-mobile">
                <div className="d-flex align-items-center">
                  <FileText size={14} className="me-1 text-muted" />
                  <span className="text-dark" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {course.note || 'N/A'}
                  </span>
                </div>
              </td>
              <td className="show-mobile">
                <Badge 
                  bg={course.status === 'ACTIVE' ? 'success' : course.status === 'ARCHIVED' ? 'warning' : 'secondary'}
                  className="px-2 py-1"
                  style={{ 
                    fontSize: '0.75rem',
                    width: 'fit-content'
                  }}
                >
                  {course.status || 'N/A'}
                </Badge>
              </td>
              <td className="text-center show-mobile">
                <ActionsComponent 
                  course={course} 
                  onView={onView}
                  onDisable={onDisable}
                  onRestore={onRestore}
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
