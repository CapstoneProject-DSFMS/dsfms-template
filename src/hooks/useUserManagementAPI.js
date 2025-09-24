import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';
import { mapError } from '../utils/errorMapping';
import { toast } from 'react-toastify';

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
  
  const [confirmRoleChange, setConfirmRoleChange] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);


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
          roleId: user.role?.id || '',
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
        const errorMessage = mapError(err, { context: 'fetch_users' });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); 

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
  
  const handleView = async (user) => {
    try {
      setLoading(true);
      // Fetch fresh user data from API
      const userDetail = await userAPI.getUserById(user.id);
      // Transform the fresh data
      const transformedUser = {
        id: userDetail.id,
        eid: userDetail.eid,
        fullName: [userDetail.firstName, userDetail.middleName, userDetail.lastName].filter(Boolean).join(' '),
        firstName: userDetail.firstName,
        middleName: userDetail.middleName,
        lastName: userDetail.lastName,
        role: userDetail.role?.name || 'N/A',
        roleId: userDetail.role?.id || '',
        department: userDetail.department?.name || 'N/A',
        status: userDetail.status,
        email: userDetail.email,
        phoneNumber: userDetail.phoneNumber || '',
        address: userDetail.address || '',
        // Trainer profile fields
        certificationNumber: userDetail.trainerProfile?.certificationNumber || '',
        specialization: userDetail.trainerProfile?.specialization || '',
        yearsOfExperience: userDetail.trainerProfile?.yearsOfExp || '',
        // Trainee profile fields
        dateOfBirth: userDetail.traineeProfile?.dob ? userDetail.traineeProfile.dob.split('T')[0] : '',
        trainingBatch: userDetail.traineeProfile?.trainingBatch || '',
        passportNo: userDetail.traineeProfile?.passportNo || '',
        nation: userDetail.traineeProfile?.nation || '',
        createdAt: userDetail.createdAt,
        lastLogin: userDetail.lastLogin || ''
      };
      setSelectedUser(transformedUser);
      setModalMode('view');
      setModalShow(true);
    } catch {
      setError('Unable to load user details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = async (user) => {
    try {
      setLoading(true);
      // Fetch fresh user data from API
      const userDetail = await userAPI.getUserById(user.id);
      
      // Transform the fresh data
      const transformedUser = {
        id: userDetail.id,
        eid: userDetail.eid,
        fullName: [userDetail.firstName, userDetail.middleName, userDetail.lastName].filter(Boolean).join(' '),
        firstName: userDetail.firstName,
        middleName: userDetail.middleName,
        lastName: userDetail.lastName,
        role: userDetail.role?.name || 'N/A',
        roleId: userDetail.role?.id || '',
        department: userDetail.department?.name || 'N/A',
        status: userDetail.status,
        email: userDetail.email,
        phoneNumber: userDetail.phoneNumber || '',
        address: userDetail.address || '',
        // Trainer profile fields
        certificationNumber: userDetail.trainerProfile?.certificationNumber || '',
        specialization: userDetail.trainerProfile?.specialization || '',
        yearsOfExperience: userDetail.trainerProfile?.yearsOfExp || '',
        // Trainee profile fields
        dateOfBirth: userDetail.traineeProfile?.dob ? userDetail.traineeProfile.dob.split('T')[0] : '',
        trainingBatch: userDetail.traineeProfile?.trainingBatch || '',
        passportNo: userDetail.traineeProfile?.passportNo || '',
        nation: userDetail.traineeProfile?.nation || '',
        createdAt: userDetail.createdAt,
        lastLogin: userDetail.lastLogin || ''
      };
      
      setSelectedUser(transformedUser);
      setModalMode('edit');
      setModalShow(true);
    } catch {
      setError('Unable to load user details');
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
    try {
      setLoading(true);
      
      // Determine new status based on current status
      const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      
      // Call API to toggle user status using dynamic endpoint
      await userAPI.toggleUserStatus(user.id, newStatus);
      
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
        roleId: user.role?.id || '',
        department: user.department?.name || 'N/A',
        status: user.status,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        // Trainer profile fields
        certificationNumber: user.trainerProfile?.certificationNumber || '',
        specialization: user.trainerProfile?.specialization || '',
        yearsOfExperience: user.trainerProfile?.yearsOfExp || '',
        // Trainee profile fields
        dateOfBirth: user.traineeProfile?.dob ? user.traineeProfile.dob.split('T')[0] : '',
        trainingBatch: user.traineeProfile?.trainingBatch || '',
        passportNo: user.traineeProfile?.passportNo || '',
        nation: user.traineeProfile?.nation || '',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || ''
      }));
      setUsers(transformedUsers);
      
      // Show success message
      const action = newStatus === 'DISABLED' ? 'disabled' : 'enabled';
      toast.success(`User has been ${action} successfully!`);
      
    } catch (err) {
      const errorMessage = mapError(err, { context: 'disable_user' });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async (userData) => {
    try {
      setLoading(true);
      
      
      // Check if role is being changed in edit mode
      if (modalMode === 'edit' && selectedUser && selectedUser.role !== userData.role) {
        // Role is changing, show confirmation dialog
        setPendingUserData(userData);
        setConfirmRoleChange(true);
        setLoading(false);
        return;
      }
      
      // Proceed with save
      await performSave(userData);
    } catch {
      // Don't set error here, let performSave handle it
      setLoading(false);
    }
  };

  const performSave = async (userData) => {
    try {
      setLoading(true);
      
      
      // Get roles from API to find correct role ID
      let newRoleId = null;
      try {
        const rolesResponse = await userAPI.getRoles();
        
        const targetRole = rolesResponse.roles?.find(role => role.name === userData.role);
        if (targetRole) {
          newRoleId = targetRole.id;
        } else {
          throw new Error(`Role '${userData.role}' not found in backend`);
        }
      } catch (error) {
        throw new Error(`Failed to get role ID for '${userData.role}': ${error.message}`);
      }

          // Format data according to API payload structure
          const apiPayload = {
            firstName: userData.firstName,
            middleName: userData.middleName || '',
            lastName: userData.lastName,
            address: userData.address || '',
            email: userData.email,
            gender: 'MALE', // Default value, can be made configurable later
            avatarUrl: '', // Default empty
            phoneNumber: userData.phoneNumber || '',
            role: {
              id: newRoleId, 
              name: userData.role
            }
          };
          
      

      // Add conditional fields based on role
      if (userData.role === 'TRAINER') {
        apiPayload.trainerProfile = {
          specialization: userData.specialization || '',
          certificationNumber: userData.certificationNumber || '',
          yearsOfExp: userData.yearsOfExperience ? parseInt(userData.yearsOfExperience) : 0,
          bio: '' // Default empty, can be added to form later
        };
          } else if (userData.role === 'TRAINEE') {
            // Only add traineeProfile if we have meaningful data
            const hasTraineeData = userData.dateOfBirth || userData.trainingBatch || userData.passportNo || userData.nation;
            if (hasTraineeData) {
              apiPayload.traineeProfile = {
                dob: userData.dateOfBirth || null,
                enrollmentDate: new Date().toISOString().split('T')[0],
                trainingBatch: userData.trainingBatch || '',
                passportNo: userData.passportNo || '',
                nation: userData.nation || ''
              };
            }
          }
      

      
          if (modalMode === 'add') {
            await userAPI.createUser(apiPayload);
            toast.success('User created successfully!');
          } else if (modalMode === 'edit') {
            await userAPI.updateUser(selectedUser.id, apiPayload);
            toast.success('User updated successfully!');
          }
      setModalShow(false);
      // Refresh users list
      const response = await userAPI.getUsers({ page: 1, limit: 100 });
      
      // Check if the updated user has traineeProfile (only for edit mode)
      if (modalMode === 'edit' && selectedUser?.id) {
        const updatedUser = response.data.find(u => u.id === selectedUser.id);
        if (updatedUser) {
          // User found and updated successfully
        }
      }
      
      const transformedUsers = response.data.map(user => ({
        id: user.id,
        eid: user.eid,
        fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        role: user.role?.name || 'N/A',
        roleId: user.role?.id || '',
        department: user.department?.name || 'N/A',
        status: user.status,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        // Trainer profile fields
        certificationNumber: user.trainerProfile?.certificationNumber || '',
        specialization: user.trainerProfile?.specialization || '',
        yearsOfExperience: user.trainerProfile?.yearsOfExp || '',
        // Trainee profile fields
        dateOfBirth: user.traineeProfile?.dob ? user.traineeProfile.dob.split('T')[0] : '',
        trainingBatch: user.traineeProfile?.trainingBatch || '',
        passportNo: user.traineeProfile?.passportNo || '',
        nation: user.traineeProfile?.nation || '',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || ''
      }));
      
      setUsers(transformedUsers);
    } catch (err) {
      
      // Use error mapping to get custom error message
      const errorMessage = mapError(err, { context: 'user_management' });
      
      setError(errorMessage);
      // Re-throw the error so handleSave can catch it
      throw new Error(errorMessage);
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
        roleId: user.role?.id || '',
        department: user.department?.name || 'N/A',
        status: user.status,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        // Trainer profile fields
        certificationNumber: user.trainerProfile?.certificationNumber || '',
        specialization: user.trainerProfile?.specialization || '',
        yearsOfExperience: user.trainerProfile?.yearsOfExp || '',
        // Trainee profile fields
        dateOfBirth: user.traineeProfile?.dob ? user.traineeProfile.dob.split('T')[0] : '',
        trainingBatch: user.traineeProfile?.trainingBatch || '',
        passportNo: user.traineeProfile?.passportNo || '',
        nation: user.traineeProfile?.nation || '',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || ''
      }));
      setUsers(transformedUsers);
    } catch (err) {
      const errorMessage = mapError(err, { context: 'import_users' });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleModalClose = () => {
    setModalShow(false);
    setSelectedUser(null);
  };

  const handleConfirmRoleChange = async () => {
    setConfirmRoleChange(false);
    if (pendingUserData) {
      await performSave(pendingUserData);
      setPendingUserData(null);
    }
  };

  const handleCancelRoleChange = () => {
    setConfirmRoleChange(false);
    setPendingUserData(null);
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
    confirmRoleChange,
    pendingUserData,
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
    handleConfirmRoleChange,
    handleCancelRoleChange,
    setError
  };
};
