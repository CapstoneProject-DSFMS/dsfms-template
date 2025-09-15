import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { MainLayout } from '../../components/Layout';
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
import { PermissionWrapper, RoleSwitcher } from '../../components/Common';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userDepartmentFilter, setUserDepartmentFilter] = useState('');
  const [userModalShow, setUserModalShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalMode, setUserModalMode] = useState('view'); // 'view', 'edit', 'add'
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  // Role Management State
  const [roles, setRoles] = useState([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [roleModalShow, setRoleModalShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleModalMode, setRoleModalMode] = useState('view'); // 'view', 'edit', 'add'
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState(null);

  // Mock data initialization
  useEffect(() => {
    // Initialize with mock data
    setUsers([
      {
        id: 1,
        eid: 'EMP001',
        fullName: 'John Doe',
        role: 'Admin',
        department: 'IT',
        status: 'Active',
        email: 'john.doe@company.com',
        phone: '+1-555-0123'
      },
      {
        id: 2,
        eid: 'EMP002',
        fullName: 'Jane Smith',
        role: 'Trainee',
        department: 'HR',
        status: 'Active',
        email: 'jane.smith@company.com',
        phone: '+1-555-0124'
      },
      {
        id: 3,
        eid: 'EMP003',
        fullName: 'Bob Johnson',
        role: 'Trainer',
        department: 'Finance',
        status: 'Inactive',
        email: 'bob.johnson@company.com',
        phone: '+1-555-0125'
      }
    ]);

    setRoles([
      {
        id: 1,
        name: 'Admin',
        assignedUsers: 5,
        status: 'Active',
        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles']
      },
      {
        id: 2,
        name: 'Trainee',
        assignedUsers: 12,
        status: 'Active',
        permissions: ['read', 'write']
      },
      {
        id: 3,
        name: 'Trainer',
        assignedUsers: 45,
        status: 'Active',
        permissions: ['read', 'write']
      },
  
    ]);
  }, []);

  // User Management Handlers
  const handleUserSearch = (searchTerm) => {
    setUserSearchTerm(searchTerm);
  };

  const handleUserRoleFilter = (role) => {
    setUserRoleFilter(role);
  };

  const handleUserDepartmentFilter = (department) => {
    setUserDepartmentFilter(department);
  };

  const handleUserView = (user) => {
    setSelectedUser(user);
    setUserModalMode('view');
    setUserModalShow(true);
  };

  const handleUserEdit = (user) => {
    setSelectedUser(user);
    setUserModalMode('edit');
    setUserModalShow(true);
  };

  const handleUserAdd = () => {
    setSelectedUser(null);
    setUserModalMode('add');
    setUserModalShow(true);
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUserLoading(true);
      try {
        // API call would go here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setUsers(users.filter(user => user.id !== userId));
        setUserError(null);
      } catch (error) {
        setUserError('Failed to delete user');
      } finally {
        setUserLoading(false);
      }
    }
  };

  const handleUserSave = async (userData) => {
    setUserLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (userModalMode === 'add') {
        const newUser = {
          ...userData,
          id: Math.max(...users.map(u => u.id)) + 1,
          eid: `EMP${String(Math.max(...users.map(u => parseInt(u.eid.replace('EMP', '')))) + 1).padStart(3, '0')}`
        };
        setUsers([...users, newUser]);
      } else {
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { ...user, ...userData } : user
        ));
      }
      
      setUserModalShow(false);
      setSelectedUser(null);
      setUserError(null);
    } catch (error) {
      setUserError('Failed to save user');
    } finally {
      setUserLoading(false);
    }
  };

  const handleBulkImport = async (file) => {
    setUserLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock bulk import - in real app, this would parse the file
      const newUsers = [
        {
          id: users.length + 1,
          eid: `EMP${String(users.length + 1).padStart(3, '0')}`,
          fullName: 'Imported User 1',
          role: 'Employee',
          department: 'IT',
          status: 'Active',
          email: 'imported1@company.com',
          phone: '+1-555-0001'
        },
        {
          id: users.length + 2,
          eid: `EMP${String(users.length + 2).padStart(3, '0')}`,
          fullName: 'Imported User 2',
          role: 'Employee',
          department: 'HR',
          status: 'Active',
          email: 'imported2@company.com',
          phone: '+1-555-0002'
        }
      ];
      
      setUsers([...users, ...newUsers]);
      setUserError(null);
    } catch (error) {
      setUserError('Failed to import users');
    } finally {
      setUserLoading(false);
    }
  };

  // Role Management Handlers
  const handleRoleSearch = (searchTerm) => {
    setRoleSearchTerm(searchTerm);
  };

  const handleRoleView = (role) => {
    setSelectedRole(role);
    setRoleModalMode('view');
    setRoleModalShow(true);
  };

  const handleRoleEdit = (role) => {
    setSelectedRole(role);
    setRoleModalMode('edit');
    setRoleModalShow(true);
  };

  const handleRoleAdd = () => {
    setSelectedRole(null);
    setRoleModalMode('add');
    setRoleModalShow(true);
  };

  const handleRoleDelete = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoleLoading(true);
      try {
        // API call would go here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setRoles(roles.filter(role => role.id !== roleId));
        setRoleError(null);
      } catch (error) {
        setRoleError('Failed to delete role');
      } finally {
        setRoleLoading(false);
      }
    }
  };

  const handleRoleSave = async (roleData) => {
    setRoleLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (roleModalMode === 'add') {
        const newRole = {
          ...roleData,
          id: Math.max(...roles.map(r => r.id)) + 1,
          assignedUsers: 0
        };
        setRoles([...roles, newRole]);
      } else {
        setRoles(roles.map(role => 
          role.id === selectedRole.id ? { ...role, ...roleData } : role
        ));
      }
      
      setRoleModalShow(false);
      setSelectedRole(null);
      setRoleError(null);
    } catch (error) {
      setRoleError('Failed to save role');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDisableRole = async (roleId) => {
    setRoleLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setRoles(roles.map(role => 
        role.id === roleId ? { ...role, status: 'Inactive' } : role
      ));
      setRoleError(null);
    } catch (error) {
      setRoleError('Failed to disable role');
    } finally {
      setRoleLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.eid.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = !userRoleFilter || user.role === userRoleFilter;
    const matchesDepartment = !userDepartmentFilter || user.department === userDepartmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  // Filter roles based on search
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  // Get unique values for filters
  const uniqueRoles = [...new Set(users.map(user => user.role))];
  const uniqueDepartments = [...new Set(users.map(user => user.department))];

  // Mock data for charts
  const userStats = [
    { month: 'Jan', active: 40, inactive: 24 },
    { month: 'Feb', active: 30, inactive: 13 },
    { month: 'Mar', active: 20, inactive: 18 },
    { month: 'Apr', active: 27, inactive: 15 },
    { month: 'May', active: 18, inactive: 12 },
    { month: 'Jun', active: 23, inactive: 19 },
  ];

  const roleDistribution = [
    { name: 'Admin', value: 5 },
    { name: 'Trainer', value: 15 },
    { name: 'Trainee', value: 40 },
    { name: 'Manager', value: 10 },
  ];

  const departmentStats = [
    { name: 'IT', users: 25, courses: 15 },
    { name: 'HR', users: 15, courses: 8 },
    { name: 'Finance', users: 20, courses: 12 },
    { name: 'Operations', users: 30, courses: 20 },
  ];

  return (
    <MainLayout>
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="text-primary-custom mb-0">Aviation Training Management System</h1>
              <RoleSwitcher />
            </div>
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
    </MainLayout>
  );
};

export default Dashboard;