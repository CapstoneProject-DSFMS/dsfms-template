import { useState, useEffect } from 'react';
import { roleAPI } from '../api';
import { mapError } from '../utils/errorMapping';
import { toast } from 'react-toastify';

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
        
        // Transform API data to match component format
        const transformedRoles = response.roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description || '',
          assignedUsers: role.userCount || 0,
          status: role.isActive === 'ACTIVE' ? 'Active' : 'Inactive',
          createdAt: role.createdAt ? role.createdAt.split('T')[0] : '',
          lastModified: role.updatedAt ? role.updatedAt.split('T')[0] : '',
          isActive: role.isActive,
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

  const handleView = (role) => {
    setSelectedRole(role);
    setModalMode('view');
    setModalShow(true);
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
        status: roleDetail.isActive ? 'Active' : 'Inactive',
        createdAt: roleDetail.createdAt ? roleDetail.createdAt.split('T')[0] : '',
        lastModified: roleDetail.updatedAt ? roleDetail.updatedAt.split('T')[0] : '',
        isActive: roleDetail.isActive,
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
        await roleAPI.updateRole(selectedRole.id, roleData);
        toast.success('Role updated successfully!');
      }

      // Refresh roles list
      const response = await roleAPI.getRoles({
          includeDeleted: true
        });
      const transformedRoles = response.roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        assignedUsers: role.userCount || 0,
        status: role.isActive === 'ACTIVE' ? 'Active' : 'Inactive',
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

      // Toggle the status
      const newIsActive = role.isActive === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await roleAPI.toggleRoleStatus(roleId);

      // Refresh roles list
      const response = await roleAPI.getRoles({
          includeDeleted: true
        });
      const transformedRoles = response.roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        assignedUsers: role.userCount || 0,
        status: role.isActive === 'ACTIVE' ? 'Active' : 'Inactive',
        createdAt: role.createdAt ? role.createdAt.split('T')[0] : '',
        lastModified: role.updatedAt ? role.updatedAt.split('T')[0] : '',
        isActive: role.isActive,
        originalData: role
      }));
      setRoles(transformedRoles);

      const action = newIsActive === 'ACTIVE' ? 'enabled' : 'disabled';
      toast.success(`Role has been ${action} successfully!`);
      setError(null);
    } catch (err) {
      const errorMessage = mapError(err, { context: 'toggle_role_status' });
      setError(errorMessage);
      toast.error(errorMessage);
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
