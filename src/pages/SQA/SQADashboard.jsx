import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { 
  ExclamationTriangle, 
  ChatDots, 
  FileText, 
  ArrowRight,
  Clock,
  CheckCircle,
  ExclamationCircle
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { API_PERMISSIONS } from '../../constants/apiPermissions';

const SQADashboard = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // Mock data for dashboard
  const dashboardStats = {
    totalIssues: 24,
    pendingIssues: 8,
    totalFeedback: 156,
    acknowledgedFeedback: 89,
    totalTemplates: 12,
    activeTemplates: 10
  };

  const recentActivities = [
    {
      id: 1,
      type: 'issue_created',
      title: 'Safety Procedure Issue',
      description: 'New issue reported by John Smith',
      time: '2 hours ago',
      icon: ExclamationTriangle,
      color: 'danger'
    },
    {
      id: 2,
      type: 'feedback_received',
      title: 'Training Feedback',
      description: 'Feedback from Sarah Johnson',
      time: '4 hours ago',
      icon: ChatDots,
      color: 'info'
    },
    {
      id: 3,
      type: 'template_updated',
      title: 'Assessment Template',
      description: 'Template updated by Mike Wilson',
      time: '6 hours ago',
      icon: FileText,
      color: 'success'
    }
  ];

  const quickActions = [
    {
      title: 'Issue List',
      description: 'View and manage all reported issues',
      icon: ExclamationTriangle,
      action: () => navigate('/sqa/issues'),
      color: 'danger'
    },
    {
      title: 'Feedback List',
      description: 'Review and acknowledge feedback',
      icon: ChatDots,
      action: () => navigate('/sqa/feedback'),
      color: 'info'
    },
    {
      title: 'Template List',
      description: 'Manage assessment templates',
      icon: FileText,
      action: () => navigate('/sqa/templates'),
      color: 'success'
    }
  ];

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">SQA Auditor Dashboard</h2>
                <p className="text-muted mb-0">Quality assurance and audit management</p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={6} lg={2} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <ExclamationTriangle size={32} className="text-danger mb-2" />
                <h4 className="mb-1">{dashboardStats.totalIssues}</h4>
                <p className="text-muted mb-0 small">Total Issues</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={2} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <Clock size={32} className="text-warning mb-2" />
                <h4 className="mb-1">{dashboardStats.pendingIssues}</h4>
                <p className="text-muted mb-0 small">Pending Issues</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={2} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <ChatDots size={32} className="text-info mb-2" />
                <h4 className="mb-1">{dashboardStats.totalFeedback}</h4>
                <p className="text-muted mb-0 small">Total Feedback</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={2} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <CheckCircle size={32} className="text-success mb-2" />
                <h4 className="mb-1">{dashboardStats.acknowledgedFeedback}</h4>
                <p className="text-muted mb-0 small">Acknowledged</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={2} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FileText size={32} className="text-primary mb-2" />
                <h4 className="mb-1">{dashboardStats.totalTemplates}</h4>
                <p className="text-muted mb-0 small">Templates</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={2} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <ExclamationCircle size={32} className="text-secondary mb-2" />
                <h4 className="mb-1">{dashboardStats.activeTemplates}</h4>
                <p className="text-muted mb-0 small">Active</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Quick Actions */}
          <Col lg={8} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {quickActions.map((action, index) => (
                    <Col md={4} key={index} className="mb-3">
                      <div 
                        className="p-3 border rounded cursor-pointer h-100 d-flex flex-column"
                        style={{ cursor: 'pointer' }}
                        onClick={action.action}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <action.icon size={24} className={`text-${action.color} me-2`} />
                          <h6 className="mb-0">{action.title}</h6>
                        </div>
                        <p className="text-muted small mb-2 flex-grow-1">{action.description}</p>
                        <ArrowRight size={16} className={`text-${action.color} ms-auto`} />
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Activities */}
          <Col lg={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Recent Activities</h5>
              </Card.Header>
              <Card.Body>
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="d-flex align-items-start mb-3">
                    <div className="me-3">
                      <activity.icon size={20} className={`text-${activity.color}`} />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 small">{activity.title}</h6>
                      <p className="text-muted mb-1 small">{activity.description}</p>
                      <p className="text-muted mb-0 small">{activity.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline-primary" size="sm" className="w-100">
                  View All Activities
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SQADashboard;
