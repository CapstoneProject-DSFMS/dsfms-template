import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner, Dropdown } from 'react-bootstrap';
import { X, Plus } from 'react-bootstrap-icons';
import { userAPI } from '../../api/user';

const AddTrainerModal = ({ show, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    trainer_user_id: '',
    role_in_subject: 'EXAMINER'
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
        role_in_subject: 'EXAMINER'
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
      trainer_user_id: '',
      role_in_subject: 'EXAMINER'
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
                <Dropdown onSelect={(trainerId) => {
                  setFormData(prev => ({
                    ...prev,
                    trainer_user_id: trainerId || ''
                  }));
                }}>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    className="w-100 text-start d-flex justify-content-between align-items-center"
                    disabled={loading || loadingTrainers}
                    style={{
                      border: '1px solid #ced4da',
                      backgroundColor: (loading || loadingTrainers) ? '#e9ecef' : '#fff',
                      minWidth: 0
                    }}
                  >
                    <span className="flex-grow-1 text-truncate" style={{ minWidth: 0, overflow: 'hidden' }}>
                      {formData.trainer_user_id
                        ? trainers.find(t => t.id === formData.trainer_user_id)
                          ? `${trainers.find(t => t.id === formData.trainer_user_id).firstName} ${trainers.find(t => t.id === formData.trainer_user_id).lastName} - ${trainers.find(t => t.id === formData.trainer_user_id).department?.name || 'General'}`
                          : 'Choose a trainer...'
                        : loadingTrainers
                          ? 'Loading trainers...'
                          : 'Choose a trainer...'}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="start"
                    className="w-100"
                    style={{
                      maxHeight: '250px',
                      overflowY: 'auto'
                    }}
                    popperConfig={{
                      modifiers: [
                        {
                          name: 'preventOverflow',
                          options: {
                            boundary: 'clippingParents',
                            padding: 8
                          }
                        },
                        {
                          name: 'flip',
                          options: {
                            fallbackPlacements: [],
                            boundary: 'clippingParents',
                            padding: 8
                          }
                        },
                        {
                          name: 'offset',
                          options: {
                            offset: [0, 4]
                          }
                        }
                      ]
                    }}
                  >
                    {loadingTrainers ? (
                      <Dropdown.Item disabled>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Loading trainers...
                      </Dropdown.Item>
                    ) : trainers.length === 0 ? (
                      <Dropdown.Item disabled>No trainers available</Dropdown.Item>
                    ) : (
                      trainers.map((trainer) => (
                        <Dropdown.Item
                          key={trainer.id}
                          eventKey={trainer.id}
                        >
                          {trainer.firstName} {trainer.lastName} - {trainer.department?.name || 'General'}
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>
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
                <Form.Label>Role in Assessment *</Form.Label>
                <Dropdown onSelect={(role) => {
                  setFormData(prev => ({
                    ...prev,
                    role_in_subject: role || 'EXAMINER'
                  }));
                }}>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    className="w-100 text-start d-flex justify-content-between align-items-center"
                    disabled={loading}
                    style={{
                      border: '1px solid #ced4da',
                      backgroundColor: loading ? '#e9ecef' : '#fff',
                      minWidth: 0
                    }}
                  >
                    <span className="flex-grow-1 text-truncate" style={{ minWidth: 0, overflow: 'hidden' }}>
                      {formData.role_in_subject === 'EXAMINER' && 'Examiner - Conducts exams and assessments'}
                      {formData.role_in_subject === 'ASSESSMENT_REVIEWER' && 'Assessment Reviewer - Reviews and grades assessments'}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="start"
                    className="w-100"
                    style={{
                      maxHeight: '250px',
                      overflowY: 'auto'
                    }}
                    popperConfig={{
                      modifiers: [
                        {
                          name: 'preventOverflow',
                          options: {
                            boundary: 'clippingParents',
                            padding: 8
                          }
                        },
                        {
                          name: 'flip',
                          options: {
                            fallbackPlacements: [],
                            boundary: 'clippingParents',
                            padding: 8
                          }
                        },
                        {
                          name: 'offset',
                          options: {
                            offset: [0, 4]
                          }
                        }
                      ]
                    }}
                  >
                    <Dropdown.Item eventKey="EXAMINER">
                      Examiner - Conducts exams and assessments
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="ASSESSMENT_REVIEWER">
                      Assessment Reviewer - Reviews and grades assessments
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
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
