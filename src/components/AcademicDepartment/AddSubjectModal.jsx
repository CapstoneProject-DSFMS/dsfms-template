import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { X, Plus } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import apiClient from '../../api/config';

const AddSubjectModal = ({ show, onClose, onSave, loading = false, courseId, courseStartDate, courseEndDate }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    method: 'CLASSROOM',
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
    if (formData.passScore.trim() && (isNaN(formData.passScore) || parseFloat(formData.passScore) < 0 || parseFloat(formData.passScore) > 100)) {
      newErrors.push('Pass score must be between 0 and 100');
    }

    // Mandatory date fields (NN in schema)
    if (!formData.startDate.trim()) {
      newErrors.push('Start date is required');
    } else {
      // Check if start date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const startDate = new Date(formData.startDate + 'T00:00:00'); // Ensure local timezone
      if (startDate < today) {
        newErrors.push('Start date cannot be in the past');
      }
    }

    if (!formData.endDate.trim()) {
      newErrors.push('End date is required');
    } else {
      // Check if end date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const endDate = new Date(formData.endDate + 'T00:00:00'); // Ensure local timezone
      if (endDate < today) {
        newErrors.push('End date cannot be in the past');
      }
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate + 'T00:00:00') >= new Date(formData.endDate + 'T00:00:00')) {
      newErrors.push('End date must be after start date');
    }

    // Validate subject dates are within course range (if course dates are available)
    if (courseStartDate && courseEndDate && formData.startDate && formData.endDate) {
      const courseStart = new Date(courseStartDate);
      const courseEnd = new Date(courseEndDate);
      
      // Normalize dates to start of day for comparison (ignore time component)
      const courseStartNormalized = new Date(courseStart.getFullYear(), courseStart.getMonth(), courseStart.getDate());
      const courseEndNormalized = new Date(courseEnd.getFullYear(), courseEnd.getMonth(), courseEnd.getDate());
      const subjectStart = new Date(formData.startDate + 'T00:00:00');
      const subjectEnd = new Date(formData.endDate + 'T00:00:00');
      const subjectStartNormalized = new Date(subjectStart.getFullYear(), subjectStart.getMonth(), subjectStart.getDate());
      const subjectEndNormalized = new Date(subjectEnd.getFullYear(), subjectEnd.getMonth(), subjectEnd.getDate());
      
      // Format course dates for display (YYYY-MM-DD)
      const formatDateForDisplay = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const courseStartDisplay = formatDateForDisplay(courseStartDate);
      const courseEndDisplay = formatDateForDisplay(courseEndDate);
      
      if (subjectStartNormalized < courseStartNormalized) {
        newErrors.push(`Subject start date must be on or after course start date (Course start: ${courseStartDisplay})`);
      }
      
      if (subjectEndNormalized > courseEndNormalized) {
        newErrors.push(`Subject end date must be on or before course end date (Course end: ${courseEndDisplay})`);
      }
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
      // Note: duration will be calculated by backend based on startDate and endDate
      const subjectData = {
        courseId: courseId, // Always use current course ID from prop
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || null, // Optional (Y in schema)
        method: formData.method,
        type: formData.type,
        roomName: formData.roomName.trim() || null, // Optional (Y in schema)
        remarkNote: formData.remarkNote.trim() || null, // Optional (Y in schema)
        timeSlot: formData.timeSlot.trim() || null, // Optional (Y in schema)
        isSIM: formData.isSIM,
        passScore: formData.passScore.trim() ? parseFloat(formData.passScore) : null, // Optional (Y in schema)
        startDate: formData.startDate, // Date only (YYYY-MM-DD)
        endDate: formData.endDate // Date only (YYYY-MM-DD)
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
                  type="date"
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
                  type="date"
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
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

