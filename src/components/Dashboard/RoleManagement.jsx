import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { RoleTable, RoleModal } from './Role';
import { SearchBar, PermissionWrapper } from '../Common';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../constants/permissions';

const RoleManagement = ({
  roles,
  loading,
  searchTerm,
  modalShow,
  selectedRole,
  modalMode,
  onSearch,
  onView,
  onEdit,
  onAdd,
  onDelete,
  onSave,
  onDisable,
  onModalClose
}) => {
  const { hasPermission } = useAuth();
  return (
    <Card className="border-neutral-200 shadow-sm">
      <Card.Header className="bg-light-custom border-neutral-200">
        <Row className="align-items-center">
          <Col>
            <h5 className="text-primary-custom mb-0">Role Management</h5>
            <small className="text-muted">
              Manage user roles and permissions
            </small>
          </Col>
          <Col xs="auto">
            <PermissionWrapper 
              permission={PERMISSIONS.MANAGE_ROLES}
              fallback={null}
            >
              <Button
                variant="primary"
                size="sm"
                onClick={onAdd}
                className="d-flex align-items-center"
              >
                <Plus className="me-1" size={16} />
                Add Role
              </Button>
            </PermissionWrapper>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* Search */}
        <Row className="mb-3">
          <Col md={6}>
            <SearchBar
              placeholder="Search roles by name..."
              value={searchTerm}
              onChange={onSearch}
            />
          </Col>
          <Col md={6}>
            <div className="text-end">
              <small className="text-muted">
                {roles.length} role{roles.length !== 1 ? 's' : ''}
              </small>
            </div>
          </Col>
        </Row>

        {/* Role Table */}
        <RoleTable
          roles={roles}
          loading={loading}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onDisable={onDisable}
        />

        {/* Role Modal */}
        <RoleModal
          show={modalShow}
          role={selectedRole}
          mode={modalMode}
          onSave={onSave}
          onClose={onModalClose}
        />
      </Card.Body>
    </Card>
  );
};

export default RoleManagement;
