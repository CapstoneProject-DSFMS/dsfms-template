import React from 'react';
import { Card, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { Plus, ThreeDotsVertical } from 'react-bootstrap-icons';
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
  onSave,
  onDisable,
  onModalClose
}) => {
  const { hasPermission } = useAuth();

  const RoleActions = ({ role }) => (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="light" 
        size="sm" 
        id={`role-actions-${role.id}`} 
        className="border-0"
      >
        <ThreeDotsVertical size={16} />
      </Dropdown.Toggle>
      <Dropdown.Menu className="shadow-sm">
        <Dropdown.Item 
          onClick={() => onView(role)}
          className="d-flex align-items-center transition-all"
          style={{
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            e.target.style.paddingLeft = '1.5rem';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.paddingLeft = '1rem';
          }}
        >
          View Details
        </Dropdown.Item>
        <Dropdown.Item 
          onClick={() => onEdit(role)}
          className="d-flex align-items-center transition-all"
          style={{
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            e.target.style.paddingLeft = '1.5rem';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.paddingLeft = '1rem';
          }}
        >
          Edit Role
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item 
          onClick={() => onDisable(role.id)}
          className={`d-flex align-items-center transition-all ${
            role.status === 'Active' ? 'text-warning' : 'text-success'
          }`}
          style={{
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = role.status === 'Active' 
              ? 'rgba(255, 193, 7, 0.1)' 
              : 'rgba(40, 167, 69, 0.1)';
            e.target.style.paddingLeft = '1.5rem';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.paddingLeft = '1rem';
          }}
        >
          {role.status === 'Active' ? 'Disable Role' : 'Enable Role'}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

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

        {/* Role Table with updated actions */}
        <RoleTable
          roles={roles}
          loading={loading}
          actionsComponent={RoleActions}
          onView={onView}
          onEdit={onEdit}
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
