import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  DepartmentTable,
  DepartmentModal,
  DepartmentFilterPanel,
  DisableDepartmentModal,
  DepartmentDetailsModal
} from '../../../components/Admin/Department';
import { SearchBar, PermissionWrapper } from '../../../components/Common';
import { usePermissions } from '../../../hooks/usePermissions';
import useDepartmentManagement from '../../../hooks/useDepartmentManagement';
import { departmentAPI } from '../../../api/department';
import { PERMISSION_IDS } from '../../../constants/permissionIds';
import { ROUTES } from '../../../constants/routes';

const DepartmentManagementPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const hasViewAll = hasPermission(PERMISSION_IDS.VIEW_ALL_DEPARTMENTS);
  
  const {
    departments,
    loading,
    searchTerm,
    setSearchTerm,
    createDepartment,
    updateDepartment,
    disableDepartment,
    enableDepartment,
    getAvailableUsers
  } = useDepartmentManagement(hasViewAll);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Checkbox filter states
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  
  // Available users for department head selection
  const [availableUsers, setAvailableUsers] = useState([]);

  // Load departments based on permission - extracted as function for reuse
  const loadDepartmentsData = useCallback(async () => {
    try {
      setPageLoading(true);
      let data;
      
      if (hasViewAll) {
        // Admin: fetch all departments
        data = await departmentAPI.getDepartments();
      } else {
        // Dept Head: fetch my department only, wrap in array for consistency
        const myDept = await departmentAPI.getMyDepartment();
        data = myDept ? [myDept] : [];
      }
      
      // Transform data
      const transformed = data.map(dept => ({
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
          role: dept.headUser.role,
          lastName: dept.headUser.lastName,
          middleName: dept.headUser.middleName,
          firstName: dept.headUser.firstName
        } : null,
        status: dept.isActive === true ? 'ACTIVE' : 'INACTIVE',
        coursesCount: dept.courseCount || dept.coursesCount || 0,
        traineesCount: dept.traineeCount || dept.traineesCount || 0,
        trainersCount: dept.trainerCount || dept.trainersCount || 0,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
        deletedAt: dept.deletedAt,
        courses: dept.courses || []
      }));
      
      setDepartmentData(transformed);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
      setDepartmentData([]);
    } finally {
      setPageLoading(false);
    }
  }, [hasViewAll]);

  // Load departments on mount and when hasViewAll changes
  useEffect(() => {
    loadDepartmentsData();
  }, [loadDepartmentsData]);

  // Load available users for department head selection
  useEffect(() => {
    const loadAvailableUsers = async () => {
      try {
        const users = await getAvailableUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error('Error loading available users:', error);
        setAvailableUsers([]);
      }
    };

    loadAvailableUsers();
  }, [getAvailableUsers]);

  // Modal handlers
  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleViewDepartment = (department) => {
    navigate(ROUTES.DEPARTMENTS_DETAIL(department.id)); // Use function-based route
  };

  const handleToggleStatus = (department) => {
    setSelectedDepartment(department);
    setShowDisableModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDepartment(null);
    setModalMode('add');
  };

  const handleCloseDisableModal = () => {
    setShowDisableModal(false);
    setSelectedDepartment(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDepartment(null);
  };


  const handleSaveDepartment = async (departmentData) => {
    try {
      if (modalMode === 'add') {
        await createDepartment(departmentData);
        toast.success('Department created successfully');
      } else if (modalMode === 'edit') {
        await updateDepartment(selectedDepartment.id, departmentData);
        toast.success('Department updated successfully');
      }
      handleCloseModal();
      // Reload departments data to show newly created/updated department
      await loadDepartmentsData();
    } catch (error) {
      console.error('Error saving department:', error);
      const errorData = error?.response?.data;
      let errorMessage = error?.message || 'Failed to save department';

      if (errorData?.message) {
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.map(msg => msg.message || msg).join(', ');
        } else {
          errorMessage = errorData.message;
        }
      }

      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const detailedMessages = errorData.errors
          .map(errItem => errItem.message || JSON.stringify(errItem))
          .filter(Boolean)
          .join(', ');
        if (detailedMessages) {
          errorMessage = detailedMessages;
        }
      }

      toast.error(errorMessage);
    }
  };

  const handleConfirmDisable = async () => {
    try {
      if (selectedDepartment) {
        if (selectedDepartment.status === 'ACTIVE') {
          await disableDepartment(selectedDepartment.id);
          toast.success('Department disabled successfully');
        } else {
          await enableDepartment(selectedDepartment.id);
          toast.success('Department enabled successfully');
        }
        handleCloseDisableModal();
        // Reload departments data to reflect status change immediately
        await loadDepartmentsData();
      }
    } catch (error) {
      console.error('Error toggling department status:', error);
      toast.error('Failed to toggle department status');
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Checkbox filter handlers
  const handleTypeToggle = (type) => {
    if (type === 'clear') {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(prev => 
        prev.includes(type) 
          ? prev.filter(t => t !== type)
          : [...prev, type]
      );
    }
  };

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

  const handleClearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
  };

  // Get unique values for filters
  const uniqueTypes = [...new Set(departmentData.map(dept => dept.type).filter(Boolean))];
  // Always show all status options, not just from data
  const uniqueStatuses = ['ACTIVE', 'INACTIVE'];

  // Apply checkbox filters
  const filteredDepartments = departmentData.filter(dept => {
    // Type filter
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(dept.type);
    // Status filter
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(dept.status);
    // Search filter
    const searchMatch = !searchTerm || 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && statusMatch && searchMatch;
  });


  return (
    <Container fluid className="py-4 department-management-page">
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-0 pb-0">
          <Row className="align-items-center">
           
            <Col xs={12} className="mt-2 mt-md-0 mb-3">
              <div className="d-flex justify-content-end">
                <PermissionWrapper 
                  permission={PERMISSION_IDS.CREATE_DEPARTMENT}
                  fallback={null}
                >
                  <Button
                    variant="primary-custom"
                    size="sm"
                    onClick={handleAddDepartment}
                    className="d-flex align-items-center"
                  >
                    <Plus className="me-1" size={16} />
                    Add Department
                  </Button>
                </PermissionWrapper>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Search and Filters */}
          <Row className="mb-4 form-mobile-stack">
            <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
              <SearchBar
                placeholder="Search departments by name, code, or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-bar-mobile"
              />
            </Col>
            <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
              <DepartmentFilterPanel
                uniqueTypes={uniqueTypes}
                uniqueStatuses={uniqueStatuses}
                selectedTypes={selectedTypes}
                selectedStatuses={selectedStatuses}
                onTypeToggle={handleTypeToggle}
                onStatusToggle={handleStatusToggle}
                onClearFilters={handleClearAllFilters}
                className="filter-panel-mobile"
              />
            </Col>
            <Col xs={12} lg={3} md={3}>
              <div className="text-end text-mobile-center">
                <small className="text-muted">
                  {filteredDepartments.length} department{filteredDepartments.length !== 1 ? 's' : ''}
                </small>
              </div>
            </Col>
          </Row>


          {/* Department Table with Scrollable Container */}
          <div className="position-relative mt-3">
            <DepartmentTable
              departments={filteredDepartments}
              loading={pageLoading || loading}
              onView={handleViewDepartment}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Modals */}
        {showModal && (
          <DepartmentModal
            show={showModal}
            department={selectedDepartment}
            mode={modalMode}
            onSave={handleSaveDepartment}
            onClose={handleCloseModal}
            availableUsers={availableUsers}
          />
        )}

        {showDisableModal && selectedDepartment && (
          <DisableDepartmentModal
            show={showDisableModal}
            department={selectedDepartment}
            onConfirm={handleConfirmDisable}
            onCancel={handleCloseDisableModal}
            isProcessing={loading}
          />
        )}

        {showDetailsModal && selectedDepartment && (
          <DepartmentDetailsModal
            show={showDetailsModal}
            department={selectedDepartment}
            onClose={handleCloseDetailsModal}
          />
        )}
    </Container>
  );
};

export default DepartmentManagementPage;
