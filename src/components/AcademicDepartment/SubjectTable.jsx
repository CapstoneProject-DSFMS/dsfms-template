import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { People } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import SubjectActions from './SubjectActions';

const mockSubjects = [
  { 
    id: 's1', 
    name: 'Safety Basics', 
    code: 'SB01', 
    method: 'Classroom',
    duration: '2 weeks',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    roomName: 'Training Center A - Room 101',
    trainees: 24, 
    status: 'ACTIVE' 
  },
  { 
    id: 's2', 
    name: 'Evacuation Drills', 
    code: 'ED02', 
    method: 'Practical',
    duration: '1 week',
    startDate: '2024-02-01',
    endDate: '2024-02-07',
    roomName: 'Simulator Complex - Room 201',
    trainees: 18, 
    status: 'ACTIVE' 
  },
  { 
    id: 's3', 
    name: 'CPR & First Aid', 
    code: 'FA03', 
    method: 'Mixed',
    duration: '3 days',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    roomName: 'Medical Center - Room 301',
    trainees: 12, 
    status: 'INACTIVE' 
  },
  { 
    id: 's4', 
    name: 'Fire Safety', 
    code: 'FS04', 
    method: 'Classroom',
    duration: '1 week',
    startDate: '2024-02-15',
    endDate: '2024-02-21',
    roomName: 'Training Center B - Room 102',
    trainees: 15, 
    status: 'ACTIVE' 
  },
  { 
    id: 's5', 
    name: 'Emergency Procedures', 
    code: 'EP05', 
    method: 'Practical',
    duration: '2 weeks',
    startDate: '2024-03-01',
    endDate: '2024-03-14',
    roomName: 'Emergency Training Facility',
    trainees: 20, 
    status: 'ACTIVE' 
  },
];

const SubjectTable = ({ loading = false, onView, onEdit, onDelete }) => {
  const subjects = mockSubjects; // mock data (no API)
  const { sortedData, sortConfig, handleSort } = useTableSort(subjects);

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
        className={`border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 text-start ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          minWidth: '80px',
          maxWidth: '150px'
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
        <div className="d-flex align-items-center justify-content-between position-relative w-100">
          <span style={{
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '700' : '600',
            flex: '1',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {children}
          </span>
          <div
            className="d-flex align-items-center"
            style={{
              minWidth: '20px',
              justifyContent: 'center',
              flexShrink: 0
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
    <div className="department-table-container" style={{ overflowX: 'hidden' }}>
      <Table hover className="mb-0 table-mobile-responsive" style={{ tableLayout: 'fixed', width: '100%' }}>
        <thead className="sticky-header bg-gradient-primary-custom">
          <tr>
            <SortableHeader columnKey="name" className="show-mobile">
              Name
            </SortableHeader>
            <SortableHeader columnKey="code" className="show-mobile">
              Code
            </SortableHeader>
            <SortableHeader columnKey="method" className="show-mobile">
              Method
            </SortableHeader>
            <SortableHeader columnKey="duration" className="show-mobile">
              Duration
            </SortableHeader>
            <SortableHeader columnKey="startDate" className="show-mobile">
              Start Date
            </SortableHeader>
            <SortableHeader columnKey="endDate" className="show-mobile">
              End Date
            </SortableHeader>
            <SortableHeader columnKey="roomName" className="show-mobile">
              Room Name
            </SortableHeader>
            <SortableHeader columnKey="trainees" className="show-mobile">
              Trainees
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <th className="border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 text-start show-mobile" style={{ minWidth: '80px', maxWidth: '150px' }}>
              <div className="d-flex align-items-center justify-content-between position-relative w-100">
                <span style={{
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  flex: '1',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  Actions
                </span>
                <div
                  className="d-flex align-items-center"
                  style={{
                    minWidth: '20px',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {/* Empty space to match other columns */}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((subject) => (
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
                <Badge 
                  bg="info" 
                  className="px-2 py-1"
                  style={{ 
                    fontSize: '0.75rem',
                    width: 'fit-content'
                  }}
                >
                  {subject.method}
                </Badge>
              </td>
              <td className="show-mobile">
                <span className="text-dark">
                  {subject.duration}
                </span>
              </td>
              <td className="show-mobile">
                <span className="text-dark">
                  {subject.startDate}
                </span>
              </td>
              <td className="show-mobile">
                <span className="text-dark">
                  {subject.endDate}
                </span>
              </td>
              <td className="show-mobile">
                <span className="text-dark">
                  {subject.roomName}
                </span>
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


