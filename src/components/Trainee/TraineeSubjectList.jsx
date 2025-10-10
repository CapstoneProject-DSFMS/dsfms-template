import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Eye, Book } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';

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
    <div className="trainee-subjects-table">
      <Table responsive hover className="mb-0">
        <thead className="table-light">
          <tr>
            <th className="text-start">Subject Code</th>
            <th className="text-start">Subject Name</th>
            <th className="text-start">Level</th>
            <th className="text-start">Duration</th>
            <th className="text-start">Method</th>
            <th className="text-start">Status</th>
            <th className="text-start">Progress</th>
            <th className="text-start">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.id}>
              <td>
                <Badge bg="primary" className="fw-normal">
                  {subject.code}
                </Badge>
              </td>
              <td>
                <div className="fw-semibold">{subject.name}</div>
                <small className="text-muted">{subject.description}</small>
              </td>
              <td>{getLevelBadge(subject.level)}</td>
              <td>
                <div className="fw-semibold">{subject.duration} hours</div>
              </td>
              <td>
                <Badge bg="info" className="fw-normal">
                  {subject.method || 'Classroom'}
                </Badge>
              </td>
              <td>{getStatusBadge(subject.status)}</td>
              <td>
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
              <td>
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
