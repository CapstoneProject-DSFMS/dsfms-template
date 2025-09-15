import React from 'react';
import { Card, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { Plus, Upload, Funnel } from 'react-bootstrap-icons';
import { UserTable, UserModal, BulkImport } from './User';
import { SearchBar, FilterDropdown, PermissionWrapper } from '../Common';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../constants/permissions';

const UserManagement = ({
  users,
  loading,
  searchTerm,
  roleFilter,
  departmentFilter,
  uniqueRoles,
  uniqueDepartments,
  modalShow,
  selectedUser,
  modalMode,
  onSearch,
  onRoleFilter,
  onDepartmentFilter,
  onView,
  onEdit,
  onAdd,
  onDelete,
  onSave,
  onBulkImport,
  onModalClose
}) => {
  const { hasPermission } = useAuth();

  return (
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
                  onClick={onAdd}
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
              onChange={onSearch}
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
                    onChange={(e) => onRoleFilter(e.target.value)}
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
                    onChange={(e) => onDepartmentFilter(e.target.value)}
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
                        onRoleFilter('');
                        onDepartmentFilter('');
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
                {users.length} user{users.length !== 1 ? 's' : ''}
              </small>
            </div>
          </Col>
        </Row>

        {/* User Table */}
        <UserTable
          users={users}
          loading={loading}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {/* User Modal */}
        <UserModal
          show={modalShow}
          user={selectedUser}
          mode={modalMode}
          onSave={onSave}
          onClose={onModalClose}
        />

        {/* Bulk Import Modal */}
        <BulkImport
          onImport={onBulkImport}
          loading={loading}
        />
      </Card.Body>
    </Card>
  );
};

export default UserManagement;
