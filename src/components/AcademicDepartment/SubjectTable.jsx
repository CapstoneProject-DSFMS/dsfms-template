import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { People } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import SubjectActions from './SubjectActions';

const mockSubjects = [
  { id: 's1', name: 'Safety Basics', code: 'SB01', trainees: 24, status: 'ACTIVE' },
  { id: 's2', name: 'Evacuation Drills', code: 'ED02', trainees: 18, status: 'ACTIVE' },
  { id: 's3', name: 'CPR & First Aid', code: 'FA03', trainees: 12, status: 'INACTIVE' },
  { id: 's4', name: 'Fire Safety', code: 'FS04', trainees: 15, status: 'ACTIVE' },
  { id: 's5', name: 'Emergency Procedures', code: 'EP05', trainees: 20, status: 'ACTIVE' },
];

const SubjectTable = ({ course, loading = false, onView, onEdit, onDelete }) => {
  const subjects = mockSubjects; // mock data (no API)
  const { sortedData, sortConfig, handleSort, getSortIcon, getSortClass } = useTableSort(subjects);

  if (loading) {
    return <LoadingSkeleton rows={4} columns={5} />;
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No subjects found</h5>
          <p>This course doesn't have any subjects yet.</p>
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
              Subject Name
            </SortableHeader>
            <SortableHeader columnKey="code" className="show-mobile">
              Code
            </SortableHeader>
            <SortableHeader columnKey="trainees" className="show-mobile">
              Trainees
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <th className="border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 text-center show-mobile">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((subject, index) => (
            <tr key={subject.id}>
              <td className="show-mobile">
                <div 
                  className="fw-semibold text-primary-custom cursor-pointer"
                  onClick={() => onView && onView(subject.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {subject.name}
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
                  {subject.code}
                </Badge>
              </td>
              <td className="show-mobile">
                <div className="d-flex align-items-center">
                  <People size={14} className="me-1 text-muted" />
                  <span className="text-dark">
                    {subject.trainees || 0}
                  </span>
                </div>
              </td>
              <td className="show-mobile">
                <Badge 
                  bg={subject.status === 'ACTIVE' ? 'success' : 'secondary'}
                  className="px-2 py-1"
                  style={{ 
                    fontSize: '0.75rem',
                    width: 'fit-content'
                  }}
                >
                  <span className="me-1" style={{ fontSize: '0.8rem' }}>
                    {subject.status === 'ACTIVE' ? '●' : '○'}
                  </span>
                  {subject.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="text-center show-mobile">
                <SubjectActions
                  subject={subject}
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

export default SubjectTable;


