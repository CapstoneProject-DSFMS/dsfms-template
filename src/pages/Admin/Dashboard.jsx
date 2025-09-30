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
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS_BY_UC } from '../../constants/permissions';
import { PermissionWrapper } from '../../components/Common';
import { useDashboard } from '../../hooks/useDashboard';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const {
    userStats,
    roleDistribution,
    departmentStats,
    userError,
    roleError,
    setUserError,
    setRoleError
  } = useDashboard();

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
          </Col>
          <Col lg={4} md={12}>
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
          </Col>
        </Row>

        <Row>
          <Col>
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
          </Col>
        </Row>

        {/* Error toasts are handled by useEffect hooks */}
    </Container>
  );
};

export default Dashboard;