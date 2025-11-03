import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { 
  Book, 
  Calendar,
  Award,
  ArrowRight,
  Building,
  PersonCheck,
  FileText
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/academic-department.css';

const AcademicDashboard = () => {
  const navigate = useNavigate();

  const recentActivities = [
    {
      id: 1,
      type: 'course_completed',
      title: 'Safety Procedures Course',
      trainee: 'John Smith',
      time: '2 hours ago',
      icon: Award
    },
    {
      id: 2,
      type: 'new_enrollment',
      title: 'Emergency Response Training',
      trainee: 'Sarah Johnson',
      time: '4 hours ago',
      icon: PersonCheck
    },
    {
      id: 3,
      type: 'course_scheduled',
      title: 'First Aid Training',
      trainee: 'Mike Wilson',
      time: '6 hours ago',
      icon: Calendar
    }
  ];

  const quickActions = [
    {
      title: 'View All Departments',
      description: 'Browse and manage academic departments',
      icon: Building,
      action: () => navigate('/academic/departments'),
      color: 'primary'
    },
    {
      title: 'Course Management',
      description: 'Create and manage training courses',
      icon: Book,
      action: () => navigate('/academic/departments'),
      color: 'success'
    },
    {
      title: 'Trainee Reports',
      description: 'View trainee progress and reports',
      icon: FileText,
      action: () => navigate('/academic/departments'),
      color: 'info'
    }
  ];

  return (
    <div className="academic-dashboard-page" style={{ paddingBottom: '2rem' }}>
      <Container className="py-4">
        <Row>
          {/* Quick Actions */}
          <Col lg={8} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="academic-dashboard-section-header bg-primary text-white border-0">
                <h5 className="mb-0 text-white">Quick Actions</h5>
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
              <Card.Header className="academic-dashboard-section-header bg-primary text-white border-0">
                <h5 className="mb-0 text-white">Recent Activities</h5>
              </Card.Header>
              <Card.Body>
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="d-flex align-items-start mb-3">
                    <div className="me-3">
                      <activity.icon size={20} className="text-primary" />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 small">{activity.title}</h6>
                      <p className="text-muted mb-1 small">{activity.trainee}</p>
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

export default AcademicDashboard;
