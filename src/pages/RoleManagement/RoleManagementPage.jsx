import React from 'react';
import { Container, Card, Row, Col, Button, Dropdown, Alert } from 'react-bootstrap';
import { Plus, ThreeDotsVertical } from 'react-bootstrap-icons';
import { RoleTable, RoleModal } from '../../components/Dashboard/Role';
import { SearchBar, PermissionWrapper } from '../../components/Common';
import { useRoleManagement } from '../../hooks/useRoleManagement';
import { PERMISSIONS } from '../../constants/permissions';

const RoleManagementPage = () => {
  const {
    roles: filteredRoles,
    loading,
    error,
    searchTerm,
    modalShow,
    selectedRole,
    modalMode,
    handleSearch,
    handleView,
    handleEdit,
    handleAdd,
    handleDelete,
    handleSave,
    handleDisable,
    handleModalClose,
    setError
  } = useRoleManagement();

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
          onClick={() => handleView(role)}
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
          onClick={() => handleEdit(role)}
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
          onClick={() => handleDisable(role.id)}
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
                  onClick={handleAdd}
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
                onChange={handleSearch}
              />
            </Col>
            <Col md={6}>
              <div className="text-end">
                <small className="text-muted">
                  {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''}
                </small>
              </div>
            </Col>
          </Row>

          {/* Role Table with updated actions */}
          <RoleTable
            roles={filteredRoles}
            loading={loading}
            actionsComponent={RoleActions}
            onView={handleView}
            onEdit={handleEdit}
            onDisable={handleDisable}
          />

          {/* Role Modal */}
          <RoleModal
            show={modalShow}
            role={selectedRole}
            mode={modalMode}
            onSave={handleSave}
            onClose={handleModalClose}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RoleManagementPage;
