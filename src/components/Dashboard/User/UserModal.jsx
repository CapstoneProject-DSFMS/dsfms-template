import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { X, Save, Eye } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const UserModal = ({ show, user, mode, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    email: '',
    phoneNumber: '',
    role: '',
    roleId: '',
    certificationNumber: '',
    specialization: '',
    yearsOfExperience: '',
    dateOfBirth: '',
    trainingBatch: '',
    passportNo: '',
    nation: '',
    department: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Flight Operations', 'Cabin Crew', 'Quality Assurance', 'Training', 'Engineering'];
      const roles = ['ADMINISTRATOR', 'DEPARTMENT_HEAD', 'TRAINER', 'TRAINEE', 'SQA_AUDITOR'];
  const nations = ['Vietnam', 'United States', 'United Kingdom', 'Japan', 'South Korea', 'Singapore', 'Thailand', 'Philippines', 'Malaysia', 'Indonesia'];

  useEffect(() => {
    if (user && mode !== 'add') {
      setFormData({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        address: user.address || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || '',
        roleId: user.roleId || '',
        certificationNumber: user.certificationNumber || '',
        specialization: user.specialization || '',
        yearsOfExperience: user.yearsOfExperience || '',
        dateOfBirth: user.dateOfBirth || '',
        trainingBatch: user.trainingBatch || '',
        passportNo: user.passportNo || '',
        nation: user.nation || '',
        department: user.department || ''
      });
    } else if (mode === 'add') {
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        email: '',
        phoneNumber: '',
        role: '',
        certificationNumber: '',
        specialization: '',
        yearsOfExperience: '',
        dateOfBirth: '',
        trainingBatch: '',
        passportNo: '',
        nation: '',
        department: ''
      });
    }
    setErrors({});
  }, [user, mode, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[0-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Department is not required for any role

    // Role-specific validation
    if (formData.role === 'TRAINER') {
      // Trainer-specific validations can be added here if needed
    }
    
    if (formData.role === 'TRAINEE') {
      // Trainee-specific validations can be added here if needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      // Error handling is done in the parent component
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
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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

          {/* Name Fields */}
          <Row>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  First Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  isInvalid={!!errors.firstName}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: errors.firstName ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Middle Name
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Last Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  isInvalid={!!errors.lastName}
                  readOnly={isReadOnly}
                  style={{
                    borderColor: errors.lastName ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Email */}
          <Row>
            <Col md={12}>
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

          {/* Phone Number */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Phone Number *
                </Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  isInvalid={!!errors.phoneNumber}
                  readOnly={isReadOnly}
                  placeholder="Enter phone number"
                  style={{
                    borderColor: errors.phoneNumber ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phoneNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Address */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Address (optional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  readOnly={isReadOnly}
                  placeholder="Enter address (optional)"
                  style={{
                    borderColor: 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Role and Department */}
          <Row>
            <Col md={(formData.role === 'DEPT_HEAD' || formData.role === 'TRAINER') ? 6 : 12}>
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

                {/* Only show Department field for DEPARTMENT_HEAD and TRAINER */}
                {(formData.role === 'DEPARTMENT_HEAD' || formData.role === 'TRAINER') && (
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-primary-custom fw-semibold">
                    Department
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
            )}
          </Row>

          {/* Role-specific fields */}
          {formData.role === 'TRAINER' && (
            <>
              {/* Trainer-specific fields */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Specialization
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="Enter specialization"
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
                      Certification Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.certificationNumber}
                      onChange={(e) => handleInputChange('certificationNumber', e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="Enter certification number"
                      style={{
                        borderColor: 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Years of Experience
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="Enter years of experience"
                      min="0"
                      style={{
                        borderColor: 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {formData.role === 'TRAINEE' && (
            <>
              {/* Trainee-specific fields */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Date of Birth
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
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
                      Training Batch
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.trainingBatch}
                      onChange={(e) => handleInputChange('trainingBatch', e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="Enter training batch"
                      style={{
                        borderColor: 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-primary-custom fw-semibold">
                      Passport No
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.passportNo}
                      onChange={(e) => handleInputChange('passportNo', e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="Enter passport number"
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
                      Nation
                    </Form.Label>
                    <Form.Select
                      value={formData.nation}
                      onChange={(e) => handleInputChange('nation', e.target.value)}
                      disabled={isReadOnly}
                      style={{
                        borderColor: 'var(--bs-primary)',
                        borderWidth: '2px'
                      }}
                    >
                      <option value="">Select a nation</option>
                      {nations.map(nation => (
                        <option key={nation} value={nation}>{nation}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

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
