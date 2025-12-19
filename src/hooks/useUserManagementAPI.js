import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';
import { roleAPI } from '../api/role';
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


  // Fetch users and departments from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users first (required)
        const usersResponse = await userAPI.getUsers();
        
        // Handle different response formats - ensure data is an array
        let usersArray = [];
        if (Array.isArray(usersResponse)) {
          usersArray = usersResponse;
        } else if (Array.isArray(usersResponse?.data)) {
          usersArray = usersResponse.data;
        } else if (usersResponse?.users && Array.isArray(usersResponse.users)) {
          usersArray = usersResponse.users;
        } else {
          console.warn('⚠️ Unexpected users response format:', usersResponse);
          usersArray = [];
        }
        
        // Transform users data to match component format
        const transformedUsers = usersArray.map(user => ({
          id: user.id,
          eid: user.eid,
          fullName: [user.lastName, user.middleName, user.firstName].filter(Boolean).join(' '),
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
          bio: user.bio || '',
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

    fetchData();
  }, []); 

  // Get unique roles from current users
  const uniqueRoles = [...new Set(users.map(user => user.role).filter(Boolean))];
  
  // Get unique departments from users
  const uniqueDepartments = [
    ...new Set(users.map(user => user.department).filter(Boolean))
  ].filter((dept, index, arr) => {
    // Remove duplicates and filter out 'N/A'
    return dept && dept !== 'N/A' && arr.indexOf(dept) === index;
  });

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
        fullName: [userDetail.lastName, userDetail.middleName, userDetail.firstName].filter(Boolean).join(' '),
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
        bio: userDetail.trainerProfile?.bio || '',
        // Trainee profile fields
        dateOfBirth: userDetail.traineeProfile?.dob ? userDetail.traineeProfile.dob.split('T')[0] : '',
        trainingBatch: userDetail.traineeProfile?.trainingBatch || '',
        passportNo: userDetail.traineeProfile?.passportNo || '',
        nation: userDetail.traineeProfile?.nation || '',
        createdAt: userDetail.createdAt,
        lastLogin: userDetail.lastLogin || '',
        // ✅ Include full profile objects for UserModal
        traineeProfile: userDetail.traineeProfile || null,
        trainerProfile: userDetail.trainerProfile || null
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
        fullName: [userDetail.lastName, userDetail.middleName, userDetail.firstName].filter(Boolean).join(' '),
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
        bio: userDetail.trainerProfile?.bio || '',
        // Trainee profile fields
        dateOfBirth: userDetail.traineeProfile?.dob ? userDetail.traineeProfile.dob.split('T')[0] : '',
        trainingBatch: userDetail.traineeProfile?.trainingBatch || '',
        passportNo: userDetail.traineeProfile?.passportNo || '',
        nation: userDetail.traineeProfile?.nation || '',
        createdAt: userDetail.createdAt,
        lastLogin: userDetail.lastLogin || '',
        // ✅ Include full profile objects for UserModal
        traineeProfile: userDetail.traineeProfile || null,
        trainerProfile: userDetail.trainerProfile || null
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
      
      let response;
      let action;
      
      // Call appropriate API based on current status
      if (user.status === 'ACTIVE') {
        // Disable user
        response = await userAPI.disableUser(user.id);
        action = 'disabled';
      } else {
        // Enable user
        response = await userAPI.enableUser(user.id);
        action = 'enabled';
      }
      
      // Refresh users list (departments will be fetched separately if needed)
      const usersResponse = await userAPI.getUsers();
      
      // Handle different response formats - ensure data is an array
      let usersArray = [];
      if (Array.isArray(usersResponse)) {
        usersArray = usersResponse;
      } else if (Array.isArray(usersResponse?.data)) {
        usersArray = usersResponse.data;
      } else if (usersResponse?.users && Array.isArray(usersResponse.users)) {
        usersArray = usersResponse.users;
      } else {
        console.warn('⚠️ Unexpected users response format:', usersResponse);
        usersArray = [];
      }
      
      const transformedUsers = usersArray.map(user => ({
        id: user.id,
        eid: user.eid,
        fullName: [user.lastName, user.middleName, user.firstName].filter(Boolean).join(' '),
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
        bio: user.trainerProfile?.bio || '',
        // Trainee profile fields
        dateOfBirth: user.traineeProfile?.dob ? user.traineeProfile.dob.split('T')[0] : '',
        trainingBatch: user.traineeProfile?.trainingBatch || '',
        passportNo: user.traineeProfile?.passportNo || '',
        nation: user.traineeProfile?.nation || '',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || ''
      }));
      
      setUsers(transformedUsers);
      
      // Show success message with API response message
      const message = response?.message || `User has been ${action} successfully!`;
      toast.success(message);
      
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
      // Error is already set in performSave, and toast will be shown via useEffect in UserManagementPage
      // when error state changes, so we don't need to show toast here to avoid duplicate toasts
      setLoading(false);
    }
  };

  const performSave = async (userData) => {
    try {
      setLoading(true);
      
      
      // Get roles from public API to find correct role ID (supporting data)
      let newRoleId = null;
      try {
        // Use public API (no permission required)
        const rolesResponse = await roleAPI.getRoles();
        
        // ✅ Handle different response formats
        let rolesArray = [];
        if (Array.isArray(rolesResponse)) {
          rolesArray = rolesResponse;
        } else if (rolesResponse?.roles && Array.isArray(rolesResponse.roles)) {
          rolesArray = rolesResponse.roles;
        } else if (rolesResponse?.data && Array.isArray(rolesResponse.data)) {
          rolesArray = rolesResponse.data;
        }
        
        if (!rolesArray || rolesArray.length === 0) {
          throw new Error('No roles found in API response');
        }
        
        const targetRole = rolesArray.find(role => role.name === userData.role);
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
          bio: userData.bio || ''
        };
        // Department is NOT allowed for TRAINER role - do not add departmentId
      } else if (userData.role === 'TRAINEE') {
            // Only add traineeProfile if we have meaningful data
            const hasTraineeData = userData.dateOfBirth || userData.trainingBatch || userData.passportNo || userData.nation;
            if (hasTraineeData) {
              apiPayload.traineeProfile = {
                dob: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString() : null,
                enrollmentDate: new Date().toISOString(),
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
      const usersResponse = await userAPI.getUsers();
      
      // Handle different response formats - ensure data is an array
      let usersArray = [];
      if (Array.isArray(usersResponse)) {
        usersArray = usersResponse;
      } else if (Array.isArray(usersResponse?.data)) {
        usersArray = usersResponse.data;
      } else if (usersResponse?.users && Array.isArray(usersResponse.users)) {
        usersArray = usersResponse.users;
      } else {
        console.warn('⚠️ Unexpected users response format:', usersResponse);
        usersArray = [];
      }
      
      // Check if the updated user has traineeProfile (only for edit mode)
      if (modalMode === 'edit' && selectedUser?.id) {
        const updatedUser = usersArray.find(u => u.id === selectedUser.id);
        if (updatedUser) {
          // User found and updated successfully
        }
      }
      
      const transformedUsers = usersArray.map(user => ({
        id: user.id,
        eid: user.eid,
        fullName: [user.lastName, user.middleName, user.firstName].filter(Boolean).join(' '),
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
        bio: user.trainerProfile?.bio || '',
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
  
  const handleBulkImport = async (usersData) => {
    try {
      setLoading(true);
      const response = await userAPI.bulkImportUsers(usersData);
      
      // Normalise response (API sometimes wraps data inside data field)
      const successList = response?.success ?? response?.data?.success ?? [];
      const failedList = response?.failed ?? response?.data?.failed ?? [];
      const summary = response?.summary ?? response?.data?.summary;
      const backendMessage = response?.message || response?.data?.message;
      

      // Show toast with message and summary
      if (summary) {
        const { total, successful, failed } = summary;
        let message = backendMessage || 'Bulk user creation completed';
        
        // Add summary to message
        if (successful > 0 || failed > 0) {
          message += ` (${successful} successful, ${failed} failed out of ${total} total)`;
        }
        
        if (failed > 0) {
          // Has failures - show warning with summary
          toast.warning(message, {
            toastId: 'bulk-import-summary',
            autoClose: 6000
          });
          
          // Also show individual error messages
          failedList.forEach((failedUser, index) => {
            const errorMsg = failedUser?.error;
            if (errorMsg) {
              setTimeout(() => {
                toast.error(errorMsg, {
                  autoClose: 6000,
                  toastId: `bulk-import-failed-${index}`
                });
              }, index * 200);
            }
          });
        } else if (successful > 0) {
          // All successful - show success with summary
          toast.success(message, {
            toastId: 'bulk-import-success',
            autoClose: 5000
          });
        }
      } else {
        // Fallback if no summary - use old logic
        if (successList.length > 0) {
          const successMessage = backendMessage 
            ? backendMessage
            : `Successfully imported ${successList.length} users!`;
          toast.success(successMessage, {
            toastId: 'bulk-import-success' 
          });
        }
        
        if (failedList.length > 0) {
          failedList.forEach((failedUser, index) => {
            const errorMsg = failedUser?.error;
            if (errorMsg) {
              setTimeout(() => {
                toast.error(errorMsg, {
                  autoClose: 6000,
                  toastId: `bulk-import-failed-${index}`
                });
              }, index * 200);
            }
          });
        }
      }
      
      // Refresh users list (departments will be fetched separately if needed)
      const usersResponse = await userAPI.getUsers({ _t: new Date().getTime() });
      
      // Handle different response formats - ensure data is an array
      let usersArray = [];
      if (Array.isArray(usersResponse)) {
        usersArray = usersResponse;
      } else if (Array.isArray(usersResponse?.data)) {
        usersArray = usersResponse.data;
      } else if (usersResponse?.users && Array.isArray(usersResponse.users)) {
        usersArray = usersResponse.users;
      } else {
        console.warn('⚠️ Unexpected users response format:', usersResponse);
        usersArray = [];
      }
      
      // Log imported users data
      console.log('✅ [handleBulkImport] Users after import from backend:', {
        totalUsers: usersArray.length,
        trainees: usersArray.filter(u => u.role?.name === 'TRAINEE').map((user, idx) => ({
          index: idx,
          name: `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim(),
          dob: user.traineeProfile?.dob,
          enrollmentDate: user.traineeProfile?.enrollmentDate,
          raw: user.traineeProfile
        }))
      });
      
      const transformedUsers = usersArray.map(user => ({
        id: user.id,
        eid: user.eid,
        fullName: [user.lastName, user.middleName, user.firstName].filter(Boolean).join(' '),
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
        bio: user.trainerProfile?.bio || '',
        // Trainee profile fields
        dateOfBirth: user.traineeProfile?.dob ? user.traineeProfile.dob.split('T')[0] : '',
        enrollmentDate: user.traineeProfile?.enrollmentDate ? user.traineeProfile.enrollmentDate.split('T')[0] : '',
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
      toast.error(errorMessage);
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
