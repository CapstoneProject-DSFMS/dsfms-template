import { useState, useEffect } from 'react';
import { userAPI } from '../api';

export const useUserManagementAPI = () => {
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
          limit: 100
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
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Remove searchTerm dependency since API doesn't support search

  // Get unique roles and departments from current users
  const uniqueRoles = [...new Set(users.map(user => user.role).filter(Boolean))];
  const uniqueDepartments = [...new Set(users.map(user => user.department).filter(Boolean))];

  // Filter users based on search term and selected filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRoles = selectedRoles.length === 0 || selectedRoles.includes(user.role);
    const matchesDepartments = selectedDepartments.length === 0 || selectedDepartments.includes(user.department);
    
    return matchesSearch && matchesRoles && matchesDepartments;
  });

  // Handlers
  const handleSearch = (term) => setSearchTerm(term);
  
  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };
  
  const handleDepartmentToggle = (department) => {
    setSelectedDepartments(prev => 
      prev.includes(department) 
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };
  
  const handleClearFilters = () => {
    setSelectedRoles([]);
    setSelectedDepartments([]);
    setSearchTerm('');
  };
  
  const handleView = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setModalShow(true);
  };
  
  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setModalShow(true);
  };
  
  const handleAdd = () => {
    setSelectedUser(null);
    setModalMode('add');
    setModalShow(true);
  };
  
  const handleDisable = async (user) => {
    try {
      setLoading(true);
      // Call API to disable user
      await userAPI.updateUser(user.id, { status: 'DISABLED' });
      // Refresh users list
      const response = await userAPI.getUsers({ page: 1, limit: 100 });
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
      setError(err.message || 'Failed to disable user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async (userData) => {
    try {
      setLoading(true);
      if (modalMode === 'add') {
        await userAPI.createUser(userData);
      } else if (modalMode === 'edit') {
        await userAPI.updateUser(selectedUser.id, userData);
      }
      setModalShow(false);
      // Refresh users list
      const response = await userAPI.getUsers({ page: 1, limit: 100 });
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
      setError(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBulkImport = async (file) => {
    try {
      setLoading(true);
      await userAPI.bulkImportUsers(file);
      // Refresh users list
      const response = await userAPI.getUsers({ page: 1, limit: 100 });
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
      setError(err.message || 'Failed to import users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleModalClose = () => {
    setModalShow(false);
    setSelectedUser(null);
  };

  return {
    users: filteredUsers,
    searchTerm,
    selectedRoles,
    selectedDepartments,
    uniqueRoles,
    uniqueDepartments,
    modalShow,
    selectedUser,
    modalMode,
    loading,
    error,
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
    handleModalClose,
    setError
  };
};
