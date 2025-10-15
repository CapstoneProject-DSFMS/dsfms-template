import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Book, Calendar, GeoAlt, People, Clock, ClipboardCheck, CheckCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';
import TraineeSubjectList from './TraineeSubjectList';
import TraineeUpcomingAssessments from './TraineeUpcomingAssessments';
import TraineeCompletedAssessments from './TraineeCompletedAssessments';

const TraineeCourseDetailView = ({ traineeId, courseId }) => {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (traineeId && courseId) {
      loadCourseDetails();
    }
  }, [traineeId, courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Hardcoded trainee details
      const mockTrainee = {
        id: traineeId,
        firstName: 'John',
        lastName: 'Doe',
        eid: 'EMP001',
        email: 'john.doe@company.com'
      };
      setTrainee(mockTrainee);
      
      // Load course details (assuming we have a course API)
      // For now, we'll use mock data
      const mockCourse = {
        id: courseId,
        name: 'Advanced Flight Training',
        code: 'AFT2024',
        description: 'Comprehensive flight training program covering advanced maneuvers and emergency procedures.',
        level: 'ADVANCED',
        status: 'ACTIVE',
        startDate: '2024-01-15T08:00:00.000Z',
        endDate: '2024-06-15T17:00:00.000Z',
        venue: 'Training Center A',
        maxNumTrainee: 25,
        passScore: 80,
        progress: 65,
        department: {
          name: 'Flight Crew Training Department',
          code: 'FCTD'
        }
      };
      
      setCourse(mockCourse);
    } catch (error) {
      console.error('Error loading course details:', error);
      setError('Failed to load course details');
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/trainee/enrolled-courses');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { variant: 'success', text: 'Active' },
      'ARCHIVED': { variant: 'secondary', text: 'Archived' },
      'PLANNED': { variant: 'info', text: 'Planned' },
      'COMPLETED': { variant: 'primary', text: 'Completed' }
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

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading course details...</p>
        </div>
      </Container>
    );
  }

  if (error || !course) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Course not found'}</p>
          <Button variant="outline-danger" onClick={handleBack}>
            <ArrowLeft className="me-2" size={16} />
            Back to Trainee
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
                {course.name}
              </h2>
                <p className="text-muted mb-0">
                  {course.code} • {trainee?.firstName} {trainee?.lastName}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {getStatusBadge(course.status)}
              {getLevelBadge(course.level)}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Enrolled Course Details - Left side with Subject List and Upcoming Assessment Events */}
        <Col lg={8} className="mb-4">
          <Row>
            {/* Subject List */}
            <Col className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Book className="me-2" size={20} />
                    Subject List
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <TraineeSubjectList 
                    traineeId={traineeId} 
                    courseId={courseId} 
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* Upcoming Assessment Events */}
            <Col className="mb-4">
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
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* Completed Assessments */}
            <Col>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <h5 className="mb-0 d-flex align-items-center">
                    <CheckCircle className="me-2" size={20} />
                    Completed Assessments
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <TraineeCompletedAssessments 
                    traineeId={traineeId} 
                    courseId={courseId} 
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Course Information - Right side */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <Book className="me-2" size={20} />
                Enrolled Course Details
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <div className="d-flex align-items-center">
                  <Calendar className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Start Date</div>
                    <div className="text-muted">
                      {new Date(course.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Calendar className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">End Date</div>
                    <div className="text-muted">
                      {new Date(course.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <GeoAlt className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Venue</div>
                    <div className="text-muted">{course.venue}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <People className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Max Trainees</div>
                    <div className="text-muted">{course.maxNumTrainee}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <Clock className="text-muted me-3" size={18} />
                  <div>
                    <div className="fw-semibold">Pass Score</div>
                    <div className="text-muted">{course.passScore}%</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">Progress</span>
                  <span className="text-muted">{course.progress}%</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-3">
                <h6>Description</h6>
                <p className="text-muted">{course.description}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeCourseDetailView;
