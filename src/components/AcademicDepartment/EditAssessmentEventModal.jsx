import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Pencil, X, Save } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { assessmentAPI } from '../../api';

const EditAssessmentEventModal = ({ show, onClose, onSave, event, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    occuranceDate: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to format date for input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    
    // If already in YYYY-MM-DD format, return as is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // If it's an ISO string or Date object, convert to YYYY-MM-DD
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    // Only load data when modal is shown and event is available
    if (show && event) {
      setFormData({
        name: event.name || '',
        occuranceDate: formatDateForInput(event.occuranceDate || event.occurrenceDate)
      });
    } else if (!show) {
      // Reset form when modal is closed
      setFormData({
        name: '',
        occuranceDate: ''
      });
      setErrors({});
    }
  }, [show, event]);

  const handleClose = () => {
    // Clear errors when closing
    setErrors({});
    setIsSaving(false);
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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Event name is required';
    }

    if (!formData.occuranceDate) {
      newErrors.occuranceDate = 'Occurrence date is required';
    } else {
      // Validate date is not in the past
      const selectedDate = new Date(formData.occuranceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.occuranceDate = 'Occurrence date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!event) {
      toast.error('Event data is missing');
      return;
    }

    setIsSaving(true);

    try {
      // Format date to ISO string at UTC midnight to avoid timezone issues
      // Parse YYYY-MM-DD and create date at UTC midnight
      // Format: "2026-12-20T00:00:00.000Z" (matching data sample)
      const [year, month, day] = formData.occuranceDate.split('-').map(Number);
      const dateAtUTCMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const isoDateString = dateAtUTCMidnight.toISOString(); // Format: "2026-12-20T00:00:00.000Z"

      // Format original date for query params (YYYY-MM-DD)
      const originalDate = event.occuranceDate || event.occurrenceDate;
      const originalDateFormatted = formatDateForInput(originalDate);

      // Build query parameters - use ORIGINAL data from event
      const params = {
        name: event.name, // Original name
        occuranceDate: originalDateFormatted, // Original date in YYYY-MM-DD format
        templateId: event.templateInfo?.id || ''
      };

      // Add courseId or subjectId (not both) - from original event
      if (event.subjectId === null && event.courseId) {
        // Event only belongs to course
        params.courseId = event.courseId;
      } else if (event.subjectId) {
        // Event belongs to subject (and course)
        params.subjectId = event.subjectId;
      }

      // Build request body - only UPDATED fields (name and occuranceDate)
      // Format must match: "2026-12-20T00:00:00.000Z"
      const body = {
        name: formData.name, // Updated name
        occuranceDate: isoDateString // Updated date in ISO format: "2026-12-20T00:00:00.000Z"
      };

      // Debug log to verify format
      console.log('Update Assessment Event - Request:', {
        params,
        body,
        isoDateString
      });

      await assessmentAPI.updateAssessmentEvent(params, body);

      toast.success('Assessment event updated successfully');
      
      if (onSave) {
        onSave();
      }
      
      handleClose();
    } catch (error) {
      console.error('Error updating assessment event:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update assessment event';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!event) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header 
        className="bg-primary-custom text-white border-0"
        style={{
          borderTopLeftRadius: '0.5rem',
          borderTopRightRadius: '0.5rem'
        }}
      >
        <Modal.Title className="d-flex align-items-center text-white mb-0">
          <Pencil className="me-2" size={20} />
          Update Assessment Event
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={handleClose} 
          className="text-white p-0 ms-auto"
          style={{ 
            border: 'none', 
            background: 'none',
            opacity: 0.9
          }}
          disabled={isSaving}
        >
          <X size={24} color="#ffffff" />
        </Button>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Event Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                  placeholder="Enter event name"
                  disabled={isSaving || loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Occurrence Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="occuranceDate"
                  value={formData.occuranceDate}
                  onChange={handleInputChange}
                  isInvalid={!!errors.occuranceDate}
                  disabled={isSaving || loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.occuranceDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Display read-only information */}
          <Row className="mt-4">
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <small className="text-muted d-block mb-1">Course/Subject</small>
                <strong>
                  {event.entityInfo?.name || '-'}
                </strong>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <small className="text-muted d-block mb-1">Template</small>
                <strong>
                  {event.templateInfo?.name || '-'}
                </strong>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer className="border-top">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={isSaving || loading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isSaving || loading}
            className="d-flex align-items-center"
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              <>
                <Save className="me-2" size={16} />
                Update Event
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditAssessmentEventModal;

