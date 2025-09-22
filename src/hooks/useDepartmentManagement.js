import { useState, useEffect } from 'react';

// Mock data for departments
const mockDepartments = [
  {
    id: "dept_001",
    name: "Cabin Crew Training Department",
    code: "CCT",
    type: "CCT",
    description: "Department specialized in cabin crew training, teaching customer service skills and flight safety procedures",
    departmentHeadId: "user_123",
    departmentHead: {
      id: "user_123",
      name: "John Smith",
      email: "john.smith@academy.com",
      role: "DEPT_HEAD"
    },
    status: "ACTIVE",
    coursesCount: 8,
    traineesCount: 156,
    trainersCount: 15,
    createdAt: "2024-01-15",
    updatedAt: "2024-03-20"
  },
  {
    id: "dept_002",
    name: "Quality Assurance Department",
    code: "SQA",
    type: "SQA",
    description: "Department responsible for ensuring training quality and compliance with international standards",
    departmentHeadId: "user_124",
    departmentHead: {
      id: "user_124",
      name: "Sarah Johnson",
      email: "sarah.johnson@academy.com",
      role: "DEPT_HEAD"
    },
    status: "ACTIVE",
    coursesCount: 3,
    traineesCount: 0,
    trainersCount: 8,
    createdAt: "2024-01-10",
    updatedAt: "2024-03-15"
  },
  {
    id: "dept_003",
    name: "Flight Crew Training Department",
    code: "FCTD",
    type: "FCTD",
    description: "Department specialized in pilot training, teaching flying skills and air traffic management",
    departmentHeadId: "user_125",
    departmentHead: {
      id: "user_125",
      name: "Michael Brown",
      email: "michael.brown@academy.com",
      role: "DEPT_HEAD"
    },
    status: "ACTIVE",
    coursesCount: 12,
    traineesCount: 200,
    trainersCount: 18,
    createdAt: "2024-01-20",
    updatedAt: "2024-03-25"
  },
  {
    id: "dept_004",
    name: "Ground Operations Department",
    code: "GOT",
    type: "GOT",
    description: "Department specialized in ground operations, airport management and ground services",
    departmentHeadId: "user_126",
    departmentHead: {
      id: "user_126",
      name: "Emily Davis",
      email: "emily.davis@academy.com",
      role: "DEPT_HEAD"
    },
    status: "INACTIVE",
    coursesCount: 5,
    traineesCount: 80,
    trainersCount: 6,
    createdAt: "2024-01-25",
    updatedAt: "2024-03-30"
  }
];

// Mock users for department head selection
const mockUsers = [
  { id: "user_123", name: "John Smith", email: "john.smith@academy.com", role: "DEPT_HEAD" },
  { id: "user_124", name: "Sarah Johnson", email: "sarah.johnson@academy.com", role: "DEPT_HEAD" },
  { id: "user_125", name: "Michael Brown", email: "michael.brown@academy.com", role: "DEPT_HEAD" },
  { id: "user_126", name: "Emily Davis", email: "emily.davis@academy.com", role: "DEPT_HEAD" },
  { id: "user_127", name: "David Wilson", email: "david.wilson@academy.com", role: "TRAINER" },
  { id: "user_128", name: "Lisa Anderson", email: "lisa.anderson@academy.com", role: "TRAINER" }
];

const useDepartmentManagement = () => {
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

  // Load departments from localStorage or use mock data
  useEffect(() => {
    const loadDepartments = () => {
      setLoading(true);
      try {
        // Force update with new English mock data
        setDepartments(mockDepartments);
        localStorage.setItem('departments', JSON.stringify(mockDepartments));
      } catch (err) {
        console.error('Error loading departments:', err);
        setError('Failed to load departments');
        setDepartments(mockDepartments);
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

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
    try {
      const newDepartment = {
        id: `dept_${Date.now()}`,
        ...departmentData,
        coursesCount: 0,
        traineesCount: 0,
        trainersCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      const updatedDepartments = [...departments, newDepartment];
      setDepartments(updatedDepartments);
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
      
      return newDepartment;
    } catch (err) {
      setError('Failed to create department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id, departmentData) => {
    setLoading(true);
    try {
      const updatedDepartments = departments.map(dept =>
        dept.id === id
          ? { ...dept, ...departmentData, updatedAt: new Date().toISOString().split('T')[0] }
          : dept
      );
      
      setDepartments(updatedDepartments);
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
      
      return updatedDepartments.find(dept => dept.id === id);
    } catch (err) {
      setError('Failed to update department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    setLoading(true);
    try {
      const updatedDepartments = departments.filter(dept => dept.id !== id);
      setDepartments(updatedDepartments);
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
    } catch (err) {
      setError('Failed to delete department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartmentStatus = async (id) => {
    setLoading(true);
    try {
      const updatedDepartments = departments.map(dept =>
        dept.id === id
          ? { 
              ...dept, 
              status: dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : dept
      );
      
      setDepartments(updatedDepartments);
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
    } catch (err) {
      setError('Failed to toggle department status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const bulkDeleteDepartments = async (ids) => {
    setLoading(true);
    try {
      const updatedDepartments = departments.filter(dept => !ids.includes(dept.id));
      setDepartments(updatedDepartments);
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
      setSelectedDepartments([]);
    } catch (err) {
      setError('Failed to delete departments');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkToggleStatus = async (ids, status) => {
    setLoading(true);
    try {
      const updatedDepartments = departments.map(dept =>
        ids.includes(dept.id)
          ? { 
              ...dept, 
              status,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : dept
      );
      
      setDepartments(updatedDepartments);
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
      setSelectedDepartments([]);
    } catch (err) {
      setError('Failed to update department status');
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
  const getAvailableUsers = () => {
    return mockUsers.filter(user => 
      user.role === 'DEPT_HEAD' || user.role === 'TRAINER'
    );
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
    setError
  };
};

export default useDepartmentManagement;
