import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { 
  Book, 
  ClipboardCheck, 
  ArrowRight,
  People,
  CalendarEvent
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/department-head.css';
import '../../styles/academic-department.css';

const DepartmentHeadDashboardPage = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'View Course Details',
      description: 'Access detailed course information and management',
      icon: Book,
      path: '/department-head/my-department-details',
      color: 'primary'
    },
    {
      title: 'Review Assessment Requests',
      description: 'Process pending assessment review requests',
      icon: ClipboardCheck,
      path: '/department-head/assessment-review-requests',
      color: 'warning'
    },
    {
      title: 'Department Statistics',
      description: 'View department performance metrics',
      icon: People,
      path: '/department-head/statistics',
      color: 'info'
    },
    {
      title: 'Trainee Management',
      description: 'Manage trainee enrollments and progress',
      icon: People,
      path: '/department-head/trainee-management',
      color: 'success'
    }
  ];


  return (
    <div className="academic-dashboard-page" style={{ paddingBottom: '2rem' }}>
      <Container className="py-4">
        {/* Department Dashboard Metrics */}
        <Row className="mb-4">
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="academic-dashboard-section-header bg-primary text-white border-0">
                <h5 className="mb-0 text-white">Department Dashboard</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="text-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                          <Book size={24} className="text-primary" />
                        </div>
                        <h3 className="mb-1 fw-bold">12</h3>
                        <p className="text-muted mb-0">Active Courses</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="text-center">
                        <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                          <People size={24} className="text-success" />
                        </div>
                        <h3 className="mb-1 fw-bold">156</h3>
                        <p className="text-muted mb-0">Enrolled Trainees</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="text-center">
                        <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                          <ClipboardCheck size={24} className="text-warning" />
                        </div>
                        <h3 className="mb-1 fw-bold">8</h3>
                        <p className="text-muted mb-0">Pending Reviews</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="text-center">
                        <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                          <CalendarEvent size={24} className="text-info" />
                        </div>
                        <h3 className="mb-1 fw-bold">24</h3>
                        <p className="text-muted mb-0">Upcoming Assessments</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col lg={12}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="academic-dashboard-section-header bg-primary text-white border-0">
                <h5 className="mb-0 text-white">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    
                    return (
                      <Col md={6} lg={3} key={index} className="mb-3">
                        <div 
                          className="p-3 border rounded cursor-pointer h-100 d-flex flex-column"
                          style={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => navigate(action.path)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div className="d-flex align-items-center mb-2">
                            <IconComponent size={24} className={`text-${action.color} me-2`} />
                            <h6 className="mb-0">{action.title}</h6>
                          </div>
                          <p className="text-muted small mb-2 flex-grow-1">{action.description}</p>
                          <ArrowRight size={16} className={`text-${action.color} ms-auto`} />
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DepartmentHeadDashboardPage;
