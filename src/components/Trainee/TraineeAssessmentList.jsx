import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { ClipboardCheck, Clock, CheckCircle, ExclamationTriangle } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';

const TraineeAssessmentList = ({ traineeId }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (traineeId) {
      loadTraineeAssessments();
    }
  }, [traineeId]);

  const loadTraineeAssessments = async () => {
    try {
      setLoading(true);
      const response = await traineeAPI.getTraineeAssessments(traineeId);
      setAssessments(response.assessments || response.data || []);
    } catch (error) {
      console.error('Error loading trainee assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { variant: 'warning', text: 'Pending', icon: Clock },
      'IN_PROGRESS': { variant: 'info', text: 'In Progress', icon: ClipboardCheck },
      'COMPLETED': { variant: 'success', text: 'Completed', icon: CheckCircle },
      'OVERDUE': { variant: 'danger', text: 'Overdue', icon: ExclamationTriangle }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: ClipboardCheck };
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {config.text}
      </Badge>
    );
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

  const handleStartAssessment = (assessmentId) => {
    // TODO: Navigate to assessment or open assessment modal
    console.log('Start assessment:', assessmentId);
  };

  const handleViewAssessment = (assessmentId) => {
    // TODO: Navigate to assessment details
    console.log('View assessment:', assessmentId);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted small">Loading assessments...</p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-4">
        <ClipboardCheck size={32} className="text-muted mb-2" />
        <p className="text-muted mb-0">No pending assessments</p>
      </div>
    );
  }

  return (
    <div className="trainee-assessments-table">
      <Table responsive hover className="mb-0">
        <thead className="table-light">
          <tr>
            <th className="text-start">Assessment</th>
            <th className="text-start">Course</th>
            <th className="text-start">Subject</th>
            <th className="text-start">Type</th>
            <th className="text-start">Priority</th>
            <th className="text-start">Due Date</th>
            <th className="text-start">Status</th>
            <th className="text-start">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment) => (
            <tr key={assessment.id}>
              <td>
                <div className="fw-semibold">{assessment.name}</div>
                <small className="text-muted">{assessment.description}</small>
              </td>
              <td>
                <div className="fw-semibold">{assessment.course?.name || 'N/A'}</div>
                <small className="text-muted">{assessment.course?.code || ''}</small>
              </td>
              <td>
                <div className="fw-semibold">{assessment.subject?.name || 'N/A'}</div>
                <small className="text-muted">{assessment.subject?.code || ''}</small>
              </td>
              <td>
                <Badge bg="info" className="fw-normal">
                  {assessment.type || 'Assessment'}
                </Badge>
              </td>
              <td>{getPriorityBadge(assessment.priority)}</td>
              <td>
                {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'N/A'}
              </td>
              <td>{getStatusBadge(assessment.status)}</td>
              <td>
                <div className="d-flex gap-1">
                  {assessment.status === 'PENDING' || assessment.status === 'IN_PROGRESS' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartAssessment(assessment.id)}
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewAssessment(assessment.id)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TraineeAssessmentList;
