import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../constants/permissions';
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

  return (
    <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <h1 className="text-primary-custom mb-0">Aviation Training Management System</h1>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={8}>
            <Card>
              <Card.Header>User Activity Trends</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
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
          <Col md={4}>
            <Card>
              <Card.Header>Role Distribution</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
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
            <Card>
              <Card.Header>Department Statistics</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
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

        {userError && (
          <Row className="mt-4">
            <Col>
              <Alert variant="danger" dismissible onClose={() => setUserError(null)}>
                {userError}
              </Alert>
            </Col>
          </Row>
        )}
        
        {roleError && (
          <Row className="mt-4">
            <Col>
              <Alert variant="danger" dismissible onClose={() => setRoleError(null)}>
                {roleError}
              </Alert>
            </Col>
          </Row>
        )}
    </Container>
  );
};

export default Dashboard;