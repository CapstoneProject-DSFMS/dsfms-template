import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Book, Calendar, Clock, Person, GeoAlt } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const TraineeSubjectDetailView = ({ traineeId, courseId, subjectId }) => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (traineeId && courseId && subjectId) {
      loadSubjectDetails();
    }
  }, [traineeId, courseId, subjectId]);

  const loadSubjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data for now - replace with actual API calls
      const mockSubject = {
        id: subjectId,
        name: 'Emergency Procedures',
        code: 'EP101',
        description: 'Comprehensive training on emergency procedures and safety protocols for flight operations.',
        level: 'INTERMEDIATE',
        status: 'ACTIVE',
        duration: 40,
        method: 'Simulator',
        startDate: '2024-02-01T08:00:00.000Z',
        endDate: '2024-02-15T17:00:00.000Z',
        roomName: 'Simulator Room A',
        progress: 75,
        trainer: {
          name: 'Captain John Smith',
          email: 'john.smith@instructor.com'
        },
        assessments: [
          {
            id: '1',
            name: 'Emergency Evacuation Drill',
            type: 'Practical',
            dueDate: '2024-02-10T14:00:00.000Z',
            status: 'COMPLETED',
            score: 85
          },
          {
            id: '2',
            name: 'Safety Protocol Test',
            type: 'Written',
            dueDate: '2024-02-12T10:00:00.000Z',
            status: 'PENDING',
            score: null
          }
        ]
      };
      
      const mockTrainee = {
        id: traineeId,
        firstName: 'John',
        lastName: 'Doe',
        eid: 'TR001'
      };
      
      setSubject(mockSubject);
      setTrainee(mockTrainee);
    } catch (error) {
      console.error('Error loading subject details:', error);
      setError('Failed to load subject details');
      toast.error('Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/trainee/${traineeId}/course/${courseId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { variant: 'success', text: 'Active' },
      'COMPLETED': { variant: 'primary', text: 'Completed' },
      'PENDING': { variant: 'warning', text: 'Pending' },
      'IN_PROGRESS': { variant: 'info', text: 'In Progress' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant} className="fs-6">{config.text}</Badge>;
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

  const getAssessmentStatusBadge = (status) => {
    const statusConfig = {
      'COMPLETED': { variant: 'success', text: 'Completed' },
      'PENDING': { variant: 'warning', text: 'Pending' },
      'IN_PROGRESS': { variant: 'info', text: 'In Progress' },
      'OVERDUE': { variant: 'danger', text: 'Overdue' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading subject details...</p>
        </div>
      </Container>
    );
  }

  if (error || !subject) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Subject not found'}</p>
          <Button variant="outline-danger" onClick={handleBack}>
            <ArrowLeft className="me-2" size={16} />
            Back to Course
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
                <Book className="me-2" size={28} />
                {subject.name}
              </h2>
                <p className="text-muted mb-0">
                  {subject.code} • {trainee?.firstName} {trainee?.lastName}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {getStatusBadge(subject.status)}
              {getLevelBadge(subject.level)}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Enrolled Subject Details - Left side with Upcoming Assessment Events */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <ClipboardCheck className="me-2" size={20} />
                Upcoming Assessment Events
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <TraineeUpcomingAssessments 
                traineeId={traineeId} 
                courseId={courseId}
                subjectId={subjectId}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Subject Information - Right side */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <Book className="me-2" size={20} />
                Enrolled Subject Details
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <div className="d-flex align-items-center">
                  <Calendar className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Start Date</div>
                    <div className="text-muted">
                      {new Date(subject.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Calendar className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">End Date</div>
                    <div className="text-muted">
                      {new Date(subject.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Clock className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Duration</div>
                    <div className="text-muted">{subject.duration} hours</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <GeoAlt className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Room</div>
                    <div className="text-muted">{subject.roomName}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Person className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Trainer</div>
                    <div className="text-muted">{subject.trainer?.name}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">Progress</span>
                  <span className="text-muted">{subject.progress}%</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-3">
                <h6>Description</h6>
                <p className="text-muted">{subject.description}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeSubjectDetailView;
