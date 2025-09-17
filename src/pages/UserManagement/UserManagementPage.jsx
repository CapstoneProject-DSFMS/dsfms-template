import React from 'react';
import { Container, Card, Row, Col, Button, Dropdown, Alert } from 'react-bootstrap';
import { Plus, Upload, Funnel } from 'react-bootstrap-icons';
import { UserTable, UserModal, BulkImport } from '../../components/Dashboard/User';
import { SearchBar, PermissionWrapper } from '../../components/Common';
import { useUserManagement } from '../../hooks/useUserManagement';
import { PERMISSIONS } from '../../constants/permissions';

const UserManagementPage = () => {
  const {
    users: filteredUsers,
    loading,
    error,
    searchTerm,
    roleFilter,
    departmentFilter,
    uniqueRoles,
    uniqueDepartments,
    modalShow,
    selectedUser,
    modalMode,
    handleSearch,
    handleRoleFilter,
    handleDepartmentFilter,
    handleView,
    handleEdit,
    handleAdd,
    handleDelete,
    handleSave,
    handleBulkImport,
    handleModalClose,
    setError
  } = useUserManagement();

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
              <h5 className="text-primary-custom mb-0">User Management</h5>
              <small className="text-muted">
                Manage system users, roles, and permissions
              </small>
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
            <Col md={8}>
              <SearchBar
                placeholder="Search users by name, EID, or email..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </Col>
            <Col md={2}>
              <Dropdown>
                <Dropdown.Toggle 
                  variant="outline-secondary" 
                  className="w-100 d-flex align-items-center justify-content-between"
                >
                  <Funnel size={14} className="me-2" />
                  Filters
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-3" style={{ width: '250px' }}>
                  <div className="mb-3">
                    <label className="form-label small">Role</label>
                    <select 
                      className="form-select form-select-sm"
                      value={roleFilter}
                      onChange={(e) => handleRoleFilter(e.target.value)}
                    >
                      <option value="">All Roles</option>
                      {uniqueRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Department</label>
                    <select 
                      className="form-select form-select-sm"
                      value={departmentFilter}
                      onChange={(e) => handleDepartmentFilter(e.target.value)}
                    >
                      <option value="">All Departments</option>
                      {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  {(roleFilter || departmentFilter) && (
                    <div className="mt-3 border-top pt-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => {
                          handleRoleFilter('');
                          handleDepartmentFilter('');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col md={2}>
              <div className="text-end">
                <small className="text-muted">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </small>
              </div>
            </Col>
          </Row>

          {/* User Table */}
          <UserTable
            users={filteredUsers}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserManagementPage;
