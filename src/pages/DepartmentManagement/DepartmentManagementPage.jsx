import React, { useState } from 'react';
import { Container, Row, Col, Button, Alert, Card } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import {
  DepartmentTable,
  DepartmentModal,
  DepartmentFilterPanel,
  DisableDepartmentModal,
  AssignInstructorsModal,
  DepartmentDetailsModal
} from '../../components/Dashboard/Department';
import { SearchBar } from '../../components/Common';
import useDepartmentManagement from '../../hooks/useDepartmentManagement';

const DepartmentManagementPage = () => {
  const {
    departments,
    selectedDepartments,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    sortConfig,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentStatus,
    bulkDeleteDepartments,
    bulkToggleStatus,
    sortDepartments,
    handleSelectDepartment,
    handleSelectAll,
    handleFilterChange,
    clearFilters,
    getAvailableUsers,
    setError
  } = useDepartmentManagement();


  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);

  // Modal handlers
  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewDepartment = (department) => {
    setSelectedDepartment(department);
    setShowDetailsModal(true);
  };

  const handleAssignInstructors = (department) => {
    setSelectedDepartment(department);
    setShowAssignModal(true);
  };

  const handleViewCourses = (department) => {
    // This would navigate to courses page or show courses modal
    console.log('View courses for department:', department.name);
  };

  const handleDeleteDepartment = (department) => {
    setSelectedDepartment(department);
    setShowDisableModal(true);
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

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedDepartment(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDepartment(null);
  };

  const handleAssignInstructorsSubmit = (instructorIds) => {
    // This would call the API to assign instructors
    console.log('Assign instructors:', instructorIds, 'to department:', selectedDepartment.name);
    handleCloseAssignModal();
  };

  const handleSaveDepartment = async (departmentData) => {
    try {
      if (modalMode === 'add') {
        await createDepartment(departmentData);
      } else if (modalMode === 'edit') {
        await updateDepartment(selectedDepartment.id, departmentData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleConfirmDisable = async () => {
    try {
      if (selectedDepartment) {
        await toggleDepartmentStatus(selectedDepartment.id);
        handleCloseDisableModal();
      }
    } catch (error) {
      console.error('Error toggling department status:', error);
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await bulkDeleteDepartments(ids);
    } catch (error) {
      console.error('Error deleting departments:', error);
    }
  };

  const handleBulkToggleStatus = async (ids, status) => {
    try {
      await bulkToggleStatus(ids, status);
    } catch (error) {
      console.error('Error updating department status:', error);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSort = (key) => {
    sortDepartments(key);
  };

  const handleFilterToggle = () => {
    setFilterPanelExpanded(!filterPanelExpanded);
  };

  const availableUsers = getAvailableUsers();

  return (
    <Container fluid className="py-4 department-management-page">
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-0 pb-0">
          <Row className="align-items-center">
            <Col xs={12} md={8}>
              <div>
                <h5 className="text-muted mb-0">
                  Manage departments, assign heads, and track department statistics
                </h5>
              </div>
            </Col>
            <Col xs={12} md={4} className="mt-2 mt-md-0">
              <div className="d-flex justify-content-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddDepartment}
                  className="d-flex align-items-center"
                >
                  <Plus className="me-1" size={16} />
                  Add Department
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Search and Filters */}
          <Row className="mb-3 form-mobile-stack">
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
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                className="filter-panel-mobile"
              />
            </Col>
            <Col xs={12} lg={3} md={3}>
              <div className="text-end text-mobile-center">
                <small className="text-muted">
                  {departments.length} department{departments.length !== 1 ? 's' : ''}
                </small>
              </div>
            </Col>
          </Row>

          {/* Error Alert */}
          {error && (
            <Row className="mb-3">
              <Col>
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError(null)}
                >
                  <strong>Error:</strong> {error}
                </Alert>
              </Col>
            </Row>
          )}

          {/* Department Table with Scrollable Container */}
          <div className="position-relative">
            <DepartmentTable
              departments={departments}
              loading={loading}
              onEdit={handleEditDepartment}
              onDelete={handleDeleteDepartment}
              onView={handleViewDepartment}
              onToggleStatus={handleToggleStatus}
              onAssignInstructors={handleAssignInstructors}
              onViewCourses={handleViewCourses}
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

        {showAssignModal && selectedDepartment && (
          <AssignInstructorsModal
            show={showAssignModal}
            department={selectedDepartment}
            onClose={handleCloseAssignModal}
            onAssign={handleAssignInstructorsSubmit}
            availableInstructors={availableUsers.filter(user => user.role === 'TRAINER')}
            assignedInstructors={[]} // This would come from department data
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
