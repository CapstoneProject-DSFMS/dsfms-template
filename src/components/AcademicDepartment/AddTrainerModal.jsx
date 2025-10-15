import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { X, Plus } from 'react-bootstrap-icons';
import { userAPI } from '../../api/user';

const AddTrainerModal = ({ show, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    trainer_user_id: '',
    role_in_subject: 'ASSISTANT_INSTRUCTOR'
  });
  const [errors, setErrors] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  // Load trainers from API
  const loadTrainers = async () => {
    setLoadingTrainers(true);
    try {
      const response = await userAPI.getTrainers();
      if (response && response.data) {
        setTrainers(response.data);
      } else {
        setTrainers([]);
      }
    } catch (error) {
      setTrainers([]);
    } finally {
      setLoadingTrainers(false);
    }
  };

  useEffect(() => {
    if (show) {
      // Reset form when modal opens
      setFormData({
        trainer_user_id: '',
        role_in_subject: 'ASSISTANT_INSTRUCTOR'
      });
      setErrors([]);
      // Load trainers when modal opens
      loadTrainers();
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
                  disabled={loading || loadingTrainers}
                >
                  <option value="">
                    {loadingTrainers ? 'Loading trainers...' : 'Choose a trainer...'}
                  </option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.firstName} {trainer.lastName} - {trainer.department?.name || 'General'}
                    </option>
                  ))}
                </Form.Select>
                {loadingTrainers && (
                  <div className="mt-2 text-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <small className="text-muted">Loading trainers...</small>
                  </div>
                )}
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
                  <option value="PRIMARY_INSTRUCTOR">Primary Instructor - Main course instructor</option>
                  <option value="EXAMINER">Examiner - Conducts exams and assessments</option>
                  <option value="ASSESSMENT_REVIEWER">Assessment Reviewer - Reviews and grades assessments</option>
                  <option value="ASSISTANT_INSTRUCTOR">Assistant Instructor - Supports primary instructor</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Select the appropriate role for this trainer in the subject
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
              <span 
                className="spinner-border spinner-border-sm me-2" 
                role="status" 
                aria-hidden="true"
                style={{ width: '0.75rem', height: '0.75rem' }}
              ></span>
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
