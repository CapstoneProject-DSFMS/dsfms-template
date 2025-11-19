import React, { useState, useEffect } from 'react';
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
import useDepartmentManagement from '../../../hooks/useDepartmentManagement';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';

const DepartmentManagementPage = () => {
  const navigate = useNavigate();
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
  } = useDepartmentManagement();


  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  // Checkbox filter states
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  
  // Available users for department head selection
  const [availableUsers, setAvailableUsers] = useState([]);

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
  }, [getAvailableUsers]); // getAvailableUsers is now memoized with useCallback

  // Modal handlers
  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleViewDepartment = (department) => {
    navigate(`/admin/departments/${department.id}`);
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
  const uniqueTypes = [...new Set(departments.map(dept => dept.type).filter(Boolean))];
  // Always show all status options, not just from data
  const uniqueStatuses = ['ACTIVE', 'INACTIVE'];

  // Apply checkbox filters
  const filteredDepartments = departments.filter(dept => {
    // Type filter
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(dept.type);
    // Status filter
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(dept.status);
    
    return typeMatch && statusMatch;
  });


  return (
    <Container fluid className="py-4 department-management-page">
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-0 pb-0">
          <Row className="align-items-center">
           
            <Col xs={12} className="mt-2 mt-md-0 mb-3">
              <div className="d-flex justify-content-end">
                <PermissionWrapper 
                  permission={API_PERMISSIONS.DEPARTMENTS.CREATE}
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
              loading={loading}
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
