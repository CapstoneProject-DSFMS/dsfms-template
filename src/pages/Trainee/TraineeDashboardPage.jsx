import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Person, Book, ClipboardCheck, ExclamationTriangle, ArrowRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const TraineeDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Academic Details',
      description: 'View your personal and academic information',
      icon: Person,
      path: '/trainee/academic-details',
      color: 'primary'
    },
    {
      title: 'Enrolled Courses',
      description: 'Check your enrolled courses and progress',
      icon: Book,
      path: '/trainee/enrolled-courses',
      color: 'success'
    },
    {
      title: 'Assessment Pending',
      description: 'View pending assessments and tasks',
      icon: ClipboardCheck,
      path: '/trainee/assessment-pending',
      color: 'warning'
    },
    {
      title: 'Create Issue Report',
      description: 'Report issues or provide feedback',
      icon: ExclamationTriangle,
      path: '/trainee/create-issue',
      color: 'danger'
    }
  ];


  return (
    <Container fluid className="py-4">
      {/* Welcome Header */}
      <Row className="mb-4">
        <Col>
          <div>
            <h1 className="mb-1">
              {user?.fullName || user?.firstName || 'Trainee'}!
            </h1>
            <p className="text-muted mb-0">
              Welcome to your training portal. Here's what you can do today.
            </p>
          </div>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <h3 className="mb-3">Quick Actions</h3>
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

      {/* Recent Activity */}
      <Row className="mt-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <Book size={48} className="text-muted mb-3" />
                <h6 className="text-muted">No recent activity</h6>
                <p className="text-muted small mb-0">
                  Your recent training activities will appear here.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Training Progress */}
      <Row className="mt-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Training Progress</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <div className="mb-3">
                  <div className="display-4 text-primary fw-bold">0%</div>
                  <p className="text-muted mb-0">Overall Progress</p>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: '0%' }}
                  ></div>
                </div>
                <p className="text-muted small mb-0">
                  Complete your enrolled courses to see progress.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Upcoming Deadlines</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <ClipboardCheck size={48} className="text-muted mb-3" />
                <h6 className="text-muted">No upcoming deadlines</h6>
                <p className="text-muted small mb-0">
                  Check your assessment pending list for upcoming tasks.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeDashboardPage;
