    import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { X, Save, Eye } from 'react-bootstrap-icons';

const DepartmentModal = ({ show, department, mode, onSave, onClose, availableUsers }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    departmentHeadId: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (department && mode !== 'add') {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
        departmentHeadId: department.departmentHeadId || ''
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        code: '',
        description: '',
        departmentHeadId: ''
      });
    }
    setErrors({});
  }, [department, mode, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Department name must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Department name cannot contain special characters';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    }


    if (!formData.departmentHeadId) {
      newErrors.departmentHeadId = 'Department head is required';
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
      const departmentData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        headUserId: formData.departmentHeadId
      };
      
      console.log('🔍 Department data being sent:', departmentData);
      await onSave(departmentData);
    } catch (error) {
      console.error('Error saving department:', error);
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
        return 'Add New Department';
      case 'edit':
        return 'Edit Department';
      case 'view':
        return 'Department Details';
      default:
        return 'Department';
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

          {/* Department Name and Code */}
          <Row>
            <Col md={8}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Department Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                  readOnly={isReadOnly}
                  placeholder="Enter department name"
                  style={{
                    borderColor: errors.name ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Department Code *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  isInvalid={!!errors.code}
                  readOnly={isReadOnly}
                  placeholder="e.g., CCT"
                  style={{
                    borderColor: errors.code ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>


          {/* Department Head */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Department Head *
                </Form.Label>
                <Form.Select
                  value={formData.departmentHeadId}
                  onChange={(e) => handleInputChange('departmentHeadId', e.target.value)}
                  isInvalid={!!errors.departmentHeadId}
                  disabled={isReadOnly}
                  style={{
                    borderColor: errors.departmentHeadId ? '#dc3545' : 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                >
                  {formData.departmentHeadId && availableUsers.find(u => u.id === formData.departmentHeadId) ? (
                    <option value={formData.departmentHeadId}>
                      {availableUsers.find(u => u.id === formData.departmentHeadId) && (() => {
                        const currentHead = availableUsers.find(u => u.id === formData.departmentHeadId);
                        return `${currentHead.lastName}${currentHead.middleName ? ' ' + currentHead.middleName : ''} ${currentHead.firstName}`;
                      })()}
                    </option>
                  ) : (
                    <option value="">Select department head</option>
                  )}
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.lastName}{user.middleName ? ' ' + user.middleName : ''} {user.firstName} ({user.eid})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.departmentHeadId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Description */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Form.Label className="text-primary-custom fw-semibold">
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  readOnly={isReadOnly}
                  placeholder="Enter department description (optional)"
                  style={{
                    borderColor: 'var(--bs-primary)',
                    borderWidth: '2px'
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* View mode - show additional info */}
          {mode === 'view' && department && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-primary-custom fw-semibold">
                    Courses Count
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={department.coursesCount || 0}
                    readOnly
                    className="bg-light"
                    style={{
                      borderColor: 'var(--bs-neutral)'
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-primary-custom fw-semibold">
                    Trainees Count
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={department.traineesCount || 0}
                    readOnly
                    className="bg-light"
                    style={{
                      borderColor: 'var(--bs-neutral)'
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-primary-custom fw-semibold">
                    Trainers Count
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={department.trainersCount || 0}
                    readOnly
                    className="bg-light"
                    style={{
                      borderColor: 'var(--bs-neutral)'
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-primary-custom fw-semibold">
                    Created Date
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={new Date(department.createdAt).toLocaleDateString()}
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
              variant="primary-custom"
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
                  {mode === 'add' ? 'Add Department' : 'Save Changes'}
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DepartmentModal;
