import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { X, Pencil } from 'react-bootstrap-icons';

const EditTrainerModal = ({ show, onClose, onSave, trainer, loading = false }) => {
  const [formData, setFormData] = useState({
    roleInSubject: 'EXAMINER'
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (trainer && show) {
      // Only allow EXAMINER or ASSESSMENT_REVIEWER (backend validation)
      const validRole = (trainer.role === 'EXAMINER' || trainer.role === 'ASSESSMENT_REVIEWER') 
        ? trainer.role 
        : 'EXAMINER';
      setFormData({
        roleInSubject: validRole
      });
      setErrors([]);
    }
  }, [trainer, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.roleInSubject) {
      newErrors.push('Role in assessment is required');
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
      await onSave(formData);
      handleClose();
    } catch (error) {
    }
  };

  const handleClose = () => {
    setFormData({
      roleInSubject: 'EXAMINER'
    });
    setErrors([]);
    onClose();
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
                  value={trainer?.name || ''}
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
                <Form.Label>Role in Assessment *</Form.Label>
                <Form.Select
                  name="roleInSubject"
                  value={formData.roleInSubject}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="EXAMINER">Examiner - Conducts exams and assessments</option>
                  <option value="ASSESSMENT_REVIEWER">Assessment Reviewer - Reviews and grades assessments</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Select the appropriate role for this trainer in assessments (EXAMINER or ASSESSMENT_REVIEWER only)
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

export default EditTrainerModal;
