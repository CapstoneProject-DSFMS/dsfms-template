import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { X, Save, Eye } from 'react-bootstrap-icons';

const UserModal = ({ show, user, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
  const roles = ['Admin', 'Manager', 'Employee', 'Guest'];

  useEffect(() => {
    if (user && mode !== 'add') {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        department: user.department || ''
      });
    } else if (mode === 'add') {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: '',
        department: ''
      });
    }
    setErrors({});
  }, [user, mode, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
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
      console.error('Error saving user:', error);
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

  const getModalTitle = () => {
    switch (mode) {
      case 'add':
        return 'Add New User';
      case 'edit':
        return 'Edit User';
      case 'view':
        return 'User Details';
      default:
        return 'User';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header 
        className="bg-gradient-primary-custom text-white border-0"
        closeButton
        closeVariant="white"
      >
        <Modal.Title className="d-flex align-items-center">
          {mode === 'view' ? <Eye className="me-2" size={20} /> : <Save className="me-2" size={20} />}
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
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Full Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  isInvalid={!!errors.fullName}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: errors.fullName ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fullName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Email *
                </Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  isInvalid={!!errors.email}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: errors.email ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Phone
                </Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Role *
                </Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  isInvalid={!!errors.role}
                  disabled={isReadOnly}
                  style={{
                    borderColor: errors.role ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.role}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Department *
                </Form.Label>
                <Form.Select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  isInvalid={!!errors.department}
                  disabled={isReadOnly}
                  style={{
                    borderColor: errors.department ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                >
                  <option value="">Select a department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.department}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {mode === 'view' && user && (
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label className="text-primary-custom fw-semibold">
                    Employee ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={user.eid}
                    readOnly
                    className="bg-light"
                    style={{
                      borderColor: 'var(--bs-neutral)'
                    }}
                  />
                </Form.Group>
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
                  {mode === 'add' ? 'Add User' : 'Save Changes'}
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
