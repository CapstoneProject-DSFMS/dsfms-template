import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { X, Save, Eye, Shield, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import { usePermissions } from '../../../hooks/usePermissions';

const RoleModal = ({ show, role, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // Use permissions hook to get API data
  const { 
    getPermissionGroups, 
    loading: permissionsLoading, 
    error: permissionsError,
    isPermissionActive 
  } = usePermissions();

  // Get permission groups for current mode
  const getPermissionGroupsForMode = (selectedRole, mode) => {
    const allGroups = getPermissionGroups();
    
    if (mode === 'view' && selectedRole && role?.permissions) {
      // View mode: only show permissions assigned to the role
      const assignedPermissionIds = role.permissions.map(p => p.id || p);
      
      return allGroups.map(group => ({
        ...group,
        permissions: group.permissions.filter(permission => 
          assignedPermissionIds.includes(permission.id)
        )
      })).filter(group => group.permissions.length > 0);
    }
    
    // Add/Edit mode: show all permissions
    return allGroups;
  };

  const permissionGroups = getPermissionGroupsForMode(role?.name, mode);

  useEffect(() => {
    if (role && mode !== 'add') {
      // For both view and edit mode, use the role's assigned permissions
      const rolePermissions = role.permissions ? role.permissions.map(p => p.id || p) : [];
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: rolePermissions
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setErrors({});
    
    // Set expanded groups based on mode
    if (mode === 'view') {
      // In view mode, expand all groups by default
      const allGroupsExpanded = {};
      const allModuleIds = permissionGroups.map(group => group.id);
      allModuleIds.forEach(moduleId => {
        allGroupsExpanded[moduleId] = true;
      });
      setExpandedGroups(allGroupsExpanded);
    } else if (mode === 'edit') {
      // In edit mode, expand all groups by default to show all permissions
      const allGroupsExpanded = {};
      const allModuleIds = permissionGroups.map(group => group.id);
      allModuleIds.forEach(moduleId => {
        allGroupsExpanded[moduleId] = true;
      });
      setExpandedGroups(allGroupsExpanded);
    } else {
      // In add mode, start with all groups collapsed
      setExpandedGroups({});
    }
  }, [role, mode, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (!/^[a-zA-Z0-9\s_]+$/.test(formData.name.trim())) {
      newErrors.name = 'Role name cannot contain special characters';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
    
    // Clear error when permissions are selected
    if (errors.permissions) {
      setErrors(prev => ({
        ...prev,
        permissions: ''
      }));
    }
  };

  const handleGroupToggle = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };


  const getModalTitle = () => {
    switch (mode) {
      case 'add':
        return 'Add New Role';
      case 'edit':
        return 'Edit Role';
      case 'view':
        return 'Role Details';
      default:
        return 'Role';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header 
        className="bg-primary-custom text-white border-0"
        closeButton
        closeVariant="white"
      >
        <Modal.Title className="d-flex align-items-center">
          {mode === 'view' ? <Eye className="me-2" size={20} /> : <Shield className="me-2" size={20} />}
          {getModalTitle()}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {Object.keys(errors).length > 0 && (
            <div className="alert alert-danger mb-3">
              <strong>Please fix the following errors:</strong>
              <ul className="mb-0 mt-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Row className="align-items-center">
                  <Col md={3}>
                    <Form.Label className="text-primary-custom fw-semibold fs-5 mb-0">
                      Role Name *
                    </Form.Label>
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow alphanumeric characters, spaces, and underscores
                        if (/^[a-zA-Z0-9\s_]*$/.test(value)) {
                          handleInputChange('name', value);
                        }
                      }}
                      isInvalid={!!errors.name}
                      readOnly={isReadOnly}
                      style={{
                        borderColor: errors.name ? '#dc3545' : 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Row className="align-items-start">
                  <Col md={3}>
                    <Form.Label className="text-primary-custom fw-semibold fs-5 mb-0">
                      Description
                    </Form.Label>
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="Enter role description (optional)"
                      style={{
                        borderColor: 'var(--bs-primary)',
                        borderWidth: '2px',
                        resize: 'none'
                      }}
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold fs-5 mb-3">
                  Permissions *
                </Form.Label>
                {errors.permissions && (
                  <div className="text-danger small mb-2">{errors.permissions}</div>
                )}
                
                {permissionsError && (
                  <div className="text-danger small mb-2">
                    Error loading permissions: {permissionsError.message || 'Unknown error'}
                  </div>
                )}
                
                <div className="border rounded p-4 bg-light" style={{ 
                  maxHeight: '250px', 
                  overflowY: 'auto',
                  borderColor: 'var(--bs-primary)',
                  borderWidth: '2px'
                }}>
                  {permissionsLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading permissions...
                    </div>
                  ) : (
                    <>
                      {/* Debug info */}
                      {mode === 'edit' && (
                        <div className="mb-2 p-2 bg-light rounded">
                          <small className="text-muted">
                            Debug: Total permissions = {permissionGroups.reduce((total, group) => total + group.permissions.length, 0)} | 
                            Selected = {formData.permissions.length} | 
                            Groups = {permissionGroups.length}
                          </small>
                        </div>
                      )}
                      
                      {permissionGroups.map((group) => {
                    const isExpanded = expandedGroups[group.id];
                    
                    return (
                      <div key={group.id} className="mb-3">
                        {/* Feature Group Header */}
                        <div 
                          className={`d-flex align-items-center p-2 bg-light rounded permission-group-header ${!isReadOnly ? 'cursor-pointer' : ''}`}
                          onClick={() => !isReadOnly && handleGroupToggle(group.id)}
                          role={!isReadOnly ? "button" : undefined}
                          tabIndex={!isReadOnly ? 0 : undefined}
                          onKeyDown={!isReadOnly ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleGroupToggle(group.id);
                            }
                          } : undefined}
                          aria-expanded={!isReadOnly ? isExpanded : undefined}
                        >
                          <div className="d-flex align-items-center">
                            {!isReadOnly && (
                              isExpanded ? <ChevronDown className="me-2" size={16} /> : <ChevronRight className="me-2" size={16} />
                            )}
                            <div>
                              <div className="fw-bold text-primary-custom">
                                {group.name}
                              </div>
                              <small className="text-muted">
                                {group.description}
                              </small>
                            </div>
                          </div>
                        </div>
                        
                        {/* UC Items List */}
                        {isExpanded && (
                          <div className="ms-3 mt-2">
                            <ListGroup variant="flush">
                              {group.permissions.map((permission) => (
                                <ListGroup.Item
                                  key={permission.id}
                                  className={`border-0 px-0 py-2 permission-item ${!isReadOnly ? 'cursor-pointer' : ''}`}
                                  onClick={() => !isReadOnly && handlePermissionToggle(permission.id)}
                                  role={!isReadOnly ? "button" : undefined}
                                  tabIndex={!isReadOnly ? 0 : undefined}
                                  onKeyDown={!isReadOnly ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handlePermissionToggle(permission.id);
                                    }
                                  } : undefined}
                                >
                                  <div className="d-flex align-items-center">
                                    <Form.Check
                                      type="checkbox"
                                      id={`permission-${permission.id}`}
                                      checked={formData.permissions.includes(permission.id)}
                                      onChange={() => handlePermissionToggle(permission.id)}
                                      disabled={isReadOnly}
                                      className="me-3"
                                      style={{ pointerEvents: isReadOnly ? 'none' : 'auto' }}
                                      aria-label={`${permission.title}: ${permission.description}`}
                                    />
                                    <div className="flex-grow-1">
                                      <div className="fw-medium text-dark">
                                        {permission.title}
                                      </div>
                                      <small className="text-muted">
                                        {permission.description}
                                      </small>
                                    </div>
                                    {!isReadOnly && formData.permissions.includes(permission.id) && (
                                      <Badge bg="primary" className="ms-2">
                                        Selected
                                      </Badge>
                                    )}
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </div>
                        )}
                      </div>
                    );
                  })}
                    </>
                  )}
                </div>
                
                <div className="mt-2">
                  <small className="text-muted">
                    {formData.permissions.length} of {permissionGroups.reduce((total, group) => total + group.permissions.length, 0)} permissions assigned
                  </small>
                </div>
              </Form.Group>
            </Col>
          </Row>

          {mode === 'view' && role && (
            <Row>
              <Col>
                <div className="bg-light-custom p-3 rounded">
                  <h6 className="text-primary-custom mb-2">Role Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">Assigned Users:</small>
                      <div className="fw-medium">{role.assignedUsers || 0}</div>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Total Permissions:</small>
                      <div className="fw-medium">{formData.permissions.length}</div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 p-4">
          <Button
            variant="outline-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="me-2" size={16} />
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {mode !== 'view' && (
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="me-2" size={16} />
                  {mode === 'add' ? 'Add Role' : 'Save Changes'}
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RoleModal;
