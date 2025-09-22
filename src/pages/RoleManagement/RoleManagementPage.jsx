import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Dropdown, Alert } from 'react-bootstrap';
import { Plus, ThreeDotsVertical } from 'react-bootstrap-icons';
import { RoleTable, RoleModal, RoleFilterPanel, DisableRoleModal } from '../../components/Dashboard/Role';
import { SearchBar, PermissionWrapper } from '../../components/Common';
import { useRoleManagement } from '../../hooks/useRoleManagement';
import { PERMISSIONS_BY_UC } from '../../constants/permissions';

const RoleManagementPage = () => {
  const [disableModalShow, setDisableModalShow] = useState(false);
  const [roleToDisable, setRoleToDisable] = useState(null);
  const [disableLoading, setDisableLoading] = useState(false);

  const {
    roles: filteredRoles,
    loading,
    error,
    searchTerm,
    selectedStatuses,
    uniqueStatuses,
    modalShow,
    selectedRole,
    modalMode,
    handleSearch,
    handleStatusToggle,
    handleClearFilters,
    handleView,
    handleEdit,
    handleAdd,
    handleSave,
    handleDisable,
    handleModalClose,
    setError
  } = useRoleManagement();

  const handleDisableClick = (role) => {
    setRoleToDisable(role);
    setDisableModalShow(true);
  };

  const handleDisableConfirm = async () => {
    if (!roleToDisable) return;

    setDisableLoading(true);
    try {
      await handleDisable(roleToDisable.id);
      setDisableModalShow(false);
      setRoleToDisable(null);
    } catch (err) {
      console.error('Error disabling role:', err);
    } finally {
      setDisableLoading(false);
    }
  };

  const handleDisableCancel = () => {
    setDisableModalShow(false);
    setRoleToDisable(null);
  };

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
        {/* Only show disable/enable option if role is not admin */}
        {role.name.toLowerCase() !== 'admin' && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item 
              onClick={() => handleDisableClick(role)}
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
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <Container fluid className="py-4 role-management-page">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
            <Col xs={12} md={8}>
              <h5 className="text-muted text-mobile-center">
                Manage user roles and permissions
              </h5>
            </Col>
            <Col xs={12} md={4} className="mt-2 mt-md-0">
              <div className="d-flex justify-content-end">
                <PermissionWrapper 
                  permission={PERMISSIONS_BY_UC['UC-07'].title}
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
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Search and Filters */}
          <Row className="mb-3 form-mobile-stack">
            <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
              <SearchBar
                placeholder="Search roles by name..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-bar-mobile"
              />
            </Col>
            <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
              <RoleFilterPanel
                uniqueStatuses={uniqueStatuses}
                selectedStatuses={selectedStatuses}
                onStatusToggle={handleStatusToggle}
                onClearFilters={handleClearFilters}
                className="filter-panel-mobile"
              />
            </Col>
            <Col xs={12} lg={3} md={3}>
              <div className="text-end text-mobile-center">
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

          {/* Disable Role Modal */}
          <DisableRoleModal
            show={disableModalShow}
            role={roleToDisable}
            onConfirm={handleDisableConfirm}
            onCancel={handleDisableCancel}
            loading={disableLoading}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RoleManagementPage;
