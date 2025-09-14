import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, ListGroup, Badge } from 'react-bootstrap';
import { X, Save, Eye, Shield } from 'react-bootstrap-icons';

const RoleModal = ({ show, role, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    permissions: [],
    status: 'Active'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePermissions = [
    { id: 'read', label: 'Read', description: 'View data and information' },
    { id: 'write', label: 'Write', description: 'Create and modify data' },
    { id: 'delete', label: 'Delete', description: 'Remove data and records' },
    { id: 'manage_users', label: 'Manage Users', description: 'Add, edit, and remove users' },
    { id: 'manage_roles', label: 'Manage Roles', description: 'Create and modify roles' },
    { id: 'manage_team', label: 'Manage Team', description: 'Manage team members and assignments' },
    { id: 'view_reports', label: 'View Reports', description: 'Access system reports and analytics' },
    { id: 'system_settings', label: 'System Settings', description: 'Modify system configuration' }
  ];

  useEffect(() => {
    if (role && mode !== 'add') {
      setFormData({
        name: role.name || '',
        permissions: role.permissions || [],
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
                
                <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <ListGroup variant="flush">
                    {availablePermissions.map((permission) => (
                      <ListGroup.Item
                        key={permission.id}
                        className="border-0 px-0 py-2"
                        style={{ cursor: isReadOnly ? 'default' : 'pointer' }}
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
                
                <div className="mt-2">
                  <small className="text-muted">
                    {formData.permissions.length} of {availablePermissions.length} permissions selected
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
