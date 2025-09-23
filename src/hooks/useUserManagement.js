import { useState, useEffect } from 'react';
import { userAPI } from '../api';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getUsers({
          page: 1,
          limit: 100,
          search: searchTerm
        });
        
        // Transform API data to match component format
        const transformedUsers = response.data.map(user => ({
          id: user.id,
          eid: user.eid,
          fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          role: user.role?.name || 'N/A',
          department: user.department?.name || 'N/A',
          status: user.status,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          certificationNumber: user.certificationNumber || '',
          specialization: user.specialization || '',
          yearsOfExperience: user.yearsOfExperience || '',
          dateOfBirth: user.dateOfBirth || '',
          trainingBatch: user.trainingBatch || '',
          passportNo: user.passportNo || '',
          nation: user.nation || '',
          createdAt: user.createdAt,
          lastLogin: user.lastLogin || ''
        }));
        
        setUsers(transformedUsers);
      } catch (err) {
        setError(err.message || 'Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm]);

  // Mock data for unique roles and departments (can be replaced with API calls later)
  const mockUsers = [
          {
            id: 1,
            eid: 'EMP001',
            fullName: 'John Doe',
            firstName: 'John',
            middleName: '',
            lastName: 'Doe',
            role: 'ADMIN',
            department: 'IT',
            status: 'Active',
            email: 'john@example.com',
            phoneNumber: '+84 123 456 789',
            address: '123 Main Street, Ho Chi Minh City',
            certificationNumber: 'CERT001',
            specialization: 'Software Development',
            yearsOfExperience: '5',
            dateOfBirth: '1990-01-15',
            trainingBatch: 'BATCH2023-01',
            passportNo: 'P123456789',
            nation: 'Vietnam',
            createdAt: '2023-01-01',
            lastLogin: '2023-12-01T08:30:00'
          },
          {
            id: 2,
            eid: 'EMP002',
            fullName: 'Jane Smith',
            firstName: 'Jane',
            middleName: '',
            lastName: 'Smith',
            role: 'DEPT_HEAD',
            department: 'HR',
            status: 'Active',
            email: 'jane@example.com',
            phoneNumber: '+84 123 456 790',
            address: '456 Oak Avenue, Hanoi',
            certificationNumber: 'CERT002',
            specialization: 'Human Resources',
            yearsOfExperience: '8',
            dateOfBirth: '1985-05-20',
            trainingBatch: 'BATCH2023-02',
            passportNo: 'P987654321',
            nation: 'Vietnam',
            createdAt: '2023-02-15',
            lastLogin: '2023-12-01T09:15:00'
          },
          {
            id: 3,
            eid: 'EMP003',
            fullName: 'Mike Johnson',
            firstName: 'Mike',
            middleName: 'David',
            lastName: 'Johnson',
            role: 'TRAINER',
            department: 'Flight Operations',
            status: 'Active',
            email: 'mike@example.com',
            phoneNumber: '+84 123 456 791',
            address: '789 Pine Road, Da Nang',
            certificationNumber: 'CERT003',
            specialization: 'Flight Training',
            yearsOfExperience: '12',
            dateOfBirth: '1980-08-10',
            trainingBatch: 'BATCH2023-03',
            passportNo: 'P456789123',
            nation: 'United States',
            createdAt: '2023-03-20',
            lastLogin: '2023-11-30T14:20:00'
          },
          {
            id: 4,
            eid: 'EMP004',
            fullName: 'Sarah Wilson',
            role: 'Employee',
            department: 'Marketing',
            status: 'Active',
            email: 'sarah@example.com',
            phone: '+84 123 456 792',
            address: '321 Elm Street, Can Tho',
            gender: 'Female',
            createdAt: '2023-04-10',
            lastLogin: '2023-11-29T11:45:00'
          },
          {
            id: 5,
            eid: 'EMP005',
            fullName: 'David Brown',
            role: 'Manager',
            department: 'Operations',
            status: 'Active',
            email: 'david@example.com',
            phone: '+84 123 456 793',
            address: '654 Maple Lane, Hai Phong',
            gender: 'Male',
            createdAt: '2023-05-05',
            lastLogin: '2023-11-30T16:30:00'
          },
          {
            id: 6,
            eid: 'EMP006',
            fullName: 'Emma Davis',
            role: 'Employee',
            department: 'Sales',
            status: 'Active',
            email: 'emma@example.com',
            phone: '+84 123 456 794',
            address: '987 Cedar Court, Nha Trang',
            gender: 'Female',
            createdAt: '2023-06-15',
            lastLogin: '2023-12-01T10:20:00'
          },
          {
            id: 7,
            eid: 'EMP007',
            fullName: 'Olivia Wilson',
            role: 'SQA_AUDITOR',
            department: 'Quality Assurance',
            status: 'Active',
            email: 'olivia@example.com',
            phone: '+84 123 456 794',
            createdAt: '2023-06-15',
            lastLogin: '2023-12-01T10:20:00'
          },
          {
            id: 8,
            eid: 'EMP008',
            fullName: 'Robert Taylor',
            role: 'TRAINER',
            department: 'Flight Operations',
            status: 'Active',
            email: 'robert@example.com',
            phone: '+84 123 456 795',
            createdAt: '2023-07-01',
            lastLogin: '2023-11-30T15:45:00'
          },
          {
            id: 9,
            eid: 'EMP009',
            fullName: 'Lisa Anderson',
            role: 'TRAINEE',
            department: 'Cabin Crew',
            status: 'Active',
            email: 'lisa@example.com',
            phone: '+84 123 456 796',
            createdAt: '2023-07-15',
            lastLogin: '2023-11-29T09:30:00'
          },
          {
            id: 10,
            eid: 'EMP010',
            fullName: 'Michael Brown',
            role: 'DEPT_HEAD',
            department: 'Engineering',
            status: 'Active',
            email: 'michael@example.com',
            phone: '+84 123 456 797',
            createdAt: '2023-08-01',
            lastLogin: '2023-12-01T11:15:00'
          },
          {
            id: 11,
            eid: 'EMP011',
            fullName: 'Jennifer Davis',
            role: 'ACADEMIC_DEPT',
            department: 'Training',
            status: 'Active',
            email: 'jennifer@example.com',
            phone: '+84 123 456 798',
            createdAt: '2023-08-15',
            lastLogin: '2023-11-30T13:20:00'
          },
          {
            id: 12,
            eid: 'EMP012',
            fullName: 'Christopher Wilson',
            role: 'SQA_AUDITOR',
            department: 'Quality Assurance',
            status: 'Active',
            email: 'christopher@example.com',
            phone: '+84 123 456 799',
            createdAt: '2023-09-01',
            lastLogin: '2023-12-01T14:30:00'
          },
          {
            id: 13,
            eid: 'EMP013',
            fullName: 'Alex Thompson',
            role: 'TRAINER',
            department: 'Flight Operations',
            status: 'Disabled',
            email: 'alex@example.com',
            phone: '+84 123 456 800',
            createdAt: '2023-09-15',
            lastLogin: '2023-11-15T10:30:00'
          },
          {
            id: 14,
            eid: 'EMP014',
            fullName: 'Maria Garcia',
            role: 'TRAINEE',
            department: 'Cabin Crew',
            status: 'Disabled',
            email: 'maria@example.com',
            phone: '+84 123 456 801',
            createdAt: '2023-10-01',
            lastLogin: '2023-11-10T14:20:00'
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
  
  const handleRoleToggle = (role) => {
    if (role === 'clear') {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(prev => 
        prev.includes(role) 
          ? prev.filter(r => r !== role)
          : [...prev, role]
      );
    }
  };

  const handleDepartmentToggle = (dept) => {
    if (dept === 'clear') {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments(prev => 
        prev.includes(dept) 
          ? prev.filter(d => d !== dept)
          : [...prev, dept]
      );
    }
  };

  const handleClearFilters = () => {
    setSelectedRoles([]);
    setSelectedDepartments([]);
  };
  
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

  const handleDisable = async (user) => {
    setLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id 
            ? { ...u, status: newStatus }
            : u
        )
      );
      setError(null);
    } catch (err) {
      setError(`Failed to ${user.status === 'Active' ? 'disable' : 'enable'} user.`);
      console.error('Error updating user status:', err);
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
          status: 'Active',
          lastLogin: null
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

  const handleBulkImport = async (usersToImport) => {
    setLoading(true);
    try {
      // Simulating API call to backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Transform imported users to match our data structure
      const newUsers = usersToImport.map((userData, index) => {
        const newId = Math.max(...users.map(u => u.id)) + index + 1;
        return {
          id: newId,
          eid: `EMP${String(newId).padStart(3, '0')}`,
          fullName: `${userData.firstName} ${userData.middleName ? userData.middleName + ' ' : ''}${userData.lastName}`.trim(),
          firstName: userData.firstName,
          middleName: userData.middleName,
          lastName: userData.lastName,
          address: userData.address,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          certificationNumber: userData.certificationNumber,
          specialization: userData.specialization,
          yearsOfExperience: userData.yearsOfExperience,
          dateOfBirth: userData.dateOfBirth,
          trainingBatch: userData.trainingBatch,
          passportNo: userData.passportNo,
          nation: userData.nation,
          department: userData.department,
          status: 'Active',
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: null
        };
      });
      
      setUsers(prevUsers => [...prevUsers, ...newUsers]);
      setError(null);
    } catch (err) {
      setError('Failed to import users.');
      console.error('Error importing users:', err);
      throw err; // Re-throw to let the modal handle the error
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
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(user.role);
    const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.includes(user.department);
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  return {
    // State
    users: filteredUsers,
    loading,
    error,
    searchTerm,
    selectedRoles,
    selectedDepartments,
    uniqueRoles,
    uniqueDepartments,
    modalShow,
    selectedUser,
    modalMode,
    
    // Handlers
    handleSearch,
    handleRoleToggle,
    handleDepartmentToggle,
    handleClearFilters,
    handleView,
    handleEdit,
    handleAdd,
    handleDisable,
    handleSave,
    handleBulkImport,
    handleModalClose: () => setModalShow(false),
    setError
  };
};
