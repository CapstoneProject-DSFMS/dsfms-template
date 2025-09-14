import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Plus, Upload } from 'react-bootstrap-icons';
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
  const roleOptions = uniqueRoles.map(role => ({ value: role, label: role }));
  const departmentOptions = uniqueDepartments.map(dept => ({ value: dept, label: dept }));

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
          <Col md={4}>
            <SearchBar
              placeholder="Search users by name, EID, or email..."
              value={searchTerm}
              onChange={onSearch}
            />
          </Col>
          <Col md={3}>
            <FilterDropdown
              title="Role"
              options={roleOptions}
              selectedValue={roleFilter}
              onSelect={onRoleFilter}
            />
          </Col>
          <Col md={3}>
            <FilterDropdown
              title="Department"
              options={departmentOptions}
              selectedValue={departmentFilter}
              onSelect={onDepartmentFilter}
            />
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
