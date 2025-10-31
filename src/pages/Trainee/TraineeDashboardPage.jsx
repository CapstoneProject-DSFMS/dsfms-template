import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Person, Book, ClipboardCheck, ExclamationTriangle, ArrowRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

// Add custom CSS to override Bootstrap card-header styles for dashboard
const dashboardStyles = `
  .training-progress-card .card-header {
    background-color: #1b3c53 !important;
    color: #ffffff !important;
    border-bottom: 1px solid #dee2e6 !important;
  }
  .training-progress-card .card-header h5 {
    color: #ffffff !important;
  }
  .assessments-card .card-header {
    background-color: #1b3c53 !important;
    color: #ffffff !important;
    border-bottom: 1px solid #dee2e6 !important;
  }
  .assessments-card .card-header h5 {
    color: #ffffff !important;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = dashboardStyles;
  document.head.appendChild(styleSheet);
}
const TraineeDashboardPage = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Academic Details',
      description: 'Track your learning progress and achievements',
      icon: Person,
      path: '/trainee/academic-details',
      color: 'primary'
    },
    {
      title: 'Your Courses',
      description: 'Check your enrolled courses and progress',
      icon: Book,
      path: '/trainee/enrolled-courses',
      color: 'success'
    },
    {
      title: 'All Assessments',
      description: 'View pending assessments and tasks',
      icon: ClipboardCheck,
      path: '/trainee/your-assessments',
      color: 'warning'
    },
    {
      title: 'Create Issue Report',
      description: 'Report issues or provide feedback',
      icon: ExclamationTriangle,
      path: '/trainee/create-incident-feedback-report',
      color: 'danger'
    }
  ];


  return (
    <Container fluid className="py-4">

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


      {/* Training Progress */}
      <Row className="mt-4">
        <Col lg={6} className="d-flex">
          <Card className="border-0 shadow-sm w-100 training-progress-card">
            <Card.Header>
              <h5 className="mb-0">Training Progress</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
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
        <Col lg={6} className="d-flex">
          <Card className="border-0 shadow-sm w-100 assessments-card">
            <Card.Header>
              <h5 className="mb-0">Assessments Required Confirmations</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="text-center py-4">
                <ClipboardCheck size={48} className="text-muted mb-3" />
                <h6 className="text-muted">No assessments pending</h6>
                <p className="text-muted small mb-3">
                  View and complete signature required assessments.
                </p>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/trainee/signature-required')}
                  className="d-flex align-items-center justify-content-center mx-auto"
                >
                  <ClipboardCheck size={16} className="me-2" />
                  Go to Assessments
                  <ArrowRight size={16} className="ms-2" />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeDashboardPage;
