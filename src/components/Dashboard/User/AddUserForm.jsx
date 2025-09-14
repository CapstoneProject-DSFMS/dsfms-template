import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Save, X } from 'react-bootstrap-icons';

const AddUserForm = ({ onSave, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState({});

  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
  const roles = ['Admin', 'Manager', 'Employee', 'Guest'];

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

    try {
      await onSave(formData);
      // Reset form after successful save
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        status: 'Active'
      });
      setErrors({});
    } catch (error) {
      console.error('Error saving user:', error);
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

  return (
    <div className="p-4">
      <h5 className="text-primary-custom mb-4">Add New User</h5>
      
      <Form onSubmit={handleSubmit}>
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
                Full Name *
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                isInvalid={!!errors.fullName}
                style={{
                  borderColor: errors.fullName ? '#dc3545' : 'var(--bs-neutral)'
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fullName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="text-primary-custom fw-semibold">
                Email *
              </Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                isInvalid={!!errors.email}
                style={{
                  borderColor: errors.email ? '#dc3545' : 'var(--bs-neutral)'
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
            <Form.Group className="mb-3">
              <Form.Label className="text-primary-custom fw-semibold">
                Phone
              </Form.Label>
              <Form.Control
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  borderColor: 'var(--bs-neutral)'
                }}
              />
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
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="text-primary-custom fw-semibold">
                Role *
              </Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                isInvalid={!!errors.role}
                style={{
                  borderColor: errors.role ? '#dc3545' : 'var(--bs-neutral)'
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

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="text-primary-custom fw-semibold">
                Department *
              </Form.Label>
              <Form.Select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                isInvalid={!!errors.department}
                style={{
                  borderColor: errors.department ? '#dc3545' : 'var(--bs-neutral)'
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

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button
            variant="outline-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="me-2" size={16} />
            Cancel
          </Button>
          
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Adding...
              </>
            ) : (
              <>
                <Save className="me-2" size={16} />
                Add User
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddUserForm;
