import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Dropdown, Alert } from 'react-bootstrap';
import { Plus, Upload, Funnel, ChevronDown } from 'react-bootstrap-icons';
import { UserTable, UserModal, BulkImport, DisableUserModal, FilterPanel } from '../../components/Dashboard/User';
import { SearchBar, PermissionWrapper } from '../../components/Common';
import { useUserManagement } from '../../hooks/useUserManagement';
import { PERMISSIONS } from '../../constants/permissions';
import '../../styles/scrollable-table.css';

const UserManagementPage = () => {
  const [disableModalShow, setDisableModalShow] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);
  const [disableLoading, setDisableLoading] = useState(false);

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
    setError
  } = useUserManagement();

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

  return (
    <Container fluid className="py-4">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
            <Col>
              <h5 className="text-muted">
                Manage system users, roles, and permissions
              </h5>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <PermissionWrapper 
                  permission={PERMISSIONS.MANAGE_USERS}
                  fallback={null}
                >
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => document.getElementById('bulk-import-trigger').click()}
                    className="d-flex align-items-center"
                  >
                    <Upload className="me-1" size={16} />
                    Bulk Import
                  </Button>
                </PermissionWrapper>
                <PermissionWrapper 
                  permission={PERMISSIONS.MANAGE_USERS}
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
          <Row className="mb-3">
            <Col lg={6} md={5}>
              <SearchBar
                placeholder="Search users by name, EID, or email..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </Col>
            <Col lg={3} md={4}>
              <FilterPanel
                uniqueRoles={uniqueRoles}
                uniqueDepartments={uniqueDepartments}
                selectedRoles={selectedRoles}
                selectedDepartments={selectedDepartments}
                onRoleToggle={handleRoleToggle}
                onDepartmentToggle={handleDepartmentToggle}
                onClearFilters={handleClearFilters}
              />
            </Col>
            <Col lg={3} md={3}>
              <div className="text-end">
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
          <BulkImport
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserManagementPage;
