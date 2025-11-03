import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { 
  ClipboardCheck, 
  FileEarmarkText, 
  Book, 
  PersonCheck,
  ArrowRight,
  CalendarEvent,
  CheckCircle,
  Clock
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

const TrainerDashboardPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('upcoming-assessments');

  const sidebarItems = [
    {
      id: 'upcoming-assessments',
      title: 'List Upcoming Assessment',
      icon: CalendarEvent,
      description: 'View and manage upcoming assessments',
      color: 'primary'
    },
    {
      id: 'assessment-results',
      title: 'List Assessment Result',
      icon: CheckCircle,
      description: 'Review completed assessment results',
      color: 'success'
    },
    {
      id: 'instructed-courses',
      title: 'List Instructed Course',
      icon: Book,
      description: 'Manage your instructed courses',
      color: 'info'
    }
  ];

  const quickActions = [
    {
      title: 'Configure Signature',
      description: 'Set up your digital signature for assessments',
      icon: PersonCheck,
      path: '/trainer/configure-signature',
      color: 'warning'
    },
    {
      title: 'Section Required Completion',
      description: 'Review sections that require completion',
      icon: ClipboardCheck,
      path: '/trainer/section-completion',
      color: 'danger'
    },
    {
      title: 'Assessment Result Details',
      description: 'View detailed assessment results',
      icon: FileEarmarkText,
      path: '/trainer/assessment-details',
      color: 'secondary'
    },
    {
      title: 'Result Approval Note',
      description: 'Manage result approval notes',
      icon: CheckCircle,
      path: '/trainer/approval-notes',
      color: 'success'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'upcoming-assessments':
        return (
          <div>
            <h4 className="mb-4">Upcoming Assessments</h4>
            <Row>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Header className="bg-primary text-white">
                    <h6 className="mb-0">Assessment Schedule</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center py-4">
                      <CalendarEvent size={48} className="text-muted mb-3" />
                      <h6 className="text-muted">No upcoming assessments</h6>
                      <p className="text-muted small">
                        You don't have any upcoming assessments scheduled.
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Header className="bg-success text-white">
                    <h6 className="mb-0">Quick Actions</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-2">
                      <Button variant="outline-primary" size="sm">
                        <CalendarEvent size={16} className="me-2" />
                        Schedule Assessment
                      </Button>
                      <Button variant="outline-success" size="sm">
                        <ClipboardCheck size={16} className="me-2" />
                        View All Assessments
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        );
      
      case 'assessment-results':
        return (
          <div>
            <h4 className="mb-4">Assessment Results</h4>
            <Row>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Header className="bg-success text-white">
                    <h6 className="mb-0">Recent Results</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center py-4">
                      <CheckCircle size={48} className="text-muted mb-3" />
                      <h6 className="text-muted">No recent results</h6>
                      <p className="text-muted small">
                        Assessment results will appear here once completed.
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Header className="bg-info text-white">
                    <h6 className="mb-0">Statistics</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center">
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="h4 text-primary">0</div>
                          <small className="text-muted">Completed</small>
                        </div>
                        <div className="col-4">
                          <div className="h4 text-warning">0</div>
                          <small className="text-muted">Pending</small>
                        </div>
                        <div className="col-4">
                          <div className="h4 text-success">0</div>
                          <small className="text-muted">Approved</small>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        );
      
      case 'instructed-courses':
        return (
          <div>
            <h4 className="mb-4">Instructed Courses</h4>
            <Row>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Header className="bg-info text-white">
                    <h6 className="mb-0">My Courses</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center py-4">
                        <Book size={48} className="text-muted mb-3" />
                      <h6 className="text-muted">No courses assigned</h6>
                      <p className="text-muted small">
                        You haven't been assigned to instruct any courses yet.
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Header className="bg-warning text-white">
                    <h6 className="mb-0">Course Management</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-2">
                      <Button variant="outline-primary" size="sm">
                        <Book size={16} className="me-2" />
                        View All Courses
                      </Button>
                      <Button variant="outline-info" size="sm">
                        <Clock size={16} className="me-2" />
                        Course Schedule
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="mb-2">Trainer Dashboard</h2>
          <p className="text-muted">Manage your assessments, courses, and training activities</p>
        </Col>
      </Row>

      <Row>
        {/* Sidebar */}
        <Col lg={3} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Navigation</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {sidebarItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`list-group-item list-group-item-action border-0 ${
                        activeSection === item.id ? 'active' : ''
                      }`}
                      onClick={() => setActiveSection(item.id)}
                      style={{
                        backgroundColor: activeSection === item.id ? '#0d6efd' : 'transparent',
                        color: activeSection === item.id ? 'white' : 'inherit',
                        border: 'none',
                        borderRadius: 0
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <IconComponent 
                          size={20} 
                          className="me-3"
                          style={{ color: activeSection === item.id ? 'white' : `var(--bs-${item.color})` }}
                        />
                        <div className="flex-grow-1 text-start">
                          <h6 className="mb-1">{item.title}</h6>
                          <small className="text-muted">{item.description}</small>
                        </div>
                        <ArrowRight size={16} />
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
            <Card.Body className="p-4">
              {renderContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col>
          <h4 className="mb-3">Quick Actions</h4>
        </Col>
      </Row>

      <Row>
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Col lg={6} xl={3} className="mb-4" key={index}>
              <Card 
                className="h-100 border-0 shadow-sm hover-card"
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
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      className={`bg-${action.color} text-white rounded-circle d-flex align-items-center justify-content-center me-3`}
                      style={{ width: '48px', height: '48px' }}
                    >
                      <IconComponent size={24} />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{action.title}</h5>
                    </div>
                    <ArrowRight size={20} className="text-muted" />
                  </div>
                  <p className="text-muted mb-0">{action.description}</p>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default TrainerDashboardPage;
