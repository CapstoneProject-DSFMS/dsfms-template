import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { ClipboardCheck, Clock, Calendar } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';

const TraineeUpcomingAssessments = ({ traineeId, courseId }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (traineeId) {
      loadUpcomingAssessments();
    }
  }, [traineeId, courseId]);

  const loadUpcomingAssessments = async () => {
    try {
      setLoading(true);
      
      // Mock data for upcoming assessments
      const mockAssessments = [
        {
          id: '1',
          name: 'Emergency Procedures Test',
          type: 'Written',
          subject: 'Emergency Procedures',
          dueDate: '2024-02-15T10:00:00.000Z',
          status: 'UPCOMING',
          priority: 'HIGH'
        },
        {
          id: '2',
          name: 'Flight Simulation Practical',
          type: 'Practical',
          subject: 'Flight Operations',
          dueDate: '2024-02-18T14:00:00.000Z',
          status: 'UPCOMING',
          priority: 'MEDIUM'
        },
        {
          id: '3',
          name: 'Safety Protocol Review',
          type: 'Oral',
          subject: 'Safety Protocols',
          dueDate: '2024-02-20T09:00:00.000Z',
          status: 'UPCOMING',
          priority: 'LOW'
        }
      ];
      
      setAssessments(mockAssessments);
    } catch (error) {
      console.error('Error loading upcoming assessments:', error);
      toast.error('Failed to load upcoming assessments');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'HIGH': { variant: 'danger', text: 'High' },
      'MEDIUM': { variant: 'warning', text: 'Medium' },
      'LOW': { variant: 'info', text: 'Low' }
    };
    
    const config = priorityConfig[priority] || { variant: 'secondary', text: priority };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'WRITTEN': { variant: 'primary', text: 'Written' },
      'PRACTICAL': { variant: 'success', text: 'Practical' },
      'ORAL': { variant: 'info', text: 'Oral' },
      'ONLINE': { variant: 'secondary', text: 'Online' }
    };
    
    const config = typeConfig[type?.toUpperCase()] || { variant: 'secondary', text: type };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleStartAssessment = (assessmentId) => {
    // TODO: Navigate to assessment or open assessment modal
    console.log('Start assessment:', assessmentId);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted small">Loading upcoming assessments...</p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-4">
        <Calendar size={32} className="text-muted mb-2" />
        <p className="text-muted mb-0">No upcoming assessments</p>
      </div>
    );
  }

  return (
    <div className="trainee-upcoming-assessments">
      <Table responsive hover className="mb-0">
        <thead className="table-light">
          <tr>
            <th className="text-start">Assessment</th>
            <th className="text-start">Subject</th>
            <th className="text-start">Type</th>
            <th className="text-start">Priority</th>
            <th className="text-start">Due Date</th>
            <th className="text-start">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment) => (
            <tr key={assessment.id}>
              <td>
                <div className="fw-semibold">{assessment.name}</div>
              </td>
              <td>
                <div className="fw-semibold">{assessment.subject}</div>
              </td>
              <td>{getTypeBadge(assessment.type)}</td>
              <td>{getPriorityBadge(assessment.priority)}</td>
              <td>
                <div className="d-flex align-items-center">
                  <Clock className="text-muted me-1" size={14} />
                  {new Date(assessment.dueDate).toLocaleDateString()}
                </div>
                <small className="text-muted">
                  {new Date(assessment.dueDate).toLocaleTimeString()}
                </small>
              </td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartAssessment(assessment.id)}
                >
                  <ClipboardCheck className="me-1" size={14} />
                  Start
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TraineeUpcomingAssessments;
