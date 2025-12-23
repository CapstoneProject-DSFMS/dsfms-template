import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner } from 'react-bootstrap';
import { Eye, Book, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoadingSkeleton, SortIcon } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import useTableSort from '../../hooks/useTableSort';
import traineeAPI from '../../api/trainee';
import '../../styles/scrollable-table.css';

const TraineeSubjectList = ({ traineeId, courseId }) => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const { sortedData, sortConfig, handleSort } = useTableSort(subjects);

  useEffect(() => {
    if (traineeId && courseId) {
      loadTraineeSubjects();
    }
  }, [traineeId, courseId]);

  const loadTraineeSubjects = async () => {
    try {
      setLoading(true);
      
      // Hardcoded subjects data
      const mockSubjects = [
        {
          id: '1',
          name: 'Basic Safety Protocols',
          code: 'BSP',
          description: 'Introduction to basic safety procedures and protocols',
          status: 'COMPLETED',
          progress: 100,
          startDate: '2024-01-15T09:00:00.000Z',
          endDate: '2024-01-30T17:00:00.000Z',
          instructor: 'Sarah Johnson',
          score: 95
        },
        {
          id: '2',
          name: 'Emergency Procedures',
          code: 'EP',
          description: 'Emergency response procedures and protocols',
          status: 'IN_PROGRESS',
          progress: 75,
          startDate: '2024-02-01T09:00:00.000Z',
          endDate: '2024-02-15T17:00:00.000Z',
          instructor: 'Mike Chen',
          score: null
        },
        {
          id: '3',
          name: 'Equipment Handling',
          code: 'EH',
          description: 'Proper handling and maintenance of safety equipment',
          status: 'PENDING',
          progress: 0,
          startDate: '2024-02-16T09:00:00.000Z',
          endDate: '2024-03-01T17:00:00.000Z',
          instructor: 'Lisa Wang',
          score: null
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setSubjects(mockSubjects);
    } catch (error) {
      console.error('Error loading trainee subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { variant: 'success', text: 'Active' },
      'COMPLETED': { variant: 'primary', text: 'Completed' },
      'PENDING': { variant: 'warning', text: 'Pending' },
      'IN_PROGRESS': { variant: 'info', text: 'In Progress' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getLevelBadge = (level) => {
    const levelConfig = {
      'BEGINNER': { variant: 'success', text: 'Beginner' },
      'INTERMEDIATE': { variant: 'warning', text: 'Intermediate' },
      'ADVANCED': { variant: 'danger', text: 'Advanced' }
    };
    
    const config = levelConfig[level] || { variant: 'secondary', text: level };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleViewSubject = (subjectId) => {
    navigate(`/trainee/${traineeId}/course/${courseId}/subject/${subjectId}`);
  };

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
            fontWeight: isActive ? '600' : '500',
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

  if (loading) {
    return <LoadingSkeleton rows={5} columns={8} />;
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No subjects found</h5>
          <p>Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scrollable-table-container admin-table">
      <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            <SortableHeader columnKey="code" className="show-mobile">
              Subject Code
            </SortableHeader>
            <SortableHeader columnKey="name" className="show-mobile">
              Subject Name
            </SortableHeader>
            <SortableHeader columnKey="level" className="show-mobile">
              Level
            </SortableHeader>
            <SortableHeader columnKey="duration" className="show-mobile">
              Duration
            </SortableHeader>
            <SortableHeader columnKey="method" className="show-mobile">
              Method
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <SortableHeader columnKey="progress" className="show-mobile">
              Progress
            </SortableHeader>
            <th 
              className="fw-semibold text-center show-mobile"
              style={{
                backgroundColor: 'var(--bs-primary)',
                color: 'white',
                borderColor: 'var(--bs-primary)'
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((subject, index) => (
            <tr 
              key={subject.id}
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
              <td className="align-middle show-mobile">
                <Badge 
                  bg="primary" 
                  className="px-2 py-1"
                  style={{ 
                    fontSize: '0.75rem'
                  }}
                >
                  {subject.code}
                </Badge>
              </td>
              <td className="align-middle show-mobile">
                <div className="fw-medium text-dark">
                  {subject.name}
                </div>
                <small className="text-muted">{subject.description}</small>
              </td>
              <td className="align-middle show-mobile">
                {getLevelBadge(subject.level)}
              </td>
              <td className="align-middle show-mobile">
                <span className="text-dark">
                  {subject.duration} day(s)
                </span>
              </td>
              <td className="align-middle show-mobile">
                <Badge bg="info" className="fw-normal">
                  {subject.method || 'Classroom'}
                </Badge>
              </td>
              <td className="align-middle show-mobile">
                {getStatusBadge(subject.status)}
              </td>
              <td className="align-middle show-mobile">
                <div className="d-flex align-items-center">
                  <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ width: `${subject.progress || 0}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">{subject.progress || 0}%</small>
                </div>
              </td>
              <td className="align-middle text-center show-mobile">
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
                      onClick: () => handleViewSubject(subject.id)
                    }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TraineeSubjectList;
