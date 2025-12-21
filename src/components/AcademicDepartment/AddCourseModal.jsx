import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { X, Save, Plus } from 'react-bootstrap-icons';

const AddCourseModal = ({ show, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    maxNumTrainee: '',
    venue: '',
    note: '',
    passScore: '',
    startDate: '',
    endDate: '',
    level: 'BEGINNER'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      // Reset form when modal opens
      setFormData({
        name: '',
        code: '',
        description: '',
        maxNumTrainee: '',
        venue: '',
        note: '',
        passScore: '',
        startDate: '',
        endDate: '',
        level: 'BEGINNER'
      });
      setErrors({});
    }
  }, [show]);

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      maxNumTrainee: '',
      venue: '',
      note: '',
      passScore: '',
      startDate: '',
      endDate: '',
      level: 'BEGINNER'
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Real-time validation for date fields
    if (name === 'startDate' && value) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(value + 'T00:00:00');
      if (startDate < today) {
        setErrors(prev => ({
          ...prev,
          startDate: 'Start date cannot be in the past'
        }));
      }
    }
    
    if (name === 'endDate' && value) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(value + 'T00:00:00');
      if (endDate < today) {
        setErrors(prev => ({
          ...prev,
          endDate: 'End date cannot be in the past'
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Course code is required';
    }

    if (formData.description.trim() === '') {
      // Description is optional - no error
    }

    if (!formData.maxNumTrainee || isNaN(formData.maxNumTrainee) || parseInt(formData.maxNumTrainee) <= 0) {
      newErrors.maxNumTrainee = 'Max trainees must be a positive number';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (formData.passScore && (isNaN(formData.passScore) || !Number.isInteger(parseFloat(formData.passScore)) || parseInt(formData.passScore) < 0 || parseInt(formData.passScore) > 100)) {
      newErrors.passScore = 'Pass score must be an integer between 0 and 100';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      // Check if start date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const startDate = new Date(formData.startDate + 'T00:00:00'); // Ensure local timezone
      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else {
      // Check if end date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const endDate = new Date(formData.endDate + 'T00:00:00'); // Ensure local timezone
      if (endDate < today) {
        newErrors.endDate = 'End date cannot be in the past';
      }
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate + 'T00:00:00') >= new Date(formData.endDate + 'T00:00:00')) {
      newErrors.endDate = 'End date must be after start date';
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
      handleClose();
    } catch (error) {
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Plus className="me-2" size={20} />
          Add New Course
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto', paddingTop: '1.5rem' }}>
          
          {/* Basic Information */}
          <Row className="mb-5">
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>Course Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>Course Code *</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  isInvalid={!!errors.code}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>Max Trainees *</Form.Label>
                <Form.Control
                  type="number"
                  name="maxNumTrainee"
                  value={formData.maxNumTrainee}
                  onChange={handleInputChange}
                  isInvalid={!!errors.maxNumTrainee}
                  disabled={loading}
                  min="1"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maxNumTrainee}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>Pass Score</Form.Label>
                <Form.Control
                  type="number"
                  name="passScore"
                  value={formData.passScore}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === '.' && e.preventDefault()}
                  isInvalid={!!errors.passScore}
                  disabled={loading}
                  min="0"
                  max="100"
                  step="1"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.passScore}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>Level</Form.Label>
                <Form.Select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>Venue *</Form.Label>
                <Form.Control
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  isInvalid={!!errors.venue}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.venue}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>Start Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  isInvalid={!!errors.startDate}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.startDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>End Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  isInvalid={!!errors.endDate}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.endDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  isInvalid={!!errors.description}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold mb-2 d-block" style={{ marginTop: '0.5rem' }}>Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>
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
            variant="primary-custom"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating...
              </>
            ) : (
              <>
                <Save className="me-2" size={16} />
                Create Course
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddCourseModal;
