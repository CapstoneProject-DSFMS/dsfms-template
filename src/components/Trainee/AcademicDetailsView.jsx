import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, ProgressBar, Button } from 'react-bootstrap';
import { ArrowLeft, Book, ClipboardCheck, Trophy, Clock, CheckCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AcademicDetailsView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [academicData, setAcademicData] = useState(null);

  useEffect(() => {
    loadAcademicData();
  }, []);

  const loadAcademicData = async () => {
    try {
      setLoading(true);
      
      // Mock academic data - replace with actual API call
      const mockData = {
        totalCourses: 8,
        completedCourses: 3,
        inProgressCourses: 2,
        pendingCourses: 3,
        totalAssessments: 15,
        completedAssessments: 8,
        pendingAssessments: 7,
        overallProgress: 65,
        courses: [
          {
            id: 1,
            name: 'Safety Procedures Training',
            code: 'SAF001',
            progress: 100,
            status: 'completed',
            completedDate: '2024-01-15'
          },
          {
            id: 2,
            name: 'Flight Operations',
            code: 'FLT002',
            progress: 75,
            status: 'in-progress',
            startDate: '2024-01-20'
          },
          {
            id: 3,
            name: 'Emergency Response',
            code: 'EMG003',
            progress: 45,
            status: 'in-progress',
            startDate: '2024-02-01'
          },
          {
            id: 4,
            name: 'Technical Systems',
            code: 'TECH004',
            progress: 0,
            status: 'pending',
            startDate: '2024-02-15'
          }
        ],
        recentAssessments: [
          {
            id: 1,
            name: 'Safety Training Assessment',
            course: 'Safety Procedures Training',
            score: 95,
            status: 'completed',
            completedDate: '2024-01-15'
          },
          {
            id: 2,
            name: 'Flight Operations Quiz',
            course: 'Flight Operations',
            score: 88,
            status: 'completed',
            completedDate: '2024-01-25'
          },
          {
            id: 3,
            name: 'Emergency Response Test',
            course: 'Emergency Response',
            score: null,
            status: 'pending',
            dueDate: '2024-02-10'
          }
        ]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setAcademicData(mockData);
    } catch (error) {
      console.error('Error loading academic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-success" />;
      case 'in-progress': return <Clock className="text-warning" />;
      case 'pending': return <Clock className="text-muted" />;
      default: return <Clock className="text-muted" />;
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading academic details...</p>
        </div>
      </Container>
    );
  }

  if (!academicData) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Failed to load academic details. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4 academic-details">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-3"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className="mb-1">Academic Details</h2>
              <p className="text-muted mb-0">Track your learning progress and achievements</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <Book size={32} className="text-primary mb-2" />
              <h4 className="mb-1">{academicData.totalCourses}</h4>
              <p className="text-muted mb-0">Total Courses</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <Trophy size={32} className="text-success mb-2" />
              <h4 className="mb-1">{academicData.completedCourses}</h4>
              <p className="text-muted mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <Clock size={32} className="text-warning mb-2" />
              <h4 className="mb-1">{academicData.inProgressCourses}</h4>
              <p className="text-muted mb-0">In Progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <ClipboardCheck size={32} className="text-info mb-2" />
              <h4 className="mb-1">{academicData.completedAssessments}</h4>
              <p className="text-muted mb-0">Assessments Done</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

       {/* Overall Progress */}
       <Row className="mb-5">
         <Col>
           <Card className="border-0 shadow-sm">
             <Card.Header className="bg-primary text-white">
               <h5 className="mb-0">Overall Learning Progress</h5>
             </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <h2 className="text-primary mb-1">{academicData.overallProgress}%</h2>
                <p className="text-muted mb-0">Complete your courses to improve progress</p>
              </div>
              <ProgressBar 
                now={academicData.overallProgress} 
                variant="primary" 
                style={{ height: '12px' }}
                className="mb-3"
              />
              <Row className="text-center">
                <Col>
                  <small className="text-muted">
                    {academicData.completedCourses} of {academicData.totalCourses} courses completed
                  </small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
         {/* Course Progress */}
         <Col lg={8} className="mb-4 pe-3">
           <Card className="border-0 shadow-sm h-100">
             <Card.Header className="bg-primary text-white">
               <h5 className="mb-0 d-flex align-items-center">
                 <Book className="me-2" />
                 Course Progress
               </h5>
             </Card.Header>
            <Card.Body>
              {academicData.courses.map((course) => (
                <div key={course.id} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="mb-1">{course.name}</h6>
                      <small className="text-muted">{course.code}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge variant={getStatusVariant(course.status)}>
                        {course.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <ProgressBar 
                    now={course.progress} 
                    variant={course.progress === 100 ? 'success' : 'primary'}
                    style={{ height: '8px' }}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">{course.progress}% complete</small>
                    {course.status === 'completed' && (
                      <small className="text-success">
                        Completed: {new Date(course.completedDate).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

         {/* Recent Assessments */}
         <Col lg={4} className="mb-4 ps-3">
           <Card className="border-0 shadow-sm h-100">
             <Card.Header className="bg-primary text-white">
               <h5 className="mb-0 d-flex align-items-center">
                 <ClipboardCheck className="me-2" />
                 Recent Assessments
               </h5>
             </Card.Header>
            <Card.Body>
              {academicData.recentAssessments.map((assessment) => (
                <div key={assessment.id} className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="mb-1">{assessment.name}</h6>
                    {getStatusIcon(assessment.status)}
                  </div>
                  <small className="text-muted d-block mb-1">{assessment.course}</small>
                  {assessment.status === 'completed' ? (
                    <div className="d-flex justify-content-between">
                      <Badge variant="success">Score: {assessment.score}</Badge>
                      <small className="text-muted">
                        {new Date(assessment.completedDate).toLocaleDateString()}
                      </small>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between">
                      <Badge variant="warning">Pending</Badge>
                      <small className="text-muted">
                        Due: {new Date(assessment.dueDate).toLocaleDateString()}
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AcademicDetailsView;
