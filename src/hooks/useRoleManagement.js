import { useState, useEffect } from 'react';
import { roleAPI } from '../api';
import { mapError } from '../utils/errorMapping';
import { toast } from 'react-toastify';

// Helper function to check if role is active
// API returns isActive as boolean (true/false) or string ('ACTIVE'/'INACTIVE')
const isRoleActive = (isActive) => {
  return isActive === true || isActive === 'ACTIVE';
};

export const useRoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await roleAPI.getRoles({
          includeDeleted: true
        });
        
        // Handle different response formats
        // Format 1: { roles: [...] }
        // Format 2: { message: "...", data: { roles: [...] } } → normalized to { roles: [...] }
        // Format 3: [...] (direct array)
        const rolesArray = Array.isArray(response) 
          ? response 
          : (response?.roles || []);
        
        // Transform API data to match component format
        const transformedRoles = rolesArray.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description || '',
          assignedUsers: role.userCount || 0,
          status: isRoleActive(role.isActive) ? 'Active' : 'Inactive',
          createdAt: role.createdAt ? role.createdAt.split('T')[0] : '',
          lastModified: role.updatedAt ? role.updatedAt.split('T')[0] : '',
          isActive: role.isActive,
          permissions: role.permissions || [], // Include permissions
          // Keep original API data for reference
          originalData: role
        }));

        setRoles(transformedRoles);
        setError(null);
      } catch (err) {
        const errorMessage = mapError(err, { context: 'fetch_roles' });
        setError(errorMessage);
        console.error('Error fetching roles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSearch = (term) => setSearchTerm(term);

  const handleStatusToggle = (status) => {
    if (status === 'clear') {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(prev =>
        prev.includes(status)
          ? prev.filter(s => s !== status)
          : [...prev, status]
      );
    }
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
  };

  const handleView = async (role) => {
    try {
      setLoading(true);
      // Fetch fresh role data with permissions from API
      const response = await roleAPI.getRoleById(role.id);
      setSelectedRole(response);
      setModalMode('view');
      setModalShow(true);
    } catch (err) {
      const errorMessage = mapError(err, { context: 'fetch_role_details' });
      setError(errorMessage);
      console.error('Error fetching role details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (role) => {
    try {
      setLoading(true);
      // Fetch fresh role data from API
      const roleDetail = await roleAPI.getRoleById(role.id);
      
      // Transform the fresh data
      const transformedRole = {
        id: roleDetail.id,
        name: roleDetail.name,
        description: roleDetail.description || '',
        assignedUsers: roleDetail.userCount || 0,
        status: isRoleActive(roleDetail.isActive) ? 'Active' : 'Inactive',
        createdAt: roleDetail.createdAt ? roleDetail.createdAt.split('T')[0] : '',
        lastModified: roleDetail.updatedAt ? roleDetail.updatedAt.split('T')[0] : '',
        isActive: roleDetail.isActive,
        permissions: roleDetail.permissions || [], // Include permissions
        originalData: roleDetail
      };
      
      setSelectedRole(transformedRole);
      setModalMode('edit');
      setModalShow(true);
      setError(null);
    } catch (err) {
      const errorMessage = mapError(err, { context: 'load_role_details' });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedRole(null);
    setModalMode('add');
    setModalShow(true);
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
      setError(null);
    } catch (err) {
      setError('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (roleData) => {
    setLoading(true);
    try {
      if (modalMode === 'add') {
        await roleAPI.createRole(roleData);
        toast.success('Role created successfully!');
      } else {
        // console.log('🔍 Updating role with data:', {
        //   roleId: selectedRole.id,
        //   roleData: roleData,
        //   selectedRole: selectedRole
        // }); // Commented out to reduce console noise
        await roleAPI.updateRole(selectedRole.id, roleData);
        toast.success('Role updated successfully!');
      }

      // Refresh roles list
      const response = await roleAPI.getRoles({
          includeDeleted: true
        });
      // Handle different response formats
      const rolesArray = Array.isArray(response) 
        ? response 
        : (response?.roles || []);
      const transformedRoles = rolesArray.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        assignedUsers: role.userCount || 0,
        status: isRoleActive(role.isActive) ? 'Active' : 'Inactive',
        createdAt: role.createdAt ? role.createdAt.split('T')[0] : '',
        lastModified: role.updatedAt ? role.updatedAt.split('T')[0] : '',
        isActive: role.isActive,
        originalData: role
      }));
      setRoles(transformedRoles);

      setModalShow(false);
      setSelectedRole(null);
      setError(null);
    } catch (err) {
      const errorMessage = mapError(err, { context: 'save_role' });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (roleId) => {
    setLoading(true);
    try {
      // Find the role to get current status
      const role = roles.find(r => r.id === roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      let response;
      let action;
      
      // Check current status
      const isCurrentlyActive = isRoleActive(role.isActive);
      
      // Call appropriate API based on current status
      if (isCurrentlyActive) {
        // Disable role
        response = await roleAPI.disableRole(roleId);
        action = 'disabled';
      } else {
        // Enable role
        response = await roleAPI.enableRole(roleId);
        action = 'enabled';
      }

      // Refresh roles list
      const rolesResponse = await roleAPI.getRoles({
          includeDeleted: true
        });
      // Handle different response formats
      const rolesArray = Array.isArray(rolesResponse) 
        ? rolesResponse 
        : (rolesResponse?.roles || []);
      const transformedRoles = rolesArray.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        assignedUsers: role.userCount || 0,
        status: isRoleActive(role.isActive) ? 'Active' : 'Inactive',
        createdAt: role.createdAt ? role.createdAt.split('T')[0] : '',
        lastModified: role.updatedAt ? role.updatedAt.split('T')[0] : '',
        isActive: role.isActive,
        originalData: role
      }));
      setRoles(transformedRoles);

      // Show success message with API response message
      const message = response?.message || `Role has been ${action} successfully!`;
      toast.success(message);
      setError(null);
    } catch (err) {
      const errorMessage = mapError(err, { context: 'toggle_role_status' });
      setError(errorMessage);
      // Don't call toast.error here - let the page component handle it via useEffect
    } finally {
      setLoading(false);
    }
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(roles.map(role => role.status))];

  // Filter roles based on search and status
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(role.status);
    return matchesSearch && matchesStatus;
  });

  return {
    // State
    roles: filteredRoles,
    loading,
    error,
    searchTerm,
    selectedStatuses,
    uniqueStatuses,
    modalShow,
    selectedRole,
    modalMode,
    
    // Handlers
    handleSearch,
    handleStatusToggle,
    handleClearFilters,
    handleView,
    handleEdit,
    handleAdd,
    handleDelete,
    handleSave,
    handleDisable,
    handleModalClose: () => setModalShow(false),
    setError
  };
};
