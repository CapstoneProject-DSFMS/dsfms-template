import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { PermissionWrapper, ModuleAccess } from '../../components/Common';
import { useDashboard } from '../../hooks/useDashboard';

const Dashboard = () => {
  const {
    userStats,
    roleDistribution,
    departmentStats,
    userError,
    roleError
  } = useDashboard();

  // Debug logging
  React.useEffect(() => {
    console.log('Dashboard mounted');
    console.log('User stats:', userStats);
    console.log('Role distribution:', roleDistribution);
    console.log('Department stats:', departmentStats);
  }, [userStats, roleDistribution, departmentStats]);

  // Show error toasts when error states change
  React.useEffect(() => {
    if (userError) {
      toast.error(userError);
    }
  }, [userError]);

  React.useEffect(() => {
    if (roleError) {
      toast.error(roleError);
    }
  }, [roleError]);

  return (
    <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h1 className="text-primary-custom mb-0 text-mobile-center">Aviation Training Management System</h1>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col lg={8} md={12} className="mb-3 mb-lg-0">
            <PermissionWrapper permission="GET /users">
              <Card className="dashboard-chart-mobile">
                <Card.Header>User Activity Trends</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300} className="chart-mobile-height">
                    <AreaChart data={userStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="active" stroke="#8884d8" fill="#8884d8" name="Active Users" />
                      <Area type="monotone" dataKey="inactive" stroke="#82ca9d" fill="#82ca9d" name="Inactive Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </PermissionWrapper>
          </Col>
          <Col lg={4} md={12}>
            <PermissionWrapper permission="GET /roles">
              <Card className="dashboard-chart-mobile">
                <Card.Header>Role Distribution</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300} className="chart-mobile-height">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        fill="#8884d8"
                      />
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </PermissionWrapper>
          </Col>
        </Row>

        <Row>
          <Col>
            <ModuleAccess module="DEPARTMENTS">
              <Card className="dashboard-chart-mobile">
                <Card.Header>Department Statistics</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300} className="chart-mobile-height">
                    <BarChart data={departmentStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="users" fill="#8884d8" name="Users" />
                      <Bar dataKey="courses" fill="#82ca9d" name="Courses" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </ModuleAccess>
          </Col>
        </Row>

        {/* Fallback content when no permissions */}
        <Row>
          <Col>
            <Card className="dashboard-chart-mobile">
              <Card.Header>System Status</Card.Header>
              <Card.Body>
                <p className="text-muted">Dashboard is loading. Please wait for permissions to be loaded.</p>
                <p className="text-muted">If you continue to see this message, please contact your administrator.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Error toasts are handled by useEffect hooks */}
    </Container>
  );
};

export default Dashboard;