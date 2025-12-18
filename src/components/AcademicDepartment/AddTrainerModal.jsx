import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner, Dropdown } from 'react-bootstrap';
import { X, Plus } from 'react-bootstrap-icons';
import courseAPI from '../../api/course';

const AddTrainerModal = ({ show, onClose, onSave, loading = false, courseId = null }) => {
  const [formData, setFormData] = useState({
    trainer_user_id: '',
    role_in_subject: 'EXAMINER'
  });
  const [errors, setErrors] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  // Load trainers from API
  const loadTrainers = useCallback(async () => {
    setLoadingTrainers(true);
    try {
      let trainersList = [];
      
      try {
        const response = await courseAPI.getActiveTrainers();
        
        // Handle different response formats from active trainers API
        if (response) {
          // Format 1: { data: [...] }
          if (response.data && Array.isArray(response.data)) {
            trainersList = response.data;
          }
          // Format 2: { trainers: [...] }
          else if (response.trainers && Array.isArray(response.trainers)) {
            trainersList = response.trainers;
          }
          // Format 3: { data: { trainers: [...] } }
          else if (response.data && response.data.trainers && Array.isArray(response.data.trainers)) {
            trainersList = response.data.trainers;
          }
          // Format 4: Direct array
          else if (Array.isArray(response)) {
            trainersList = response;
          }
        }
      } catch (apiError) {
        console.error('Error loading active trainers:', apiError);
        trainersList = [];
      }
      
      setTrainers(Array.isArray(trainersList) ? trainersList : []);
    } catch (error) {
      console.error('Error loading trainers:', error);
      setTrainers([]);
    } finally {
      setLoadingTrainers(false);
    }
  }, []); // Removed courseId dependency since API no longer needs it

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
  }, [show, loadTrainers]); // Removed courseId dependency since API no longer needs it

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
      // Transform snake_case to camelCase for API
      const apiData = {
        trainerUserId: formData.trainer_user_id,
        roleInSubject: formData.role_in_subject
      };
      await onSave(apiData);
      handleClose();
    } catch (error) {
      // Error is handled by parent component via onSave callback
      console.error('Error saving trainer:', error);
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
                          ? trainers.find(t => t.id === formData.trainer_user_id).department?.name
                            ? `${trainers.find(t => t.id === formData.trainer_user_id).eid} - ${trainers.find(t => t.id === formData.trainer_user_id).firstName} ${trainers.find(t => t.id === formData.trainer_user_id).lastName} - ${trainers.find(t => t.id === formData.trainer_user_id).department.name}`
                            : `${trainers.find(t => t.id === formData.trainer_user_id).eid} - ${trainers.find(t => t.id === formData.trainer_user_id).firstName} ${trainers.find(t => t.id === formData.trainer_user_id).lastName}`
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
                    ) : !Array.isArray(trainers) || trainers.length === 0 ? (
                      <Dropdown.Item disabled>No trainers available</Dropdown.Item>
                    ) : (
                      trainers.map((trainer) => (
                        <Dropdown.Item
                          key={trainer.id}
                          eventKey={trainer.id}
                        >
                          {trainer.eid} - {trainer.firstName} {trainer.lastName}{trainer.department?.name ? ` - ${trainer.department.name}` : ''}
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
