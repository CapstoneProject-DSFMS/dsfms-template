import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Eye, Book } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';
import '../../styles/scrollable-table.css';

const TraineeSubjectList = ({ traineeId, courseId }) => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted small">Loading subjects...</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-4">
        <Book size={32} className="text-muted mb-2" />
        <p className="text-muted mb-0">No subjects found</p>
      </div>
    );
  }

  return (
    <div className="scrollable-table-container admin-table">
      <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Subject Code</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Subject Name</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Level</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Duration</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Method</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Status</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Progress</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold text-center show-mobile">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject, index) => (
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
              <td className="border-neutral-200 align-middle show-mobile">
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
              <td className="border-neutral-200 align-middle show-mobile">
                <div className="fw-medium text-dark">
                  {subject.name}
                </div>
                <small className="text-muted">{subject.description}</small>
              </td>
              <td className="border-neutral-200 align-middle show-mobile">
                {getLevelBadge(subject.level)}
              </td>
              <td className="border-neutral-200 align-middle show-mobile">
                <span className="text-dark">
                  {subject.duration} hours
                </span>
              </td>
              <td className="border-neutral-200 align-middle show-mobile">
                <Badge bg="info" className="fw-normal">
                  {subject.method || 'Classroom'}
                </Badge>
              </td>
              <td className="border-neutral-200 align-middle show-mobile">
                {getStatusBadge(subject.status)}
              </td>
              <td className="border-neutral-200 align-middle show-mobile">
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
              <td className="border-neutral-200 align-middle text-center show-mobile">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleViewSubject(subject.id)}
                >
                  <Eye size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TraineeSubjectList;
