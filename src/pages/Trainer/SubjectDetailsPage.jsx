import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Spinner, Alert, Badge } from 'react-bootstrap';
import { Book, ArrowLeft, Clock, CheckCircle, Person } from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import TraineeListInSubject from '../../components/Trainer/SubjectDetail/TraineeListInSubject';

const SubjectDetailsPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trainees');
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock subject data
        const mockSubject = {
          id: subjectId,
          title: 'Safety Procedures - Module 1',
          code: 'SP-101',
          description: 'Introduction to aviation safety procedures and protocols',
          duration: '2 hours',
          status: 'completed',
          instructor: 'Dr. Smith',
          course: 'Aviation Safety Management',
          completionDate: '2024-01-20',
          progress: 100,
          totalTrainees: 25,
          completedTrainees: 20,
          averageScore: 87,
          materials: [
            { name: 'Safety Manual v2.1', type: 'PDF', size: '2.3 MB' },
            { name: 'Video Tutorial', type: 'MP4', size: '45 MB' },
            { name: 'Assessment Quiz', type: 'Quiz', size: 'N/A' }
          ],
          assessments: [
            { name: 'Safety Procedures Quiz', type: 'Quiz', maxScore: 100, averageScore: 87 },
            { name: 'Practical Assessment', type: 'Practical', maxScore: 100, averageScore: 89 }
          ]
        };
        
        setSubject(mockSubject);
      } catch (err) {
        setError('Failed to load subject details');
        console.error('Error fetching subject:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [subjectId]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      in_progress: { variant: 'info', text: 'In Progress' },
      completed: { variant: 'success', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: 'Unknown' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const tabs = [
    {
      id: 'trainees',
      title: 'Trainee List',
      icon: Person,
      component: <TraineeListInSubject subjectId={subjectId} />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading subject details...</p>
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

  if (!subject) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Subject Not Found</Alert.Heading>
          <p>The requested subject could not be found.</p>
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
              <h2 className="mb-1">{subject.title}</h2>
              <p className="text-muted mb-0">{subject.code} • {subject.course}</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Subject Info Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Clock size={24} className="text-primary mb-2" />
              <h6 className="mb-1">Duration</h6>
              <h4 className="mb-0 text-primary">{subject.duration} days</h4>
              <small className="text-muted">Estimated Time</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Person size={24} className="text-success mb-2" />
              <h6 className="mb-1">Trainees</h6>
              <h4 className="mb-0 text-success">{subject.completedTrainees}/{subject.totalTrainees}</h4>
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
              <h4 className="mb-0 text-info">{subject.averageScore}%</h4>
              <small className="text-muted">Performance</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <CheckCircle size={24} className="text-warning mb-2" />
              <h6 className="mb-1">Status</h6>
              {getStatusBadge(subject.status)}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Subject Information */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Subject Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Book size={16} className="me-2 text-muted" />
                <strong>Description:</strong> {subject.description}
              </div>
              <div className="mb-3">
                <Person size={16} className="me-2 text-muted" />
                <strong>Instructor:</strong> {subject.instructor}
              </div>
              <div className="mb-3">
                <Clock size={16} className="me-2 text-muted" />
                <strong>Completion Date:</strong> {subject.completionDate}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Materials</h5>
            </Card.Header>
            <Card.Body>
              {subject.materials.map((material, index) => (
                <div key={index} className="mb-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-medium">{material.name}</span>
                    <small className="text-muted d-block">{material.type}</small>
                  </div>
                  <small className="text-muted">{material.size}</small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Assessments */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Assessments</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Type</th>
                      <th>Max Score</th>
                      <th>Average Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subject.assessments.map((assessment, index) => (
                      <tr key={index}>
                        <td>{assessment.name}</td>
                        <td>{assessment.type}</td>
                        <td>{assessment.maxScore}</td>
                        <td>{assessment.averageScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
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

export default SubjectDetailsPage;









