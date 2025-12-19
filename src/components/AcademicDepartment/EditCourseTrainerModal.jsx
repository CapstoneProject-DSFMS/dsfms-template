import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { X, Pencil } from 'react-bootstrap-icons';

const EditCourseTrainerModal = ({ show, onClose, onSave, trainer, loading = false }) => {
  const [formData, setFormData] = useState({
    roleInCourse: []
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (trainer && show) {
      // roleInCourse is an array, use first role or default to EXAMINER
      const currentRoles = trainer.roleInCourse && Array.isArray(trainer.roleInCourse) 
        ? trainer.roleInCourse 
        : (trainer.roleInCourse ? [trainer.roleInCourse] : ['EXAMINER']);
      
      // Only allow EXAMINER or ASSESSMENT_REVIEWER (backend validation)
      const validRole = (currentRoles[0] === 'EXAMINER' || currentRoles[0] === 'ASSESSMENT_REVIEWER') 
        ? currentRoles[0] 
        : 'EXAMINER';
      
      setFormData({
        roleInCourse: currentRoles.length > 0 ? [validRole] : ['EXAMINER']
      });
      setErrors([]);
    }
  }, [trainer, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert single select to array format
    setFormData(prev => ({
      ...prev,
      [name]: [value] // Backend might expect array or single value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.roleInCourse || formData.roleInCourse.length === 0) {
      newErrors.push('Role in course is required');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Send single role or array depending on backend expectation
      const roleData = {
        roleInCourse: formData.roleInCourse[0] || formData.roleInCourse
      };
      await onSave(roleData);
      handleClose();
    } catch (error) {
    }
  };

  const handleClose = () => {
    setFormData({
      roleInCourse: ['EXAMINER']
    });
    setErrors([]);
    onClose();
  };

  const getFullName = (trainer) => {
    if (!trainer) return '';
    if (trainer.name) return trainer.name;
    return `${trainer.lastName || ''}${trainer.middleName ? ' ' + trainer.middleName : ''} ${trainer.firstName || ''}`.trim();
  };

  const getCurrentRole = () => {
    if (formData.roleInCourse && formData.roleInCourse.length > 0) {
      return formData.roleInCourse[0];
    }
    return 'EXAMINER';
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Pencil className="me-2" size={20} />
          Edit Trainer
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4">
        {errors.length > 0 && (
          <Alert variant="danger" className="mb-3">
            <ul className="mb-0">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Trainer Information (Read-only) */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Trainer Name</Form.Label>
                <Form.Control
                  type="text"
                  value={getFullName(trainer)}
                  disabled={true}
                  className="bg-light"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>EID</Form.Label>
                <Form.Control
                  type="text"
                  value={trainer?.eid || ''}
                  disabled={true}
                  className="bg-light"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Role in Course *</Form.Label>
                <Form.Select
                  name="roleInCourse"
                  value={getCurrentRole()}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="EXAMINER">Examiner - Conducts exams and assessments</option>
                  <option value="ASSESSMENT_REVIEWER">Assessment Reviewer - Reviews and grades assessments</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Select the appropriate role for this trainer in the course (EXAMINER or ASSESSMENT_REVIEWER only)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose} 
          disabled={loading}
        >
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <Pencil className="me-2" size={16} />
              Save Changes
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCourseTrainerModal;

