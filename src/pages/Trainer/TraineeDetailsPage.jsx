import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Person, ArrowLeft, Envelope, Calendar, Clock, Book } from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';

const TraineeDetailsPage = () => {
  const { traineeId } = useParams();
  const navigate = useNavigate();
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTraineeDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock trainee data
        const mockTrainee = {
          id: traineeId,
          name: 'John Doe',
          email: 'john.doe@email.com',
          employeeId: 'EMP001',
          department: 'Operations',
          position: 'Operations Manager',
          phone: '+1-555-0123',
          enrollmentDate: '2024-01-15',
          status: 'active',
          lastActivity: '2024-01-20',
          completedCourses: 3,
          totalCourses: 5,
          completedSubjects: 12,
          totalSubjects: 20,
          averageScore: 85,
          certifications: [
            { name: 'Aviation Safety Management', date: '2024-01-20', status: 'completed' },
            { name: 'Risk Assessment', date: '2024-01-25', status: 'completed' },
            { name: 'Emergency Response', date: '2024-02-01', status: 'in_progress' }
          ],
          currentCourses: [
            { id: 1, name: 'Aviation Safety Management', progress: 75, instructor: 'Dr. Smith' },
            { id: 2, name: 'Aircraft Maintenance', progress: 45, instructor: 'Jane Doe' }
          ]
        };
        
        setTrainee(mockTrainee);
      } catch (err) {
        setError('Failed to load trainee details');
        console.error('Error fetching trainee:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTraineeDetails();
  }, [traineeId]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      completed: { variant: 'primary', text: 'Completed' },
      inactive: { variant: 'warning', text: 'Inactive' },
      suspended: { variant: 'danger', text: 'Suspended' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: 'Unknown' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading trainee details...</p>
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

  if (!trainee) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Trainee Not Found</Alert.Heading>
          <p>The requested trainee could not be found.</p>
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
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="mb-1">{trainee.name}</h2>
              <p className="text-muted mb-0">{trainee.employeeId} • {trainee.department}</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Trainee Info Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Person size={24} className="text-primary mb-2" />
              <h6 className="mb-1">Status</h6>
              {getStatusBadge(trainee.status)}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Book size={24} className="text-success mb-2" />
              <h6 className="mb-1">Courses</h6>
              <h4 className="mb-0 text-success">{trainee.completedCourses}/{trainee.totalCourses}</h4>
              <small className="text-muted">Completed</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="text-info mb-2">
                <i className="bi bi-graph-up" style={{ fontSize: '24px' }}></i>
              </div>
              <h6 className="mb-1">Average Score</h6>
              <h4 className="mb-0 text-info">{trainee.averageScore}%</h4>
              <small className="text-muted">Performance</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Calendar size={24} className="text-warning mb-2" />
              <h6 className="mb-1">Enrolled</h6>
              <h4 className="mb-0 text-warning">{trainee.enrollmentDate}</h4>
              <small className="text-muted">Start Date</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contact Information */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Contact Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Envelope size={16} className="me-2 text-muted" />
                <strong>Email:</strong> {trainee.email}
              </div>
              <div className="mb-3">
                <Person size={16} className="me-2 text-muted" />
                <strong>Position:</strong> {trainee.position}
              </div>
              <div className="mb-3">
                <Calendar size={16} className="me-2 text-muted" />
                <strong>Last Activity:</strong> {trainee.lastActivity}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Current Courses</h5>
            </Card.Header>
            <Card.Body>
              {trainee.currentCourses.map((course) => (
                <div key={course.id} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="mb-0">{course.name}</h6>
                    <small className="text-muted">{course.progress}%</small>
                  </div>
                  <div className="progress mb-1" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">Instructor: {course.instructor}</small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Certifications */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Certifications</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Certification</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainee.certifications.map((cert, index) => (
                      <tr key={index}>
                        <td>{cert.name}</td>
                        <td>{cert.date}</td>
                        <td>{getStatusBadge(cert.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeDetailsPage;









