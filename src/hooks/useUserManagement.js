import { useState, useEffect } from 'react';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data initialization
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in production this would come from API
        const mockUsers = [
          {
            id: 1,
            eid: 'EMP001',
            fullName: 'John Doe',
            role: 'ADMIN',
            department: 'IT',
            status: 'Active',
            email: 'john@example.com',
            phone: '+84 123 456 789',
            createdAt: '2023-01-01',
            lastLogin: '2023-12-01T08:30:00'
          },
          {
            id: 2,
            eid: 'EMP002',
            fullName: 'Jane Smith',
            role: 'ACADEMIC_DEPT',
            department: 'Training',
            status: 'Active',
            email: 'jane@example.com',
            phone: '+84 123 456 790',
            createdAt: '2023-02-15',
            lastLogin: '2023-12-01T09:15:00'
          },
          {
            id: 3,
            eid: 'EMP003',
            fullName: 'Mike Johnson',
            role: 'TRAINER',
            department: 'Flight Operations',
            status: 'Active',
            email: 'mike@example.com',
            phone: '+84 123 456 791',
            createdAt: '2023-03-20',
            lastLogin: '2023-11-30T14:20:00'
          },
          {
            id: 4,
            eid: 'EMP004',
            fullName: 'Sarah Wilson',
            role: 'TRAINEE',
            department: 'Cabin Crew',
            status: 'Active',
            email: 'sarah@example.com',
            phone: '+84 123 456 792',
            createdAt: '2023-04-10',
            lastLogin: '2023-11-29T11:45:00'
          },
          {
            id: 5,
            eid: 'EMP005',
            fullName: 'David Brown',
            role: 'DEPT_HEAD',
            department: 'Engineering',
            status: 'Active',
            email: 'david@example.com',
            phone: '+84 123 456 793',
            createdAt: '2023-05-05',
            lastLogin: '2023-11-30T16:30:00'
          },
          {
            id: 6,
            eid: 'EMP006',
            fullName: 'Emma Davis',
            role: 'SQA_AUDITOR',
            department: 'Quality Assurance',
            status: 'Active',
            email: 'emma@example.com',
            phone: '+84 123 456 794',
            createdAt: '2023-06-15',
            lastLogin: '2023-12-01T10:20:00'
          }
        ];

        setUsers(mockUsers);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handlers
  const handleSearch = (term) => setSearchTerm(term);
  const handleRoleFilter = (role) => setRoleFilter(role);
  const handleDepartmentFilter = (dept) => setDepartmentFilter(dept);
  
  const handleView = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setModalShow(true);
  };

  const handleEdit = async (user) => {
    try {
      setLoading(true);
      // Simulating API call to get user details
      await new Promise(resolve => setTimeout(resolve, 500));
      setSelectedUser(user);
      setModalMode('edit');
      setModalShow(true);
      setError(null);
    } catch (err) {
      setError('Failed to load user details.');
      console.error('Error loading user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setModalMode('add');
    setModalShow(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setError(null);
    } catch (err) {
      setError('Failed to delete user.');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (userData) => {
    setLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (modalMode === 'add') {
        const newUser = {
          ...userData,
          id: Math.max(...users.map(u => u.id)) + 1,
          eid: `EMP${String(Math.max(...users.map(u => parseInt(u.eid.replace('EMP', '')))) + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'Active'
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
      } else {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, ...userData, status: userData.status || user.status }
              : user
          )
        );
      }
      
      setModalShow(false);
      setSelectedUser(null);
      setError(null);
    } catch (err) {
      setError('Failed to save user.');
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async (file) => {
    setLoading(true);
    try {
      // Simulating file processing and API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would parse the file and send to API
      const mockImportedUsers = [
        {
          id: users.length + 1,
          eid: `EMP${String(users.length + 1).padStart(3, '0')}`,
          fullName: 'Imported User 1',
          role: 'TRAINEE',
          department: 'Flight Operations',
          status: 'Active',
          email: 'imported1@example.com',
          phone: '+84 123 456 795',
          createdAt: new Date().toISOString().split('T')[0]
        },
        {
          id: users.length + 2,
          eid: `EMP${String(users.length + 2).padStart(3, '0')}`,
          fullName: 'Imported User 2',
          role: 'TRAINER',
          department: 'Cabin Crew',
          status: 'Active',
          email: 'imported2@example.com',
          phone: '+84 123 456 796',
          createdAt: new Date().toISOString().split('T')[0]
        }
      ];
      
      setUsers(prevUsers => [...prevUsers, ...mockImportedUsers]);
      setError(null);
    } catch (err) {
      setError('Failed to import users.');
      console.error('Error importing users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const uniqueRoles = [...new Set(users.map(user => user.role))];
  const uniqueDepartments = [...new Set(users.map(user => user.department))];

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesDepartment = !departmentFilter || user.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  return {
    // State
    users: filteredUsers,
    loading,
    error,
    searchTerm,
    roleFilter,
    departmentFilter,
    uniqueRoles,
    uniqueDepartments,
    modalShow,
    selectedUser,
    modalMode,
    
    // Handlers
    handleSearch,
    handleRoleFilter,
    handleDepartmentFilter,
    handleView,
    handleEdit,
    handleAdd,
    handleDelete,
    handleSave,
    handleBulkImport,
    handleModalClose: () => setModalShow(false),
    setError
  };
};
