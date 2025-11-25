import React, { useState } from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Plus, ThreeDotsVertical, Eye, Pencil, PersonX } from 'react-bootstrap-icons';
import { RoleTable, RoleModal, RoleFilterPanel, DisableRoleModal } from '../../../components/Admin/Role';
import { SearchBar, PermissionWrapper, PortalUnifiedDropdown } from '../../../components/Common';
import { useRoleManagement } from '../../../hooks/useRoleManagement';
import { PERMISSION_IDS } from '../../../constants/permissionIds';

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
    <PortalUnifiedDropdown
      align="end"
      className="table-dropdown"
      placement="bottom-end"
      trigger={{
        variant: 'light',
        className: 'btn btn-light btn-sm border-0',
        children: <ThreeDotsVertical size={16} />
      }}
      items={[
        {
          label: 'View Details',
          icon: <Eye />,
          onClick: () => handleView(role),
          permission: PERMISSION_IDS.VIEW_ROLE_IN_DETAIL
        },
        {
          label: 'Edit Role',
          icon: <Pencil />,
          onClick: () => handleEdit(role),
          permission: PERMISSION_IDS.UPDATE_ROLE
        },
        // Only show disable/enable option if role is not administrator
        ...(role.name.toUpperCase() !== 'ADMINISTRATOR' ? [
          { type: 'divider' },
          {
            label: role.status === 'Active' ? 'Disable Role' : 'Enable Role',
            icon: <PersonX />,
            className: role.status === 'Active' ? 'text-warning' : 'text-success',
            onClick: () => handleDisableClick(role),
            permission: PERMISSION_IDS.DISABLE_ROLE
          }
        ] : [])
      ]}
    />
  );

  // Show error toast when error state changes
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Container fluid className="py-4 role-management-page">

      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
           
            <Col xs={12} className="mt-2 mt-md-0 mb-3">
              <div className="d-flex justify-content-end">
                <PermissionWrapper 
                  permission={PERMISSION_IDS.CREATE_ROLE}
                  fallback={null}
                >
                  <Button
                    variant="primary-custom"
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
          <Row className="mb-3 form-mobile-stack search-filter-section">
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
