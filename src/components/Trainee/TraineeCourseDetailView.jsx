import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Nav, Tab } from 'react-bootstrap';
import { ArrowLeft, Book, ClipboardCheck } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';
import TraineeSubjectList from './TraineeSubjectList';
import TraineeAllAssessmentEvents from './TraineeAllAssessmentEvents';

const TraineeCourseDetailView = ({ traineeId, courseId }) => {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('subjects');

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
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="border-0 shadow-sm mb-2">
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
              <Card.Header className="border-bottom py-2 bg-primary">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="subjects" 
                      className="d-flex align-items-center"
                      style={{ 
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#ffffff',
                        fontWeight: activeTab === 'subjects' ? '600' : '400',
                        opacity: activeTab === 'subjects' ? '1' : '0.7',
                        borderRadius: '4px 4px 0 0'
                      }}
                    >
                      <Book className="me-2" size={16} />
                      Subject List
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="assessments" 
                      className="d-flex align-items-center"
                      style={{ 
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#ffffff',
                        fontWeight: activeTab === 'assessments' ? '600' : '400',
                        opacity: activeTab === 'assessments' ? '1' : '0.7',
                        borderRadius: '4px 4px 0 0'
                      }}
                    >
                      <ClipboardCheck className="me-2" size={16} />
                      All Assessment Events
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body className="p-0">
                <Tab.Content>
                  <Tab.Pane eventKey="subjects">
                    <TraineeSubjectList 
                      traineeId={traineeId} 
                      courseId={courseId} 
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="assessments">
                    <TraineeAllAssessmentEvents 
                      traineeId={traineeId} 
                      courseId={courseId} 
                    />
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Tab.Container>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeCourseDetailView;
