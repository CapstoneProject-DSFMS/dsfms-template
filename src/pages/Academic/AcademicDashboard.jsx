import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { 
  ArrowRight,
  Building,
  CalendarEvent,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import '../../styles/academic-department.css';

const AcademicDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const quickActions = [
    {
      title: 'Create New Assessment Event',
      description: 'Create a new assessment event for trainees',
      icon: CalendarEvent,
      action: () => {
        navigate('/academic/assessment-events');
      },
      color: 'primary'
    },
    {
      title: 'View All Departments',
      description: 'View and manage all academic departments',
      icon: Building,
      action: () => {
        navigate('/academic/departments');
      },
      color: 'primary'
    }
  ];

  // Mock data for Analytics - Replace with actual API calls
  const [analyticsData, setAnalyticsData] = useState({
    ongoingCourses: [],
    ongoingEnrollments: [],
    assessmentStatuses: [],
    passFailRate: []
  });

  useEffect(() => {
    // Simulate API call - Replace with actual API
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Mock data - Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAnalyticsData({
          // 1. Courses ON_GOING by Department
          ongoingCourses: [
            { department: 'Operations', count: 15 },
            { department: 'Maintenance', count: 12 },
            { department: 'Safety', count: 8 },
            { department: 'Quality', count: 10 },
            { department: 'Training', count: 6 }
          ],
          // 2. Subject Enrollments ON_GOING by Department
          ongoingEnrollments: [
            { department: 'Operations', count: 245 },
            { department: 'Maintenance', count: 180 },
            { department: 'Safety', count: 120 },
            { department: 'Quality', count: 150 },
            { department: 'Training', count: 95 }
          ],
          // 3. Assessment Form Status Distribution
          assessmentStatuses: [
            { status: 'NOT_STARTED', count: 150 },
            { status: 'DRAFT', count: 30 },
            { status: 'SUBMITTED', count: 45 },
            { status: 'APPROVED', count: 85 },
            { status: 'REJECTED', count: 12 },
            { status: 'CANCELLED', count: 8 }
          ],
          // 4. Pass/Fail Rate by Department
          passFailRate: [
            { department: 'Operations', pass: 120, fail: 15 },
            { department: 'Maintenance', pass: 95, fail: 8 },
            { department: 'Safety', pass: 80, fail: 5 },
            { department: 'Quality', pass: 100, fail: 10 },
            { department: 'Training', pass: 60, fail: 3 }
          ]
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Colors for charts
  const COLORS = ['#1b3c53', '#456882', '#6a9fb8', '#8fb6ce', '#b4d3e4', '#d9e9f2'];
  const STATUS_COLORS = {
    'NOT_STARTED': '#6c757d',
    'DRAFT': '#ffc107',
    'SUBMITTED': '#0d6efd',
    'APPROVED': '#28a745',
    'REJECTED': '#dc3545',
    'CANCELLED': '#6c757d'
  };

  return (
    <div className="academic-dashboard-page" style={{ paddingBottom: '2rem' }}>
      <Container className="py-4">
        {/* Quick Actions */}
        <Row className="mb-4">
          <Col lg={12} className="mb-4">
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
        </Row>

        {/* Analytics */}
        {loading ? (
          <Row>
            <Col>
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading analytics data...</p>
              </div>
            </Col>
          </Row>
        ) : (
          <>
            {/* Chart 1: Ongoing Courses by Department */}
            <Row className="mb-4">
              <Col lg={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white border-0">
                    <h5 className="mb-0 text-white d-flex align-items-center">
                      <BarChartIcon className="me-2" size={20} />
                      Ongoing Courses
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.ongoingCourses}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="department" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#1b3c53" name="Number of Courses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>

              {/* Chart 2: Ongoing Enrollments by Department */}
              <Col lg={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white border-0">
                    <h5 className="mb-0 text-white d-flex align-items-center">
                      <BarChartIcon className="me-2" size={20} />
                      Ongoing Trainees
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.ongoingEnrollments}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="department" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#456882" name="Number of Trainees" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Chart 3: Assessment Results Status Distribution */}
            <Row className="mb-4">
              <Col lg={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white border-0">
                    <h5 className="mb-0 text-white d-flex align-items-center">
                      <PieChartIcon className="me-2" size={20} />
                      Assessment Results
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.assessmentStatuses}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analyticsData.assessmentStatuses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>

              {/* Chart 4: Pass/Fail Rate by Department */}
              <Col lg={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white border-0">
                    <h5 className="mb-0 text-white d-flex align-items-center">
                      <BarChartIcon className="me-2" size={20} />
                      Training Effectiveness (Pass/Fail Rate)
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.passFailRate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="department" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pass" stackId="a" fill="#28a745" name="Pass" />
                        <Bar dataKey="fail" stackId="a" fill="#dc3545" name="Fail" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default AcademicDashboard;
