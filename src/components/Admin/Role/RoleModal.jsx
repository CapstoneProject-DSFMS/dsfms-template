import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Button, Row, Col, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { X, Save, Eye, Shield, ChevronDown, ChevronRight, ExclamationTriangle } from 'react-bootstrap-icons';
import { useAllPermissions } from '../../../hooks/usePermissions';
import { isBaseRole } from '../../../utils/roleUtils';

const RoleModal = ({ show, role, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // Use all permissions hook to get ALL permissions in the system
  const { 
    allPermissions,
    loading: permissionsLoading, 
    error: permissionsError,
    fetchAllPermissions
  } = useAllPermissions();

  // Create permission groups from allPermissions
  const getPermissionGroups = useMemo(() => {
    if (!allPermissions || allPermissions.length === 0) return [];
    
    const featureGroups = {};
    
    // Group permissions by module
    allPermissions.forEach(permission => {
      const moduleId = permission.module;
      const moduleName = permission.viewModule || `${permission.module} Management`;
      
      if (!featureGroups[moduleId]) {
        featureGroups[moduleId] = {
          id: moduleId,
          name: moduleName,
          description: `Manage ${moduleName.toLowerCase()} related permissions`,
          permissions: []
        };
      }
      
      // Extract permission ID - support multiple formats
      // From useAllPermissions, permissions are created with id: permission.permissionId
      const permissionId = permission.id || permission.permissionId;
      
      if (!permissionId) {
        return; // Skip permissions without ID
      }
      
      featureGroups[moduleId].permissions.push({
        id: permissionId,
        title: permission.viewName || permission.name,
        description: permission.description || '',
        isActive: permission.isActive,
        method: permission.method,
        path: permission.path
      });
    });

    // Sort groups by module name
    return Object.values(featureGroups).sort((a, b) => a.name.localeCompare(b.name));
  }, [allPermissions]);

  // Get permission groups for current mode using useMemo to prevent infinite loops
  const permissionGroups = useMemo(() => {
    const allGroups = getPermissionGroups;
    
    if (mode === 'view' && role?.permissions) {
      // View mode: only show permissions assigned to the role
      const assignedPermissionIds = role.permissions.map(p => p.id || p);
      
      return allGroups.map(group => ({
        ...group,
        permissions: group.permissions.filter(permission => 
          assignedPermissionIds.includes(permission.id)
        )
      })).filter(group => group.permissions.length > 0);
    }
    
    // Add/Edit mode: show all permissions (no filtering)
    return allGroups;
  }, [getPermissionGroups, mode, role?.permissions]);

  useEffect(() => {
    if (role && mode !== 'add') {
      // For both view and edit mode, use the role's assigned permissions
      const rolePermissions = role.permissions ? role.permissions.map(p => p.id || p) : [];
      
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissionIds: rolePermissions
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        description: '',
        permissionIds: []
      });
    }
    setErrors({});
  }, [role, mode, show]);

  // Fetch all permissions when modal opens
  useEffect(() => {
    if (show) {
      fetchAllPermissions();
    }
  }, [show, fetchAllPermissions]);

  // Separate useEffect for expanded groups to avoid infinite loop
  useEffect(() => {
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
  }, [mode, permissionGroups]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (!/^[a-zA-Z0-9\s_]+$/.test(formData.name.trim())) {
      newErrors.name = 'Role name cannot contain special characters';
    }

    if (formData.permissionIds.length === 0) {
      newErrors.permissionIds = 'At least one permission is required';
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
    // Validate permissionId
    if (!permissionId || permissionId === null || permissionId === undefined) {
      return;
    }
    
    setFormData(prev => {
      const currentIds = prev.permissionIds || [];
      // Use strict comparison and handle type coercion
      const isSelected = currentIds.some(id => String(id) === String(permissionId));
      
      return {
        ...prev,
        permissionIds: isSelected
          ? currentIds.filter(p => String(p) !== String(permissionId))
          : [...currentIds, permissionId]
      };
    });
    
    // Clear error when permissions are selected
    if (errors.permissionIds) {
      setErrors(prev => ({
        ...prev,
        permissionIds: ''
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
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Base role warning */}
          {role && isBaseRole(role.name) && mode === 'edit' && (
            <Alert variant="warning" className="mb-3">
              <ExclamationTriangle className="me-2" />
              <strong>Base Role Warning:</strong> This role cannot be modified.
            </Alert>
          )}

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
              <Form.Group className="mb-3">
                <Row className="align-items-center">
                  <Col md={2}>
                    <Form.Label className="text-primary-custom fw-semibold fs-6 mb-0">
                      Role Name *
                    </Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      size="sm"
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
                        borderWidth: '1px'
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
              <Form.Group className="mb-3">
                <Row className="align-items-start">
                  <Col md={2}>
                    <Form.Label className="text-primary-custom fw-semibold fs-6 mb-0">
                      Description
                    </Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      size="sm"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="Enter role description (optional)"
                      style={{
                        borderColor: 'var(--bs-primary)',
                        borderWidth: '1px',
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
                {errors.permissionIds && (
                  <div className="text-danger small mb-2">{errors.permissionIds}</div>
                )}
                
                {permissionsError && (
                  <div className="text-danger small mb-2">
                    Error loading permissions: {permissionsError.message || 'Unknown error'}
                  </div>
                )}
                
                <div className="border rounded p-4 bg-light" style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  borderColor: 'var(--bs-primary)',
                  borderWidth: '2px'
                }}>
                  {permissionsLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading permissions...
                    </div>
                  ) : permissionGroups.length > 0 ? (
                    <>
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
                            {isExpanded && group.permissions.length > 0 && (
                              <div className="ms-3 mt-2">
                                <ListGroup variant="flush">
                                  {group.permissions.map((permission) => {
                                    // Ensure we have a valid permission ID
                                    const permissionId = permission.id;
                                    
                                    if (!permissionId) {
                                      return null; // Skip rendering if no ID
                                    }
                                    
                                    return (
                                      <ListGroup.Item
                                        key={`${group.id}-${permissionId}`}
                                        className="border-0 px-0 py-2 permission-item"
                                      >
                                        <div className="d-flex align-items-center">
                                          <div className="form-check me-3">
                                            <input
                                              type="checkbox"
                                              className="form-check-input"
                                              id={`permission-${permissionId}`}
                                              checked={formData.permissionIds.some(id => String(id) === String(permissionId))}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                if (!isReadOnly && permissionId) {
                                                  handlePermissionToggle(permissionId);
                                                }
                                              }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                              }}
                                              disabled={isReadOnly}
                                              style={{ 
                                                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                                                width: '1.25rem',
                                                height: '1.25rem'
                                              }}
                                            />
                                          </div>
                                          <div className="flex-grow-1">
                                            <div className="fw-medium text-dark">
                                              {permission.title}
                                            </div>
                                            <small className="text-muted">
                                              {permission.description}
                                            </small>
                                          </div>
                                          {!isReadOnly && formData.permissionIds.some(id => String(id) === String(permissionId)) && (
                                            <Badge bg="primary" className="ms-2">
                                              Selected
                                            </Badge>
                                          )}
                                        </div>
                                      </ListGroup.Item>
                                    );
                                  })}
                                </ListGroup>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      No permissions available
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <small className="text-muted">
                    {formData.permissionIds.length} of {permissionGroups.reduce((total, group) => total + group.permissions.length, 0)} permissions assigned
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
                      <div className="fw-medium">{formData.permissionIds.length}</div>
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
              variant="primary-custom"
              type="submit"
              disabled={isSubmitting || (role && isBaseRole(role.name))}
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
