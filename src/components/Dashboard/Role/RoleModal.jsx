import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, ListGroup, Badge } from 'react-bootstrap';
import { X, Save, Eye, Shield, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import { PERMISSIONS } from '../../../constants/permissions';

const RoleModal = ({ show, role, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    permissions: [],
    status: 'Active'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  const permissionGroups = [
    {
      id: 'authentication',
      name: 'Authentication & Access',
      description: 'User login and basic access permissions',
      permissions: [
        { id: PERMISSIONS.LOGIN, label: 'Login', description: 'Access to login system' },
        { id: PERMISSIONS.MANAGE_PROFILE, label: 'Manage Profile', description: 'Update user profile information' },
        { id: PERMISSIONS.RESET_PASSWORD, label: 'Reset Password', description: 'Reset user passwords' }
      ]
    },
    {
      id: 'user_management',
      name: 'User Management',
      description: 'Manage users and roles in the system',
      permissions: [
        { id: PERMISSIONS.MANAGE_USERS, label: 'Manage Users', description: 'Add, edit, and remove users' },
        { id: PERMISSIONS.MANAGE_ROLES, label: 'Manage Roles', description: 'Create and modify roles' }
      ]
    },
    {
      id: 'academic_management',
      name: 'Academic Management',
      description: 'Manage departments, courses, and training programs',
      permissions: [
        { id: PERMISSIONS.CREATE_DEPT, label: 'Create Department', description: 'Create new departments' },
        { id: PERMISSIONS.CREATE_COURSE, label: 'Create Course', description: 'Create new courses' },
        { id: PERMISSIONS.CREATE_SUBJECT, label: 'Create Subject', description: 'Create new subjects' },
        { id: PERMISSIONS.ENROLL_TRAINEE, label: 'Enroll Trainee', description: 'Enroll trainees in courses' },
        { id: PERMISSIONS.TRACK_PROGRESS, label: 'Track Progress', description: 'Track training progress' }
      ]
    },
    {
      id: 'form_management',
      name: 'Form Management',
      description: 'Create and manage forms and templates',
      permissions: [
        { id: PERMISSIONS.VIEW_TEMPLATES, label: 'View Templates', description: 'View form templates' },
        { id: PERMISSIONS.CREATE_TEMPLATE, label: 'Create Template', description: 'Create new form templates' },
        { id: PERMISSIONS.CREATE_FORM, label: 'Create Form', description: 'Create new forms' },
        { id: PERMISSIONS.MANAGE_FORMS, label: 'Manage Forms', description: 'Manage existing forms' },
        { id: PERMISSIONS.FILL_ASSESSMENT, label: 'Fill Assessment', description: 'Fill assessment forms' },
        { id: PERMISSIONS.LOCK_FORM, label: 'Lock Form', description: 'Lock forms from editing' },
        { id: PERMISSIONS.APPROVE_ASSESSMENT, label: 'Approve Assessment', description: 'Approve assessment forms' },
        { id: PERMISSIONS.EXPORT_PDF, label: 'Export PDF', description: 'Export forms to PDF' }
      ]
    },
    {
      id: 'audit_management',
      name: 'Audit Management',
      description: 'Conduct audits and manage findings',
      permissions: [
        { id: PERMISSIONS.FILL_AUDIT, label: 'Fill Audit', description: 'Fill audit forms' },
        { id: PERMISSIONS.CREATE_FINDING, label: 'Create Finding', description: 'Create audit findings' }
      ]
    },
    {
      id: 'car_management',
      name: 'Corrective Action Request (CAR)',
      description: 'Manage corrective action requests',
      permissions: [
        { id: PERMISSIONS.CREATE_CAR, label: 'Create CAR', description: 'Create Corrective Action Requests' },
        { id: PERMISSIONS.TRACK_CAR, label: 'Track CAR', description: 'Track CAR progress' },
        { id: PERMISSIONS.MANAGE_CAR_DEPT, label: 'Manage CAR Department', description: 'Manage department CARs' },
        { id: PERMISSIONS.CLOSE_CAR, label: 'Close CAR', description: 'Close Corrective Action Requests' }
      ]
    },
    {
      id: 'reporting',
      name: 'Reporting & Analytics',
      description: 'Generate reports and view analytics',
      permissions: [
        { id: PERMISSIONS.SUBMIT_REPORT, label: 'Submit Report', description: 'Submit reports' },
        { id: PERMISSIONS.MANAGE_REPORT, label: 'Manage Report', description: 'Manage reports' },
        { id: PERMISSIONS.VIEW_ANALYTICS, label: 'View Analytics', description: 'View system analytics' }
      ]
    },
    {
      id: 'system_configuration',
      name: 'System Configuration',
      description: 'Configure system settings and parameters',
      permissions: [
        { id: PERMISSIONS.SMTP_CONFIG, label: 'SMTP Configuration', description: 'Configure email settings' }
      ]
    }
  ];

  useEffect(() => {
    if (role && mode !== 'add') {
      setFormData({
        name: role.name || '',
        permissions: role.permissions || [], // This should already be an array of permission IDs
        status: role.status || 'Active'
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        permissions: [],
        status: 'Active'
      });
    }
    setErrors({});
  }, [role, mode, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
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

  const handleSelectAllInGroup = (groupPermissions) => {
    const groupPermissionIds = groupPermissions.map(p => p.id);
    const allSelected = groupPermissionIds.every(id => formData.permissions.includes(id));
    
    if (allSelected) {
      // Deselect all permissions in this group
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !groupPermissionIds.includes(id))
      }));
    } else {
      // Select all permissions in this group
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...groupPermissionIds])]
      }));
    }
    
    // Clear error when permissions are selected
    if (errors.permissions) {
      setErrors(prev => ({
        ...prev,
        permissions: ''
      }));
    }
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
            <Alert variant="danger" className="mb-3">
              <strong>Please fix the following errors:</strong>
              <ul className="mb-0 mt-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Role Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: errors.name ? '#dc3545' : 'var(--bs-neutral)'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Status
                </Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={isReadOnly}
                  style={{
                    borderColor: 'var(--bs-neutral)'
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Permissions *
                </Form.Label>
                {errors.permissions && (
                  <div className="text-danger small mb-2">{errors.permissions}</div>
                )}
                
                <div className="border rounded p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {/* Debug info */}
                  {mode === 'edit' && (
                    <div className="mb-2 p-2 bg-light rounded">
                      <small className="text-muted">
                        Debug: Role permissions = {JSON.stringify(formData.permissions)}
                      </small>
                    </div>
                  )}
                  
                  {permissionGroups.map((group) => {
                    const isExpanded = expandedGroups[group.id];
                    const groupPermissionIds = group.permissions.map(p => p.id);
                    const selectedInGroup = groupPermissionIds.filter(id => formData.permissions.includes(id));
                    const allSelected = selectedInGroup.length === groupPermissionIds.length;
                    const someSelected = selectedInGroup.length > 0 && selectedInGroup.length < groupPermissionIds.length;
                    
                    return (
                      <div key={group.id} className="mb-3">
                        {/* Group Header */}
                        <div 
                          className={`d-flex align-items-center justify-content-between p-2 bg-light rounded permission-group-header ${!isReadOnly ? 'cursor-pointer' : ''}`}
                          onClick={() => !isReadOnly && handleGroupToggle(group.id)}
                        >
                          <div className="d-flex align-items-center">
                            {!isReadOnly && (
                              isExpanded ? <ChevronDown className="me-2" size={16} /> : <ChevronRight className="me-2" size={16} />
                            )}
                            <div>
                              <div className="fw-semibold text-primary-custom">
                                {group.name}
                              </div>
                              <small className="text-muted">
                                {group.description}
                              </small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            {!isReadOnly && (
                              <Form.Check
                                type="checkbox"
                                checked={allSelected}
                                ref={input => {
                                  if (input) input.indeterminate = someSelected;
                                }}
                                onChange={() => handleSelectAllInGroup(group.permissions)}
                                className="me-2"
                                style={{ pointerEvents: 'auto' }}
                              />
                            )}
                            <Badge bg={allSelected ? 'success' : someSelected ? 'warning' : 'secondary'} className="ms-2">
                              {selectedInGroup.length}/{groupPermissionIds.length}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Group Permissions */}
                        {isExpanded && (
                          <div className="ms-3 mt-2">
                            <ListGroup variant="flush">
                              {group.permissions.map((permission) => (
                                <ListGroup.Item
                                  key={permission.id}
                                  className={`border-0 px-0 py-2 permission-item ${!isReadOnly ? 'cursor-pointer' : ''}`}
                                  onClick={() => !isReadOnly && handlePermissionToggle(permission.id)}
                                >
                                  <div className="d-flex align-items-center">
                                    <Form.Check
                                      type="checkbox"
                                      checked={formData.permissions.includes(permission.id)}
                                      onChange={() => handlePermissionToggle(permission.id)}
                                      disabled={isReadOnly}
                                      className="me-3"
                                      style={{ pointerEvents: isReadOnly ? 'none' : 'auto' }}
                                    />
                                    <div className="flex-grow-1">
                                      <div className="fw-medium text-dark">
                                        {permission.label}
                                      </div>
                                      <small className="text-muted">
                                        {permission.description}
                                      </small>
                                    </div>
                                    {formData.permissions.includes(permission.id) && (
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
                </div>
                
                <div className="mt-2">
                  <small className="text-muted">
                    {formData.permissions.length} of {permissionGroups.reduce((total, group) => total + group.permissions.length, 0)} permissions selected
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
                      <div className="fw-medium">{role.assignedUsers}</div>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Total Permissions:</small>
                      <div className="fw-medium">{role.permissions?.length || 0}</div>
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
