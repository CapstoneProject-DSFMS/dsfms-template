import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { 
  Building, 
  Book, 
  ClipboardCheck, 
  ArrowRight,
  People,
  CalendarEvent,
  CheckCircle,
  ExclamationTriangle
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/department-head.css';

const DepartmentHeadDashboardPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('department-dashboard');

  const sidebarItems = [
    {
      id: 'department-dashboard',
      title: 'Department Dashboard',
      icon: Building,
      description: 'Overview of department activities and statistics',
      color: 'primary'
    },
    {
      id: 'my-department-details',
      title: 'My Department Details',
      icon: Book,
      description: 'Manage courses, subjects, and trainees in your department',
      color: 'info'
    },
    {
      id: 'assessment-review-requests',
      title: 'List Assessment Review Requests',
      icon: ClipboardCheck,
      description: 'Review and approve/deny assessment requests',
      color: 'warning'
    }
  ];

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

  const renderContent = () => {
    switch (activeSection) {
      case 'department-dashboard':
        return (
          <div>
            <h4 className="mb-4">Department Dashboard</h4>
            <Row>
              <Col md={3} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <Book size={24} className="text-primary" />
                    </div>
                    <h5 className="mb-1">12</h5>
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
                    <h5 className="mb-1">156</h5>
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
                    <h5 className="mb-1">8</h5>
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
                    <h5 className="mb-1">24</h5>
                    <p className="text-muted mb-0">Upcoming Assessments</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        );
      case 'my-department-details':
        return (
          <div>
            <h4 className="mb-4">My Department Details</h4>
            <p className="text-muted">Access course management, subject lists, and trainee information for your department.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/department-head/my-department-details')}
              className="me-2"
            >
              <Book className="me-2" />
              View Course List
            </Button>
          </div>
        );
      case 'assessment-review-requests':
        return (
          <div>
            <h4 className="mb-4">Assessment Review Requests</h4>
            <p className="text-muted">Review and approve or deny assessment requests from your department.</p>
            <Button 
              variant="warning" 
              onClick={() => navigate('/department-head/assessment-review-requests')}
              className="me-2"
            >
              <ClipboardCheck className="me-2" />
              View Review Requests
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Sidebar */}
        <Col lg={3} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Department Head Portal</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {sidebarItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      className={`list-group-item list-group-item-action border-0 ${
                        isActive ? 'bg-primary text-white' : ''
                      }`}
                      onClick={() => setActiveSection(item.id)}
                      style={{
                        border: 'none',
                        borderRadius: 0,
                        padding: '1rem'
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <IconComponent 
                          size={20} 
                          className={`me-3 ${isActive ? 'text-white' : 'text-primary'}`}
                        />
                        <div className="flex-grow-1 text-start">
                          <h6 className={`mb-1 ${isActive ? 'text-white' : 'text-dark'}`}>
                            {item.title}
                          </h6>
                          <small className={`${isActive ? 'text-white-50' : 'text-muted'}`}>
                            {item.description}
                          </small>
                        </div>
                        {isActive && <ArrowRight size={16} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col lg={9}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {renderContent()}
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4 border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  
                  return (
                    <Col md={6} className="mb-3" key={index}>
                      <Button
                        variant="outline-primary"
                        className="w-100 h-100 p-3 text-start"
                        onClick={() => navigate(action.path)}
                        style={{ minHeight: '80px' }}
                      >
                        <div className="d-flex align-items-center">
                          <div className={`bg-${action.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px' }}>
                            <IconComponent size={20} className={`text-${action.color}`} />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{action.title}</h6>
                            <small className="text-muted">{action.description}</small>
                          </div>
                        </div>
                      </Button>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DepartmentHeadDashboardPage;
