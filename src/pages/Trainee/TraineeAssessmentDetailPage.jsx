import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { 
  ArrowLeft, 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  ExclamationTriangle, 
  Pen,
  Book,
  Calendar,
  Person,
  FileText
} from 'react-bootstrap-icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';

const TraineeAssessmentDetailPage = () => {
  const { traineeId, assessmentId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assessmentId) {
      loadAssessmentDetails();
    }
  }, [assessmentId]);

  // Auto-start assessment if action=start in URL
  useEffect(() => {
    if (assessment && searchParams.get('action') === 'start') {
      // Remove query param
      setSearchParams({});
      // Auto-start first incomplete section
      const incompleteSection = assessment.sections?.find(s => s.status !== 'COMPLETED');
      if (incompleteSection) {
        navigate(`/trainee/${traineeId}/assessment-section/${incompleteSection.id}`);
      }
    }
  }, [assessment, searchParams, navigate, traineeId, setSearchParams]);

  const loadAssessmentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data for assessment detail
      const mockAssessment = {
        id: assessmentId,
        name: 'Emergency Procedures Assessment',
        description: 'Comprehensive assessment covering emergency evacuation procedures, safety protocols, and equipment handling.',
        course: {
          id: 'course-1',
          name: 'Emergency Procedures Training',
          code: 'EPT2024'
        },
        subject: {
          id: 'subject-1',
          name: 'Safety Protocols',
          code: 'SP101'
        },
        type: 'PRACTICAL',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2024-02-15T17:00:00.000Z',
        startDate: '2024-02-10T08:00:00.000Z',
        timeLimit: 120,
        progress: 60,
        score: null,
        maxScore: 100,
        completedDate: null,
        sections: [
          {
            id: 'section-1',
            name: 'Emergency Evacuation Procedures',
            status: 'COMPLETED',
            progress: 100
          },
          {
            id: 'section-2',
            name: 'Safety Protocol Review',
            status: 'IN_PROGRESS',
            progress: 60
          },
          {
            id: 'section-3',
            name: 'Equipment Handling',
            status: 'PENDING',
            progress: 0
          }
        ],
        requiresSignature: true,
        signatureStatus: 'PENDING',
        instructions: [
          'Read each question carefully before answering',
          'You have 120 minutes to complete this assessment',
          'Save your progress regularly',
          'Ensure all required sections are completed',
          'Signature will be required upon completion'
        ]
      };
      
      setAssessment(mockAssessment);
    } catch (error) {
      console.error('Error loading assessment details:', error);
      setError('Failed to load assessment details');
      toast.error('Failed to load assessment details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleStartAssessment = () => {
    // Navigate to first incomplete section or assessment interface
    const incompleteSection = assessment.sections.find(s => s.status !== 'COMPLETED');
    if (incompleteSection) {
      navigate(`/trainee/${traineeId}/assessment-section/${incompleteSection.id}`);
    } else {
      toast.info('Starting assessment...');
    }
  };

  const handleContinueAssessment = () => {
    const inProgressSection = assessment.sections.find(s => s.status === 'IN_PROGRESS');
    if (inProgressSection) {
      navigate(`/trainee/${traineeId}/assessment-section/${inProgressSection.id}`);
    } else {
      handleStartAssessment();
    }
  };

  const handleViewSection = (sectionId) => {
    navigate(`/trainee/${traineeId}/assessment-section/${sectionId}`);
  };

  const handleSignaturePad = () => {
    navigate(`/trainee/${traineeId}/signature-pad/${assessmentId}`);
  };

  const handleCreateIssue = () => {
    navigate('/trainee/create-incident-feedback-report', {
      state: { assessmentId, assessmentName: assessment.name }
    });
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

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading assessment details...</p>
        </div>
      </Container>
    );
  }

  if (error || !assessment) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Assessment not found'}</p>
          <Button variant="outline-danger" onClick={handleBack}>
            <ArrowLeft className="me-2" size={16} />
            Back
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                onClick={handleBack}
                className="me-3"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <h2 className="mb-1 d-flex align-items-center">
                  <ClipboardCheck className="me-2" size={28} />
                  {assessment.name}
                </h2>
                <p className="text-muted mb-0">
                  {assessment.course?.name || 'Course'} • {assessment.subject?.name || 'Subject'}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {getStatusBadge(assessment.status)}
              {getPriorityBadge(assessment.priority)}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Assessment Details */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-0">
              <Tabs defaultActiveKey={assessment.status === 'COMPLETED' ? 'results' : 'overview'} className="border-bottom">
                <Tab eventKey="overview" title="Overview">
                  <div className="p-4">
                    <div className="mb-4">
                      <h5>Description</h5>
                      <p className="text-muted">{assessment.description}</p>
                    </div>

                    <div className="mb-4">
                      <h5>Instructions</h5>
                      <ul className="list-unstyled">
                        {assessment.instructions.map((instruction, index) => (
                          <li key={index} className="mb-2">
                            <span className="text-primary me-2">•</span>
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h5>Assessment Sections</h5>
                      <div className="row">
                        {assessment.sections.map((section, index) => (
                          <div key={section.id} className="col-md-6 mb-3">
                            <Card className={`${section.status === 'COMPLETED' ? 'bg-light' : ''}`}>
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="fw-semibold">Section {index + 1}</span>
                                  {getStatusBadge(section.status)}
                                </div>
                                <h6 className="mb-2">{section.name}</h6>
                                <div className="progress mb-2" style={{ height: '6px' }}>
                                  <div 
                                    className="progress-bar bg-primary" 
                                    style={{ width: `${section.progress}%` }}
                                  ></div>
                                </div>
                                <Button
                                  variant={section.status === 'COMPLETED' ? 'outline-success' : 'primary'}
                                  size="sm"
                                  onClick={() => handleViewSection(section.id)}
                                >
                                  {section.status === 'COMPLETED' ? 'View' : section.status === 'IN_PROGRESS' ? 'Continue' : 'Start'}
                                </Button>
                              </Card.Body>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      {assessment.status === 'PENDING' ? (
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleStartAssessment}
                        >
                          <ClipboardCheck className="me-2" size={20} />
                          Start Assessment
                        </Button>
                      ) : assessment.status === 'IN_PROGRESS' ? (
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleContinueAssessment}
                        >
                          <ClipboardCheck className="me-2" size={20} />
                          Continue Assessment
                        </Button>
                      ) : null}
                      
                      {assessment.requiresSignature && assessment.signatureStatus === 'PENDING' && (
                        <Button
                          variant="outline-primary"
                          size="lg"
                          onClick={handleSignaturePad}
                        >
                          <Pen className="me-2" size={20} />
                          Sign Document
                        </Button>
                      )}
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="progress" title="Progress">
                  <div className="p-4">
                    <div className="mb-4">
                      <h5>Overall Progress</h5>
                      <div className="progress mb-2" style={{ height: '20px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ width: `${assessment.progress}%` }}
                        >
                          {assessment.progress}%
                        </div>
                      </div>
                      <small className="text-muted">
                        {assessment.sections.filter(s => s.status === 'COMPLETED').length} of {assessment.sections.length} sections completed
                      </small>
                    </div>

                    <h5>Section Progress</h5>
                    {assessment.sections.map((section, index) => (
                      <div key={section.id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold">Section {index + 1}: {section.name}</span>
                          <span className="text-muted">{section.progress}%</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${section.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Tab>

                {assessment.status === 'COMPLETED' && (
                  <Tab eventKey="results" title="Results">
                    <div className="p-4">
                      <div className="mb-4">
                        <h5>Assessment Score</h5>
                        {assessment.score !== null ? (
                          <div className="d-flex align-items-center mb-3">
                            <div className="display-4 fw-bold text-primary me-3">
                              {assessment.score} / {assessment.maxScore}
                            </div>
                            <div>
                              <Badge bg={assessment.score >= assessment.maxScore * 0.8 ? 'success' : assessment.score >= assessment.maxScore * 0.6 ? 'warning' : 'danger'} className="fs-6">
                                {Math.round((assessment.score / assessment.maxScore) * 100)}%
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted">Score pending review</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <h5>Section Results</h5>
                        {assessment.sections?.map((section, index) => (
                          <Card key={section.id} className="mb-2">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <span className="fw-semibold">Section {index + 1}: {section.name}</span>
                                  <Badge bg="success" className="ms-2">Completed</Badge>
                                </div>
                                {section.score !== undefined && (
                                  <div className="text-end">
                                    <div className="fw-bold">{section.score} / {section.maxScore || 100}</div>
                                    <small className="text-muted">{Math.round((section.score / (section.maxScore || 100)) * 100)}%</small>
                                  </div>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </Tab>
                )}
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        {/* Assessment Information */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <FileText className="me-2" size={20} />
                Assessment Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3 mb-4">
                <div className="d-flex align-items-center">
                  <Book className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Course</div>
                    <div className="text-muted">{assessment.course?.name || 'N/A'}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Book className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Subject</div>
                    <div className="text-muted">{assessment.subject?.name || 'N/A'}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Calendar className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Due Date</div>
                    <div className="text-muted">
                      {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Clock className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Time Limit</div>
                    <div className="text-muted">{assessment.timeLimit} minutes</div>
                  </div>
                </div>

                      {assessment.score !== null && (
                        <>
                          <div className="d-flex align-items-center">
                            <CheckCircle className="text-muted me-3" size={18} />
                            <div>
                              <div className="fw-semibold">Score</div>
                              <div className="text-muted">{assessment.score} / {assessment.maxScore}</div>
                            </div>
                          </div>
                          {assessment.completedDate && (
                            <div className="d-flex align-items-center">
                              <Calendar className="text-muted me-3" size={18} />
                              <div>
                                <div className="fw-semibold">Completed Date</div>
                                <div className="text-muted">
                                  {new Date(assessment.completedDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
              </div>

              {assessment.requiresSignature && (
                <div className="mb-4 p-3 bg-light rounded">
                  <h6 className="mb-2">Signature Required</h6>
                  <p className="small text-muted mb-2">
                    This assessment requires a digital signature upon completion.
                  </p>
                  {assessment.signatureStatus === 'PENDING' && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleSignaturePad}
                    >
                      <Pen className="me-2" size={14} />
                      Sign Now
                    </Button>
                  )}
                  {assessment.signatureStatus === 'COMPLETED' && (
                    <Badge bg="success">Signed</Badge>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={handleCreateIssue}
                >
                  <ExclamationTriangle className="me-2" size={16} />
                  Report Issue / Feedback
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeAssessmentDetailPage;

