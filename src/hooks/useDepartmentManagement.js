import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { departmentAPI } from '../api';

// Helper function to transform API data to expected format
const transformDepartmentData = (departmentsData) => {
  return departmentsData.map(dept => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    type: dept.code,
    description: dept.description,
    departmentHeadId: dept.headUserId,
    departmentHead: dept.headUser ? {
      id: dept.headUser.id,
      name: dept.headUser.name || dept.headUser.email,
      email: dept.headUser.email,
      role: dept.headUser.role
    } : null,
    status: dept.isActive === true ? 'ACTIVE' : 'INACTIVE',
    coursesCount: dept.courseCount || dept.coursesCount || 0,
    traineesCount: dept.traineeCount || dept.traineesCount || 0,
    trainersCount: dept.trainerCount || dept.trainersCount || 0,
    createdAt: dept.createdAt,
    updatedAt: dept.updatedAt,
    deletedAt: dept.deletedAt
  }));
};

const useDepartmentManagement = (shouldLoad = true) => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  // Load departments from API
  useEffect(() => {
    if (!shouldLoad) {
      // console.log('🔍 useDepartmentManagement - Skipping department load for non-ACADEMIC_DEPARTMENT role'); // Commented out to reduce console noise
      return;
    }

    const loadDepartments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await departmentAPI.getDepartments();
        const departmentsData = response.departments || [];
        
        // Transform API data to match expected format
        const transformedDepartments = transformDepartmentData(departmentsData);
        
        
        setDepartments(transformedDepartments);
      } catch (err) {
        console.error('Error loading departments:', err);
        setError('Failed to load departments');
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, [shouldLoad]);

  // Filter and search departments
  useEffect(() => {
    let filtered = departments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(dept => dept.type === filters.type);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(dept => dept.status === filters.status);
    }

    setFilteredDepartments(filtered);
  }, [departments, searchTerm, filters]);

  // Sort departments
  const sortDepartments = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredDepartments].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredDepartments(sorted);
  };

  // CRUD operations
  const createDepartment = async (departmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentAPI.createDepartment(departmentData);
      
      // Reload departments to get the latest data
      const updatedResponse = await departmentAPI.getDepartments();
      const departmentsData = updatedResponse.departments || [];
      
      const transformedDepartments = transformDepartmentData(departmentsData);
      
      setDepartments(transformedDepartments);
      return response;
    } catch (err) {
      console.error('Error creating department:', err);
      setError('Failed to create department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id, departmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentAPI.updateDepartment(id, departmentData);
      
      // Reload departments to get the latest data
      const updatedResponse = await departmentAPI.getDepartments();
      const departmentsData = updatedResponse.departments || [];
      
      const transformedDepartments = transformDepartmentData(departmentsData);
      
      setDepartments(transformedDepartments);
      return response;
    } catch (err) {
      console.error('Error updating department:', err);
      setError('Failed to update department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await departmentAPI.deleteDepartment(id);
      
      // Reload departments to get the latest data
      const updatedResponse = await departmentAPI.getDepartments();
      const departmentsData = updatedResponse.departments || [];
      
      const transformedDepartments = transformDepartmentData(departmentsData);
      
      setDepartments(transformedDepartments);
    } catch (err) {
      console.error('Error deleting department:', err);
      setError('Failed to delete department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartmentStatus = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await departmentAPI.toggleDepartmentStatus(id);
      
      // Reload departments to get the latest data
      const updatedResponse = await departmentAPI.getDepartments();
      const departmentsData = updatedResponse.departments || [];
      
      const transformedDepartments = transformDepartmentData(departmentsData);
      
      setDepartments(transformedDepartments);
    } catch (err) {
      console.error('Error toggling department status:', err);
      toast.error('Failed to toggle department status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disableDepartment = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await departmentAPI.disableDepartment(id);
      
      // Reload departments to get the latest data
      const updatedResponse = await departmentAPI.getDepartments();
      const departmentsData = updatedResponse.departments || [];
      
      const transformedDepartments = transformDepartmentData(departmentsData);
      
      setDepartments(transformedDepartments);
    } catch (err) {
      console.error('Error disabling department:', err);
      toast.error('Failed to disable department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const enableDepartment = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await departmentAPI.enableDepartment(id);
      
      // Reload departments to get the latest data
      const updatedResponse = await departmentAPI.getDepartments();
      const departmentsData = updatedResponse.departments || [];
      
      const transformedDepartments = transformDepartmentData(departmentsData);
      
      setDepartments(transformedDepartments);
    } catch (err) {
      console.error('Error enabling department:', err);
      toast.error('Failed to enable department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const bulkDeleteDepartments = async (ids) => {
    setLoading(true);
    setError(null);
    try {
      await departmentAPI.bulkDeleteDepartments(ids);
      
      // Reload departments to get the latest data
      const updatedResponse = await departmentAPI.getDepartments();
      const departmentsData = updatedResponse.departments || [];
      
      const transformedDepartments = transformDepartmentData(departmentsData);
      
      setDepartments(transformedDepartments);
      setSelectedDepartments([]);
    } catch (err) {
      console.error('Error bulk deleting departments:', err);
      toast.error('Failed to delete departments');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkToggleStatus = async (ids, status) => {
    setLoading(true);
    setError(null);
    try {
      await departmentAPI.bulkToggleStatus(ids, status);
      
      // Reload departments to get the latest data
      const updatedResponse = await departmentAPI.getDepartments();
      const departmentsData = updatedResponse.departments || [];
      
      const transformedDepartments = transformDepartmentData(departmentsData);
      
      setDepartments(transformedDepartments);
      setSelectedDepartments([]);
    } catch (err) {
      console.error('Error bulk toggling department status:', err);
      toast.error('Failed to update department status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const handleSelectDepartment = (id) => {
    setSelectedDepartments(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDepartments.length === filteredDepartments.length) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments(filteredDepartments.map(dept => dept.id));
    }
  };

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({ type: '', status: '' });
    setSearchTerm('');
  };

  // Get available users for department head selection
  const getAvailableUsers = useCallback(async () => {
    try {
      const response = await departmentAPI.getDepartmentHeads();
      // API returns { users: [...], totalItems: 7 }
      return response?.users || [];
    } catch (error) {
      console.error('Error fetching department heads:', error);
      toast.error('Failed to load department heads');
      return [];
    }
  }, []); // No dependencies, function is stable

  // Manual refresh function
  const refreshDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentAPI.getDepartments();
      const departmentsData = response.departments || [];
      const transformedDepartments = transformDepartmentData(departmentsData);
      setDepartments(transformedDepartments);
    } catch (err) {
      console.error('Error refreshing departments:', err);
      setError('Failed to refresh departments');
    } finally {
      setLoading(false);
    }
  };


  return {
    // Data
    departments: filteredDepartments,
    selectedDepartments,
    loading,
    error,
    
    // Search and filters
    searchTerm,
    setSearchTerm,
    filters,
    sortConfig,
    
    // Actions
    createDepartment,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentStatus,
    disableDepartment,
    enableDepartment,
    bulkDeleteDepartments,
    bulkToggleStatus,
    sortDepartments,
    
    // Selection
    handleSelectDepartment,
    handleSelectAll,
    
    // Filters
    handleFilterChange,
    clearFilters,
    
    // Utils
    getAvailableUsers,
    refreshDepartments,
    setError
  };
};

export default useDepartmentManagement;
