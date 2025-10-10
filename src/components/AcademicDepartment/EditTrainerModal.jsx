import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { X, Pencil } from 'react-bootstrap-icons';

const EditTrainerModal = ({ show, onClose, onSave, trainer, loading = false }) => {
  const [formData, setFormData] = useState({
    role_in_subject: 'ASSISTANT_INSTRUCTOR'
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (trainer && show) {
      setFormData({
        role_in_subject: trainer.role_in_subject || 'ASSISTANT_INSTRUCTOR'
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
    
    if (!formData.role_in_subject) {
      newErrors.push('Role in subject is required');
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
      console.error('Error saving trainer:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      role_in_subject: 'ASSISTANT_INSTRUCTOR'
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
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={trainer?.email || ''}
                  disabled={true}
                  className="bg-light"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Specialization</Form.Label>
                <Form.Control
                  type="text"
                  value={trainer?.specialization || ''}
                  disabled={true}
                  className="bg-light"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role in Subject *</Form.Label>
                <Form.Select
                  name="role_in_subject"
                  value={formData.role_in_subject}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="LEAD_INSTRUCTOR">Lead Instructor</option>
                  <option value="ASSISTANT_INSTRUCTOR">Assistant Instructor</option>
                  <option value="SUPPORT_INSTRUCTOR">Support Instructor</option>
                </Form.Select>
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
