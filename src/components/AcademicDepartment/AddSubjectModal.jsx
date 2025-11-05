import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { X, Plus } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import apiClient from '../../api/config';

const AddSubjectModal = ({ show, onClose, onSave, loading = false, courseId }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    method: 'CLASSROOM',
    duration: '',
    type: 'UNLIMIT',
    roomName: '',
    remarkNote: '',
    timeSlot: '',
    isSIM: false,
    passScore: '',
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when courseId changes or modal opens
  useEffect(() => {
    if (show && courseId) {
      setFormData({
        name: '',
        code: '',
        description: '',
        method: 'CLASSROOM',
        duration: '',
        type: 'UNLIMIT',
        roomName: '',
        remarkNote: '',
        timeSlot: '',
        isSIM: false,
        passScore: '',
        startDate: '',
        endDate: ''
      });
      setErrors([]);
    }
  }, [show, courseId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    // Validate courseId (must be provided from prop)
    if (!courseId) {
      newErrors.push('Course ID is required');
    }
    
    // Mandatory fields (NN in schema)
    if (!formData.name.trim()) {
      newErrors.push('Subject name is required');
    }
    
    if (!formData.code.trim()) {
      newErrors.push('Subject code is required');
    }

    // Optional fields validation (Y in schema) - only validate format if provided
    if (formData.duration.trim() && (isNaN(formData.duration) || parseInt(formData.duration) <= 0)) {
      newErrors.push('Duration must be a positive number');
    }

    if (formData.passScore.trim() && (isNaN(formData.passScore) || parseFloat(formData.passScore) < 0 || parseFloat(formData.passScore) > 100)) {
      newErrors.push('Pass score must be between 0 and 100');
    }

    // Mandatory date fields (NN in schema)
    if (!formData.startDate.trim()) {
      newErrors.push('Start date is required');
    }

    if (!formData.endDate.trim()) {
      newErrors.push('End date is required');
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.push('End date must be after start date');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for API call
      const subjectData = {
        courseId: courseId, // Always use current course ID from prop
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || null, // Optional (Y in schema)
        method: formData.method,
        duration: formData.duration.trim() ? parseInt(formData.duration) : null, // Optional (Y in schema)
        type: formData.type,
        roomName: formData.roomName.trim() || null, // Optional (Y in schema)
        remarkNote: formData.remarkNote.trim() || null, // Optional (Y in schema)
        timeSlot: formData.timeSlot.trim() || null, // Optional (Y in schema)
        isSIM: formData.isSIM,
        passScore: formData.passScore.trim() ? parseFloat(formData.passScore) : null, // Optional (Y in schema)
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      // Call API to create subject
      const response = await apiClient.post('/subjects', subjectData);
      
      // Show success toast
      toast.success('Subject created successfully!');
      
      // Call onSave callback if provided
      if (onSave) {
        await onSave(response.data || subjectData);
      }
      
      handleClose();
    } catch (error) {
      
      // Show error toast
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create subject';
      toast.error(`Error: ${errorMessage}`);
      
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      method: 'CLASSROOM',
      duration: '',
      type: 'UNLIMIT',
      roomName: '',
      remarkNote: '',
      timeSlot: '',
      isSIM: false,
      passScore: '',
      startDate: '',
      endDate: ''
    });
    setErrors([]);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered style={{ maxHeight: '90vh' }}>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Plus className="me-2" size={20} />
          Add New Subject
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Error Messages */}
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
                <Form.Label>Subject Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter subject name"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subject Code *</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter subject code"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter subject description"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Method *</Form.Label>
                <Form.Select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  required
                >
                  <option value="CLASSROOM">CLASSROOM</option>
                  <option value="E_LEARNING">E_LEARNING</option>
                  <option value="ERO">ERO</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Duration (days)</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Enter duration in days"
                  min="1"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type *</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="UNLIMIT">UNLIMIT</option>
                  <option value="RECURRENT">RECURRENT</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Room Name</Form.Label>
                <Form.Control
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  placeholder="Enter room name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Time Slot</Form.Label>
                <Form.Control
                  type="text"
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  placeholder="e.g., 09:00-11:00"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pass Score</Form.Label>
                <Form.Control
                  type="number"
                  name="passScore"
                  value={formData.passScore}
                  onChange={handleInputChange}
                  placeholder="Enter pass score (0-100)"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Remark Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="remarkNote"
              value={formData.remarkNote}
              onChange={handleInputChange}
              placeholder="Enter remark note"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isSIM"
              checked={formData.isSIM}
              onChange={handleInputChange}
              label="Is Simulator"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '16px', height: '16px' }}></span>
              Creating...
            </>
          ) : (
            'Create Subject'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddSubjectModal;

