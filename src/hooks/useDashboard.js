import { useState, useEffect } from 'react';

export const useDashboard = () => {
  // User Management State
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userDepartmentFilter, setUserDepartmentFilter] = useState('');
  const [userModalShow, setUserModalShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalMode, setUserModalMode] = useState('view');
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  // Role Management State
  const [roles, setRoles] = useState([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [roleModalShow, setRoleModalShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleModalMode, setRoleModalMode] = useState('view');
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
      }
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
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  return {
    // User Management
    users: filteredUsers,
    userSearchTerm,
    userRoleFilter,
    userDepartmentFilter,
    uniqueRoles,
    uniqueDepartments,
    userModalShow,
    selectedUser,
    userModalMode,
    userLoading,
    userError,
    handleUserSearch,
    handleUserRoleFilter,
    handleUserDepartmentFilter,
    handleUserView,
    handleUserEdit,
    handleUserAdd,
    handleUserDelete,
    handleUserSave,
    handleBulkImport,
    setUserError,

    // Role Management
    roles: filteredRoles,
    roleSearchTerm,
    roleModalShow,
    selectedRole,
    roleModalMode,
    roleLoading,
    roleError,
    handleRoleSearch,
    handleRoleView,
    handleRoleEdit,
    handleRoleAdd,
    handleRoleDelete,
    handleRoleSave,
    handleDisableRole,
    setRoleError,

    // Chart Data
    userStats,
    roleDistribution,
    departmentStats
  };
};
