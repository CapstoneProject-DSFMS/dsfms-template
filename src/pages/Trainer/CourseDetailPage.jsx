import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Spinner, Alert } from 'react-bootstrap';
import { Book, People, ArrowLeft } from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import SubjectList from '../../components/Trainer/CourseDetail/SubjectList';
import TraineeList from '../../components/Trainer/CourseDetail/TraineeList';
import courseAPI from '../../api/course';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subjects');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Call API GET /courses/{courseId}
        const courseData = await courseAPI.getCourseById(courseId);

        if (!courseData) {
          throw new Error('Course not found');
        }

        // Format date from ISO string to YYYY-MM-DD
        const formatDate = (dateString) => {
          if (!dateString) return null;
          return new Date(dateString).toISOString().split('T')[0];
        };

        // Map API data to component format
        const mappedCourse = {
          id: courseData.id,
          title: courseData.name || 'Unnamed Course',
          code: courseData.code || 'N/A',
          department: courseData.department?.name || 'N/A',
          startDate: formatDate(courseData.startDate),
          endDate: formatDate(courseData.endDate),
          status: courseData.status?.toLowerCase() || 'active',
          description: courseData.description || '',
          venue: courseData.venue || 'N/A',
          maxEnrollment: courseData.maxNumTrainee || 0
        };

        setCourse(mappedCourse);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const tabs = [
    {
      id: 'subjects',
      title: 'Subject List',
      icon: Book,
      component: <SubjectList courseId={courseId} />
    },
    {
      id: 'trainees',
      title: 'Trainee List',
      icon: People,
      component: <TraineeList courseId={courseId} />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading course details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Course Not Found</Alert.Heading>
          <p>The requested course could not be found.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <button 
              className="btn btn-link p-0 me-3"
              onClick={() => navigate(ROUTES.COURSES_INSTRUCTED)}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="mb-1">{course.title}</h2>
              <p className="text-muted mb-0">{course.code} • {course.department}</p>
            </div>
          </div>
          
        </Col>
      </Row>

      {/* Tabs */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0">
            <Card.Header className="bg-primary text-white p-0">
              <div className="custom-tabs-container">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      className={`custom-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <IconComponent size={16} className="me-2" />
                      {tab.title}
                    </button>
                  );
                })}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {activeTabData && activeTabData.component}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetailPage;
