import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner, Tabs, Tab } from 'react-bootstrap';
import { ClipboardCheck, Clock, CheckCircle, ExclamationTriangle, Pen } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';

const TraineeAssessmentPendingList = ({ traineeId }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [signatureRequired, setSignatureRequired] = useState([]);
  const [sectionCompletion, setSectionCompletion] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (traineeId) {
      loadAssessmentData();
    }
  }, [traineeId]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);
      
      // Load assessments
      const assessmentsResponse = await traineeAPI.getTraineeAssessments(traineeId);
      setAssessments(assessmentsResponse.assessments || assessmentsResponse.data || []);
      
      // Mock data for signature required and section completion
      const mockSignatureRequired = [
        {
          id: '1',
          name: 'Safety Protocol Agreement',
          course: 'Emergency Procedures',
          subject: 'Safety Protocols',
          dueDate: '2024-02-15T17:00:00.000Z',
          status: 'PENDING'
        },
        {
          id: '2',
          name: 'Training Completion Certificate',
          course: 'Advanced Flight Training',
          subject: 'Flight Operations',
          dueDate: '2024-02-20T17:00:00.000Z',
          status: 'PENDING'
        }
      ];
      
      const mockSectionCompletion = [
        {
          id: '1',
          name: 'Emergency Evacuation Procedures',
          course: 'Emergency Procedures',
          subject: 'Safety Protocols',
          section: 'Practical Assessment',
          dueDate: '2024-02-12T14:00:00.000Z',
          status: 'IN_PROGRESS',
          progress: 60
        },
        {
          id: '2',
          name: 'Flight Navigation Systems',
          course: 'Advanced Flight Training',
          subject: 'Navigation',
          section: 'Written Test',
          dueDate: '2024-02-18T10:00:00.000Z',
          status: 'PENDING',
          progress: 0
        }
      ];
      
      setSignatureRequired(mockSignatureRequired);
      setSectionCompletion(mockSectionCompletion);
    } catch (error) {
      console.error('Error loading assessment data:', error);
      toast.error('Failed to load assessment data');
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

  const handleSignaturePad = (itemId) => {
    navigate(`/trainee/${traineeId}/signature-pad/${itemId}`);
  };

  const handleCompleteSection = (sectionId) => {
    navigate(`/trainee/${traineeId}/assessment-section/${sectionId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted small">Loading assessment data...</p>
      </div>
    );
  }

  return (
    <div className="trainee-assessment-pending-list">
      <Tabs defaultActiveKey="pending" className="border-bottom">
        <Tab eventKey="pending" title="Pending Assessments">
          <div className="p-3">
            {assessments.length === 0 ? (
              <div className="text-center py-4">
                <ClipboardCheck size={32} className="text-muted mb-2" />
                <p className="text-muted mb-0">No pending assessments</p>
              </div>
            ) : (
              <div className="trainee-assessments-table">
                <table className="table table-hover mb-0">
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
                </table>
              </div>
            )}
          </div>
        </Tab>

        <Tab eventKey="signature" title="Signature Required List">
          <div className="p-3">
            {signatureRequired.length === 0 ? (
              <div className="text-center py-4">
                <Pen size={32} className="text-muted mb-2" />
                <p className="text-muted mb-0">No signature requirements</p>
              </div>
            ) : (
              <div className="trainee-assessments-table">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-start">Document</th>
                      <th className="text-start">Course</th>
                      <th className="text-start">Subject</th>
                      <th className="text-start">Due Date</th>
                      <th className="text-start">Status</th>
                      <th className="text-start">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signatureRequired.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-semibold">{item.name}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{item.course}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{item.subject}</div>
                        </td>
                        <td>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSignaturePad(item.id)}
                          >
                            <Pen className="me-1" size={14} />
                            Sign
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Tab>

        <Tab eventKey="completion" title="Section Completion Required List">
          <div className="p-3">
            {sectionCompletion.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle size={32} className="text-muted mb-2" />
                <p className="text-muted mb-0">No sections requiring completion</p>
              </div>
            ) : (
              <div className="trainee-assessments-table">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-start">Section</th>
                      <th className="text-start">Course</th>
                      <th className="text-start">Subject</th>
                      <th className="text-start">Type</th>
                      <th className="text-start">Due Date</th>
                      <th className="text-start">Progress</th>
                      <th className="text-start">Status</th>
                      <th className="text-start">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionCompletion.map((section) => (
                      <tr key={section.id}>
                        <td>
                          <div className="fw-semibold">{section.name}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{section.course}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{section.subject}</div>
                        </td>
                        <td>
                          <Badge bg="info" className="fw-normal">
                            {section.section}
                          </Badge>
                        </td>
                        <td>
                          {new Date(section.dueDate).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar bg-primary" 
                                style={{ width: `${section.progress}%` }}
                              ></div>
                            </div>
                            <small className="text-muted">{section.progress}%</small>
                          </div>
                        </td>
                        <td>{getStatusBadge(section.status)}</td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCompleteSection(section.id)}
                          >
                            {section.status === 'COMPLETED' ? 'View' : 'Complete'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default TraineeAssessmentPendingList;
