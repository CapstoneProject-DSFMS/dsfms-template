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
import { ROUTES } from '../../constants/routes';
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
import dashboardAPI from '../../api/dashboard';
import { toast } from 'react-toastify';
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
        navigate(ROUTES.ASSESSMENT_EVENTS);
      },
      color: 'primary'
    },
    {
      title: 'View All Departments',
      description: 'View and manage all academic departments',
      icon: Building,
      action: () => {
        navigate('/academic/departments'); // Keep old route for now (academic-specific)
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
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Call API to get dashboard overview
        const response = await dashboardAPI.getAcademicOverview();
        
        // Map API response to chart data format
        const ongoingCourses = (response.ongoingCourseByDepartment || []).map(item => ({
          department: item.departmentName,
          count: item.ongoingCourseCount
        }));

        const ongoingEnrollments = (response.ongoingEnrollmentByDepartment || []).map(item => ({
          department: item.departmentName,
          count: item.ongoingEnrollmentCount
        }));

        const assessmentStatuses = (response.assessmentStatusDistribution || []).map(item => ({
          status: item.status,
          count: item.count
        }));

        const passFailRate = (response.trainingEffectivenessByDepartment || []).map(item => ({
          department: item.departmentName,
          pass: item.passCount,
          fail: item.failCount
        }));

        setAnalyticsData({
          ongoingCourses,
          ongoingEnrollments,
          assessmentStatuses,
          passFailRate
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
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
    'ON_GOING': '#17a2b8',
    'SIGNATURE_PENDING': '#ffc107',
    'DRAFT': '#ffc107',
    'READY_TO_SUBMIT': '#007bff',
    'SUBMITTED': '#0d6efd',
    'APPROVED': '#28a745',
    'REJECTED': '#dc3545',
    'CANCELLED': '#6c757d'
  };

  // Format status name for display
  const formatStatusName = (status) => {
    const statusMap = {
      'NOT_STARTED': 'Not Started',
      'ON_GOING': 'Ongoing',
      'SIGNATURE_PENDING': 'Signature Pending',
      'DRAFT': 'Draft',
      'READY_TO_SUBMIT': 'Ready to Submit',
      'SUBMITTED': 'Submitted',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
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
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white border-0">
                    <h5 className="mb-0 text-white d-flex align-items-center">
                      <BarChartIcon className="me-2" size={20} />
                      Ongoing Courses
                    </h5>
                  </Card.Header>
                  <Card.Body style={{ padding: '20px' }}>
                    <ResponsiveContainer width="100%" height={560}>
                      <BarChart data={analyticsData.ongoingCourses} margin={{ top: 20, right: 30, left: 20, bottom: 160 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="department" 
                          angle={-45}
                          textAnchor="end"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          height={150}
                        />
                        <YAxis width={60} />
                        <Tooltip 
                          formatter={(value) => [value, 'Count']}
                          labelFormatter={(label) => `Department: ${label}`}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          wrapperStyle={{ paddingTop: '10px' }}
                        />
                        <Bar dataKey="count" fill="#1b3c53" name="Number of Courses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>

              {/* Chart 2: Ongoing Enrollments by Department */}
              <Col lg={6} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white border-0">
                    <h5 className="mb-0 text-white d-flex align-items-center">
                      <BarChartIcon className="me-2" size={20} />
                      Ongoing Trainees
                    </h5>
                  </Card.Header>
                  <Card.Body style={{ padding: '20px' }}>
                    <ResponsiveContainer width="100%" height={560}>
                      <BarChart data={analyticsData.ongoingEnrollments} margin={{ top: 20, right: 30, left: 20, bottom: 160 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="department" 
                          angle={-45}
                          textAnchor="end"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          height={150}
                        />
                        <YAxis width={60} />
                        <Tooltip 
                          formatter={(value) => [value, 'Count']}
                          labelFormatter={(label) => `Department: ${label}`}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          wrapperStyle={{ paddingTop: '10px' }}
                        />
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
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white border-0">
                    <h5 className="mb-0 text-white d-flex align-items-center">
                      <PieChartIcon className="me-2" size={20} />
                      Assessment Results
                    </h5>
                  </Card.Header>
                  <Card.Body style={{ padding: '20px' }}>
                    <ResponsiveContainer width="100%" height={520}>
                      <PieChart>
                        <Pie
                          data={analyticsData.assessmentStatuses}
                          cx="50%"
                          cy="45%"
                          labelLine={false}
                          label={({ status, percent }) => {
                            // Only show label if percentage is significant (> 3%)
                            if (percent < 0.03) return '';
                            return `${formatStatusName(status)}: ${(percent * 100).toFixed(0)}%`;
                          }}
                          outerRadius={180}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="status"
                        >
                          {analyticsData.assessmentStatuses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [value, formatStatusName(name)]}
                        />
                        <Legend 
                          formatter={(value) => formatStatusName(value)}
                          verticalAlign="bottom"
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>

              {/* Chart 4: Pass/Fail Rate by Department */}
              <Col lg={6} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-primary text-white border-0">
                    <h5 className="mb-0 text-white d-flex align-items-center">
                      <BarChartIcon className="me-2" size={20} />
                      Training Effectiveness (Pass/Fail Rate)
                    </h5>
                  </Card.Header>
                  <Card.Body style={{ padding: '20px' }}>
                    <ResponsiveContainer width="100%" height={560}>
                      <BarChart data={analyticsData.passFailRate} margin={{ top: 20, right: 30, left: 20, bottom: 160 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="department" 
                          angle={-45}
                          textAnchor="end"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          height={150}
                        />
                        <YAxis width={60} />
                        <Tooltip 
                          formatter={(value, name) => [value, name === 'pass' ? 'Pass' : 'Fail']}
                          labelFormatter={(label) => `Department: ${label}`}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          wrapperStyle={{ paddingTop: '10px' }}
                        />
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
