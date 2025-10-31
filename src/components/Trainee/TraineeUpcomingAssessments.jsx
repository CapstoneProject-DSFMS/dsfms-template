import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { ClipboardCheck, Clock, Calendar } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';
import '../../styles/scrollable-table.css';

const TraineeUpcomingAssessments = ({ traineeId, courseId }) => {
  const navigate = useNavigate();
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

  const handleStartAssessment = async (assessmentId) => {
    try {
      // Load assessment to get first section
      // For now, navigate to detail page with auto-start flag
      // The detail page will handle auto-starting the first section
      navigate(`/trainee/${traineeId}/assessment/${assessmentId}?action=start`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Failed to start assessment');
    }
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
    <div className="scrollable-table-container admin-table">
      <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Assessment</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Subject</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Type</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Priority</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">Due Date</th>
            <th className="border-neutral-200 text-primary-custom fw-semibold text-center show-mobile">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment, index) => (
            <tr 
              key={assessment.id}
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
                  {assessment.name}
                </div>
              </td>
              <td className="border-neutral-200 align-middle show-mobile">
                <span className="text-dark">
                  {assessment.subject}
                </span>
              </td>
              <td className="border-neutral-200 align-middle show-mobile">
                {getTypeBadge(assessment.type)}
              </td>
              <td className="border-neutral-200 align-middle show-mobile">
                {getPriorityBadge(assessment.priority)}
              </td>
              <td className="border-neutral-200 align-middle show-mobile">
                <div className="d-flex align-items-center">
                  <Clock className="text-muted me-1" size={14} />
                  <span className="text-dark">
                    {new Date(assessment.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <small className="text-muted">
                  {new Date(assessment.dueDate).toLocaleTimeString()}
                </small>
              </td>
              <td className="border-neutral-200 align-middle text-center show-mobile">
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
