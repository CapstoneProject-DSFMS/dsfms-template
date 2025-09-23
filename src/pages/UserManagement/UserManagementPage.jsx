import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Plus, Upload, Funnel, ChevronDown } from 'react-bootstrap-icons';
import { UserTable, UserModal, BulkImportModal, DisableUserModal, FilterPanel } from '../../components/Dashboard/User';
import RoleChangeConfirmModal from '../../components/Dashboard/User/RoleChangeConfirmModal';
import { SearchBar, PermissionWrapper } from '../../components/Common';
import { useUserManagementAPI } from '../../hooks/useUserManagementAPI';
import { PERMISSIONS_BY_UC } from '../../constants/permissions';
import '../../styles/scrollable-table.css';

const UserManagementPage = () => {
  const [disableModalShow, setDisableModalShow] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);
  const [disableLoading, setDisableLoading] = useState(false);
  const [bulkImportShow, setBulkImportShow] = useState(false);

  const {
    users: filteredUsers,
    loading,
    error,
    searchTerm,
    selectedRoles,
    selectedDepartments,
    uniqueRoles,
    uniqueDepartments,
    modalShow,
    selectedUser,
    modalMode,
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
  } = useUserManagementAPI();

  const handleDisableClick = (user) => {
    setUserToDisable(user);
    setDisableModalShow(true);
  };

  const handleDisableConfirm = async () => {
    if (!userToDisable) return;
    
    setDisableLoading(true);
    try {
      await handleDisable(userToDisable);
      setDisableModalShow(false);
      setUserToDisable(null);
    } catch (err) {
      console.error('Error disabling user:', err);
    } finally {
      setDisableLoading(false);
    }
  };

  const handleDisableCancel = () => {
    setDisableModalShow(false);
    setUserToDisable(null);
  };

  // Show error toast when error state changes
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Container fluid className="py-4 user-management-page">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
          
                <Col xs={12} className="mt-2 mt-md-0 mb-3">
                  <div className="d-flex justify-content-end gap-2">
                <PermissionWrapper 
                  permission={PERMISSIONS_BY_UC['UC-06'].title}
                  fallback={null}
                >
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setBulkImportShow(true)}
                    className="d-flex align-items-center"
                  >
                    <Upload className="me-1" size={16} />
                    <span className="d-none d-sm-inline">Bulk Import</span>
                    <span className="d-sm-none">Import</span>
                  </Button>
                </PermissionWrapper>
                <PermissionWrapper 
                  permission={PERMISSIONS_BY_UC['UC-06'].title}
                  fallback={null}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAdd}
                    className="d-flex align-items-center"
                  >
                    <Plus className="me-1" size={16} />
                    Add User
                  </Button>
                </PermissionWrapper>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Search and Filters */}
          <Row className="mb-3 form-mobile-stack">
            <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
              <SearchBar
                placeholder="Search users by name, EID, or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-bar-mobile"
              />
            </Col>
            <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
              <FilterPanel
                uniqueRoles={uniqueRoles}
                uniqueDepartments={uniqueDepartments}
                selectedRoles={selectedRoles}
                selectedDepartments={selectedDepartments}
                onRoleToggle={handleRoleToggle}
                onDepartmentToggle={handleDepartmentToggle}
                onClearFilters={handleClearFilters}
                className="filter-panel-mobile"
              />
            </Col>
            <Col xs={12} lg={3} md={3}>
              <div className="text-end text-mobile-center">
                <small className="text-muted">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </small>
              </div>
            </Col>
          </Row>

          {/* User Table with Scrollable Container */}
          <div className="position-relative">
            <UserTable
              users={filteredUsers}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDisable={handleDisableClick}
            />
            
            {/* Scroll indicator */}
            {filteredUsers.length > 8 && (
              <div className="scroll-indicator">
                <ChevronDown size={12} className="me-1" />
                Scroll to see more users
              </div>
            )}
          </div>


          {/* User Modal */}
          <UserModal
            show={modalShow}
            user={selectedUser}
            mode={modalMode}
            onSave={handleSave}
            onClose={handleModalClose}
          />

          {/* Bulk Import Modal */}
          <BulkImportModal
            show={bulkImportShow}
            onClose={() => setBulkImportShow(false)}
            onImport={handleBulkImport}
            loading={loading}
          />

          {/* Disable User Modal */}
          <DisableUserModal
            show={disableModalShow}
            user={userToDisable}
            onConfirm={handleDisableConfirm}
            onCancel={handleDisableCancel}
            loading={disableLoading}
          />

          {/* Role Change Confirmation Modal */}
          <RoleChangeConfirmModal
            show={confirmRoleChange}
            user={selectedUser}
            newRole={pendingUserData?.role}
            onConfirm={handleConfirmRoleChange}
            onCancel={handleCancelRoleChange}
            loading={loading}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserManagementPage;
