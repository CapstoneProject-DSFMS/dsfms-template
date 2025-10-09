import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { X, Plus } from 'react-bootstrap-icons';

const AddTrainerModal = ({ show, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    trainer_user_id: '',
    role_in_subject: 'ASSISTANT_INSTRUCTOR'
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (show) {
      // Reset form when modal opens
      setFormData({
        trainer_user_id: '',
        role_in_subject: 'ASSISTANT_INSTRUCTOR'
      });
      setErrors([]);
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.trainer_user_id) {
      newErrors.push('Please select a trainer');
    }
    
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
      trainer_user_id: '',
      role_in_subject: 'ASSISTANT_INSTRUCTOR'
    });
    setErrors([]);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Plus className="me-2" size={20} />
          Add Trainer
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
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Trainer *</Form.Label>
                <Form.Select
                  name="trainer_user_id"
                  value={formData.trainer_user_id}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="">Choose a trainer...</option>
                  <option value="550e8400-e29b-41d4-a716-446655440100">John Smith - Safety Basics</option>
                  <option value="550e8400-e29b-41d4-a716-446655440101">Sarah Johnson - Safety Procedures</option>
                  <option value="550e8400-e29b-41d4-a716-446655440102">Mike Davis - Evacuation Procedures</option>
                  <option value="550e8400-e29b-41d4-a716-446655440103">Lisa Wilson - Emergency Exits</option>
                  <option value="550e8400-e29b-41d4-a716-446655440104">David Brown - Passenger Safety</option>
                  <option value="550e8400-e29b-41d4-a716-446655440105">Emily Taylor - CPR & First Aid</option>
                  <option value="550e8400-e29b-41d4-a716-446655440106">Robert Anderson - Fire Prevention</option>
                  <option value="550e8400-e29b-41d4-a716-446655440107">Jennifer Martinez - Fire Detection</option>
                  <option value="550e8400-e29b-41d4-a716-446655440108">Captain James Wilson - Emergency Response</option>
                  <option value="550e8400-e29b-41d4-a716-446655440109">Captain Maria Garcia - Crisis Management</option>
                </Form.Select>
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
              Adding...
            </>
          ) : (
            <>
              <Plus className="me-2" size={16} />
              Add Trainer
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddTrainerModal;
