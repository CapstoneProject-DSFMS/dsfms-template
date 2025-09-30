import React from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Book, People, ClipboardCheck, BarChart, FileText, Award } from 'react-bootstrap-icons';

const AcademicDashboard = () => {
  // Mock data - in real app, this would come from API
  const academicStats = {
    totalCourses: 12,
    activeSubjects: 45,
    enrolledTrainees: 180,
    completedAssessments: 320,
    pendingAssessments: 25,
    totalDepartments: 8
  };

  const recentCourses = [
    { id: 1, name: 'Aviation Safety Fundamentals', department: 'Safety', trainees: 25, status: 'Active' },
    { id: 2, name: 'Flight Operations Management', department: 'Operations', trainees: 18, status: 'Active' },
    { id: 3, name: 'Emergency Procedures', department: 'Safety', trainees: 32, status: 'Active' },
  ];

  const upcomingAssessments = [
    { id: 1, course: 'Aviation Safety', subject: 'Safety Procedures', date: 'Dec 15, 2024', trainees: 25 },
    { id: 2, course: 'Flight Operations', subject: 'Navigation Systems', date: 'Dec 18, 2024', trainees: 18 },
    { id: 3, course: 'Emergency Procedures', subject: 'Emergency Response', date: 'Dec 20, 2024', trainees: 32 },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge bg="success">{status}</Badge>;
      case 'Inactive':
        return <Badge bg="secondary">{status}</Badge>;
      default:
        return <Badge bg="primary">{status}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary-custom mb-0 text-mobile-center">Academic Department Dashboard</h1>
          <p className="text-muted">Manage courses, subjects, and trainee enrollment.</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <Book size={32} className="text-primary-custom mb-2" />
              <h4 className="mb-1">{academicStats.totalCourses}</h4>
              <p className="text-muted mb-0">Total Courses</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FileText size={32} className="text-success mb-2" />
              <h4 className="mb-1">{academicStats.activeSubjects}</h4>
              <p className="text-muted mb-0">Active Subjects</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <People size={32} className="text-warning mb-2" />
              <h4 className="mb-1">{academicStats.enrolledTrainees}</h4>
              <p className="text-muted mb-0">Enrolled Trainees</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <ClipboardCheck size={32} className="text-info mb-2" />
              <h4 className="mb-1">{academicStats.completedAssessments}</h4>
              <p className="text-muted mb-0">Completed Assessments</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Courses */}
        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-primary-custom text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <Book className="me-2" size={20} />
                Recent Courses
              </h5>
            </Card.Header>
            <Card.Body>
              {recentCourses.map((course) => (
                <div key={course.id} className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                  <div>
                    <h6 className="mb-1">{course.name}</h6>
                    <small className="text-muted">Department: {course.department}</small>
                  </div>
                  <div className="text-end">
                    {getStatusBadge(course.status)}
                    <div className="small text-muted mt-1">{course.trainees} trainees</div>
                  </div>
                </div>
              ))}
              <Button variant="outline-primary" size="sm" className="w-100">
                View All Courses
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Upcoming Assessments */}
        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-primary-custom text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <BarChart className="me-2" size={20} />
                Upcoming Assessments
              </h5>
            </Card.Header>
            <Card.Body>
              {upcomingAssessments.map((assessment) => (
                <div key={assessment.id} className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                  <div>
                    <h6 className="mb-1">{assessment.course}</h6>
                    <small className="text-muted">Subject: {assessment.subject}</small>
                  </div>
                  <div className="text-end">
                    <Badge bg="primary">{assessment.date}</Badge>
                    <div className="small text-muted mt-1">{assessment.trainees} trainees</div>
                  </div>
                </div>
              ))}
              <Button variant="outline-primary" size="sm" className="w-100">
                View All Assessments
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary-custom text-white">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <Button variant="outline-primary" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <Book size={24} className="mb-2" />
                    <span>Create Course</span>
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button variant="outline-success" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <FileText size={24} className="mb-2" />
                    <span>Add Subject</span>
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button variant="outline-warning" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <People size={24} className="mb-2" />
                    <span>Enroll Trainees</span>
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button variant="outline-info" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <Award size={24} className="mb-2" />
                    <span>View Reports</span>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AcademicDashboard;
