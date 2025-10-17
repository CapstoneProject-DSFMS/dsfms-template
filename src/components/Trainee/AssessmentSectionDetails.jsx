import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { ArrowLeft, ClipboardCheck, Clock, CheckCircle, ExclamationTriangle, Play } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AssessmentSectionDetails = ({ traineeId, sectionId }) => {
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sectionId) {
      loadSectionDetails();
    }
  }, [sectionId]);

  const loadSectionDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data for assessment section
      const mockSection = {
        id: sectionId,
        name: 'Emergency Evacuation Procedures',
        description: 'Complete the emergency evacuation procedures assessment including both theoretical knowledge and practical demonstration.',
        course: 'Emergency Procedures',
        subject: 'Safety Protocols',
        type: 'Practical Assessment',
        status: 'IN_PROGRESS',
        progress: 60,
        dueDate: '2024-02-12T14:00:00.000Z',
        timeLimit: 120, // minutes
        questions: [
          {
            id: '1',
            type: 'multiple_choice',
            question: 'What is the first step in an emergency evacuation?',
            options: [
              'Sound the alarm',
              'Assess the situation',
              'Call emergency services',
              'Evacuate immediately'
            ],
            correctAnswer: 1,
            userAnswer: 1,
            isAnswered: true
          },
          {
            id: '2',
            type: 'multiple_choice',
            question: 'How many emergency exits should be available in a training facility?',
            options: [
              'At least 1',
              'At least 2',
              'At least 3',
              'At least 4'
            ],
            correctAnswer: 1,
            userAnswer: null,
            isAnswered: false
          },
          {
            id: '3',
            type: 'practical',
            question: 'Demonstrate the proper use of emergency equipment',
            description: 'Show how to properly use fire extinguisher and emergency lighting',
            isCompleted: false,
            score: null
          }
        ],
        instructions: [
          'Read each question carefully before answering',
          'For practical assessments, ensure you have the required equipment',
          'You have 120 minutes to complete this assessment',
          'Save your progress regularly',
          'Contact your instructor if you encounter any technical issues'
        ]
      };
      
      setSection(mockSection);
    } catch (error) {
      console.error('Error loading section details:', error);
      setError('Failed to load assessment section details');
      toast.error('Failed to load assessment section details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/trainee/your-assessments');
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

  const handleStartAssessment = () => {
    // TODO: Navigate to assessment interface
    console.log('Start assessment section:', sectionId);
  };

  const handleContinueAssessment = () => {
    // TODO: Navigate to assessment interface with current progress
    console.log('Continue assessment section:', sectionId);
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading assessment section...</p>
        </div>
      </Container>
    );
  }

  if (error || !section) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Assessment section not found'}</p>
          <Button variant="outline-danger" onClick={handleBack}>
            <ArrowLeft className="me-2" size={16} />
            Back to Assessments
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
                  {section.name}
                </h2>
                <p className="text-muted mb-0">
                  {section.course} • {section.subject}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {getStatusBadge(section.status)}
              <Badge bg="info" className="fw-normal">
                {section.type}
              </Badge>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Assessment Details */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <ClipboardCheck className="me-2" size={20} />
                Assessment Section Details
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h6>Description</h6>
                <p className="text-muted">{section.description}</p>
              </div>

              <div className="mb-4">
                <h6>Instructions</h6>
                <ul className="list-unstyled">
                  {section.instructions.map((instruction, index) => (
                    <li key={index} className="mb-2">
                      <span className="text-primary me-2">•</span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h6>Questions Overview</h6>
                <div className="row">
                  {section.questions.map((question, index) => (
                    <div key={question.id} className="col-md-6 mb-3">
                      <div className={`p-3 border rounded ${question.isAnswered || question.isCompleted ? 'bg-light' : ''}`}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold">Question {index + 1}</span>
                          {question.isAnswered || question.isCompleted ? (
                            <Badge bg="success" className="small">Completed</Badge>
                          ) : (
                            <Badge bg="warning" className="small">Pending</Badge>
                          )}
                        </div>
                        <p className="mb-0 small text-muted">
                          {question.type === 'practical' ? 'Practical Assessment' : 'Multiple Choice'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-center">
                {section.status === 'PENDING' ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartAssessment}
                  >
                    <Play className="me-2" size={20} />
                    Start Assessment
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleContinueAssessment}
                  >
                    <ClipboardCheck className="me-2" size={20} />
                    Continue Assessment
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Assessment Information */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <Clock className="me-2" size={20} />
                Assessment Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <div className="d-flex align-items-center">
                  <Clock className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Time Limit</div>
                    <div className="text-muted">{section.timeLimit} minutes</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Clock className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Due Date</div>
                    <div className="text-muted">
                      {new Date(section.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <ClipboardCheck className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Total Questions</div>
                    <div className="text-muted">{section.questions.length}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">Progress</span>
                  <span className="text-muted">{section.progress}%</span>
                </div>
                <ProgressBar 
                  now={section.progress} 
                  variant="primary"
                  className="mb-3"
                />
                <div className="text-center">
                  <small className="text-muted">
                    {section.questions.filter(q => q.isAnswered || q.isCompleted).length} of {section.questions.length} questions completed
                  </small>
                </div>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="mb-2">Assessment Tips:</h6>
                <ul className="mb-0 small text-muted">
                  <li>Read questions carefully</li>
                  <li>Manage your time wisely</li>
                  <li>Save progress regularly</li>
                  <li>Review answers before submitting</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AssessmentSectionDetails;
