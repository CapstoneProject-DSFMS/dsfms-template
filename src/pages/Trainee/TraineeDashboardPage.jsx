import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Person, Book, ClipboardCheck, ExclamationTriangle, ArrowRight, BarChart as BarChartIcon, PieChart as PieChartIcon } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import dashboardAPI from '../../api/dashboard';
import { toast } from 'react-toastify';
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

const TraineeDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    assessmentProgress: null,
    ongoingTraining: null,
    assessmentRatios: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await dashboardAPI.getTraineeOverview();
        setDashboardData({
          assessmentProgress: response.assessmentProgress || null,
          ongoingTraining: response.ongoingTraining || null,
          assessmentRatios: response.assessmentRatios || null
        });
      } catch (error) {
        console.error('Error fetching trainee dashboard data:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Academic Details',
      description: 'Track your learning progress and achievements',
      icon: Person,
      path: ROUTES.TRAINEE_ACADEMIC_DETAILS,
      color: 'primary'
    },
    {
      title: 'Your Courses',
      description: 'Check your enrolled courses and progress',
      icon: Book,
      path: ROUTES.COURSES_ENROLLED,
      color: 'success'
    },
    {
      title: 'All Assessments',
      description: 'View pending assessments and tasks',
      icon: ClipboardCheck,
      path: ROUTES.ASSESSMENTS_MY_ASSESSMENTS,
      color: 'warning'
    },
    {
      title: 'Create Issue Report',
      description: 'Report issues or provide feedback',
      icon: ExclamationTriangle,
      path: ROUTES.REPORTS_CREATE,
      color: 'danger'
    }
  ];

  // Calculate completion percentage
  const completionPercentage = dashboardData.assessmentProgress 
    ? Math.round(dashboardData.assessmentProgress.completionRate * 100) 
    : 0;

  // Prepare data for charts
  const ongoingTrainingData = dashboardData.ongoingTraining ? [
    { name: 'Courses', value: dashboardData.ongoingTraining.ongoingCourses },
    { name: 'Subjects', value: dashboardData.ongoingTraining.ongoingSubjects }
  ] : [];

  const assessmentRatiosData = dashboardData.assessmentRatios ? [
    { name: 'Pass', value: dashboardData.assessmentRatios.passCount, ratio: dashboardData.assessmentRatios.passRatio },
    { name: 'Fail', value: dashboardData.assessmentRatios.failCount, ratio: dashboardData.assessmentRatios.failRatio }
  ] : [];

  const COLORS = ['#28a745', '#dc3545'];

  return (
    <Container fluid className="py-3 py-md-4 px-3 px-md-4">
      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white border-0">
              <h5 className="mb-0 text-white">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row className="align-items-stretch">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Col xs={12} sm={6} lg={6} xl={3} className="mb-3 mb-xl-0 d-flex" key={index}>
                      <Card 
                        className="h-100 w-100 border-0 shadow-sm d-flex flex-column"
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          minHeight: '150px'
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
                        <Card.Body className="p-3 p-md-4 d-flex flex-column h-100">
                          <div className="d-flex align-items-start mb-2 mb-md-3">
                            <div 
                              className={`bg-${action.color} text-white rounded-circle d-flex align-items-center justify-content-center me-2 me-md-3 flex-shrink-0`}
                              style={{ width: '40px', height: '40px' }}
                            >
                              <IconComponent size={20} />
                            </div>
                            <div className="flex-grow-1">
                              <h5 className="mb-1" style={{ fontSize: '0.95rem', lineHeight: '1.3' }}>{action.title}</h5>
                            </div>
                            <ArrowRight size={18} className="text-muted flex-shrink-0 d-none d-sm-block" />
                          </div>
                          <p className="text-muted mb-0 mt-auto" style={{ fontSize: '0.8125rem', lineHeight: '1.4' }}>{action.description}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <Row>
          <Col>
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading dashboard data...</p>
            </div>
          </Col>
        </Row>
      ) : (
        <>
          {/* Assessment Progress and Ongoing Training */}
          <Row className="mb-4">
            <Col xs={12} md={6} lg={6} className="mb-3 mb-md-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white border-0">
                  <h5 className="mb-0 text-white" style={{ fontSize: '1rem' }}>Training Progress</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
                  <div className="text-center py-3 py-md-4">
                    <div className="mb-2 mb-md-3">
                      <div className="display-4 text-primary fw-bold" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>{completionPercentage}%</div>
                      <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Overall Progress</p>
                </div>
                    <div className="progress mb-3" style={{ height: '20px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                        style={{ width: `${completionPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={completionPercentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {completionPercentage}%
                      </div>
                </div>
                    {dashboardData.assessmentProgress && (
                <p className="text-muted small mb-0">
                        {dashboardData.assessmentProgress.approvedCount} of {dashboardData.assessmentProgress.totalAssigned} assessments completed
                </p>
                    )}
              </div>
            </Card.Body>
          </Card>
        </Col>

            <Col xs={12} md={6} lg={6} className="mb-3 mb-md-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white border-0">
                  <h5 className="mb-0 text-white d-flex align-items-center" style={{ fontSize: '1rem' }}>
                    <BarChartIcon className="me-2" size={18} />
                    Ongoing Training
                  </h5>
                </Card.Header>
                <Card.Body style={{ padding: '15px' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ongoingTrainingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1b3c53" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Assessment Ratios */}
          <Row className="mb-4">
            <Col xs={12} md={6} lg={6} className="mb-3 mb-md-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white border-0">
                  <h5 className="mb-0 text-white d-flex align-items-center" style={{ fontSize: '1rem' }}>
                    <PieChartIcon className="me-2" size={18} />
                    Assessment Results
                  </h5>
                </Card.Header>
                <Card.Body style={{ padding: '15px' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={assessmentRatiosData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, ratio }) => `${name}: ${(ratio * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {assessmentRatiosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={6} lg={6} className="mb-3 mb-md-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white border-0">
                  <h5 className="mb-0 text-white" style={{ fontSize: '1rem' }}>Assessments Required Confirmations</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
                  <div className="text-center py-3 py-md-4">
                    {dashboardData.assessmentProgress && dashboardData.assessmentProgress.totalAssigned > 0 ? (
                      <>
                        <div className="mb-2 mb-md-3">
                          <div className="display-4 text-primary fw-bold" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                            {dashboardData.assessmentProgress.approvedCount}
                          </div>
                          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>of {dashboardData.assessmentProgress.totalAssigned} assessments completed</p>
                        </div>
                        <p className="text-muted small mb-3">
                          {dashboardData.assessmentProgress.totalAssigned - dashboardData.assessmentProgress.approvedCount} assessments pending
                        </p>
                      </>
                    ) : (
                      <>
                <ClipboardCheck size={48} className="text-muted mb-3" />
                <h6 className="text-muted">No assessments pending</h6>
                <p className="text-muted small mb-3">
                  View and complete signature required assessments.
                </p>
                      </>
                    )}
                <Button 
                  variant="outline-primary" 
                  size="sm"
                      onClick={() => navigate(ROUTES.ASSESSMENTS_MY_ASSESSMENTS)}
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
        </>
      )}
    </Container>
  );
};

export default TraineeDashboardPage;
