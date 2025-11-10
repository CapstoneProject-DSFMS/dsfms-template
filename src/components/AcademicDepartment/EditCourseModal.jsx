import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Pencil, X, Save } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import apiClient from '../../api/config';

const EditCourseModal = ({ show, onClose, onSave, course, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    maxTrainees: '',
    venue: '',
    note: '',
    passScore: '',
    startDate: '',
    endDate: '',
    level: 'Beginner',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});

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
    // Only load data when modal is shown and course is available
    if (show && course) {
      setFormData({
        name: course.name || '',
        code: course.code || '',
        description: course.description || '',
        maxTrainees: course.maxNumTrainee || course.maxTrainees || '',
        venue: course.venue || '',
        note: course.note || '',
        passScore: course.passScore || '',
        startDate: formatDateForInput(course.startDate),
        endDate: formatDateForInput(course.endDate),
        level: course.level || 'BEGINNER',
        status: course.status || 'ACTIVE'
      });
    } else if (!show) {
      // Reset form when modal is closed
      setFormData({
        name: '',
        code: '',
        description: '',
        maxTrainees: '',
        venue: '',
        note: '',
        passScore: '',
        startDate: '',
        endDate: '',
        level: 'Beginner',
        status: 'ACTIVE'
      });
      setErrors({});
    }
  }, [show, course]);

  const handleClose = () => {
    // Clear errors when closing (form data will be reset by useEffect when show becomes false)
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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Course code is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.maxTrainees || isNaN(formData.maxTrainees) || parseInt(formData.maxTrainees) <= 0) {
      newErrors.maxTrainees = 'Max trainees must be a positive number';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (!formData.passScore || isNaN(formData.passScore) || parseInt(formData.passScore) < 0 || parseInt(formData.passScore) > 100) {
      newErrors.passScore = 'Pass score must be between 0 and 100';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      // Check if start date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const startDate = new Date(formData.startDate);
      
      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
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
      // Prepare data for API call
      const courseData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        code: formData.code.trim(),
        maxNumTrainee: parseInt(formData.maxTrainees),
        venue: formData.venue.trim(),
        note: formData.note.trim(),
        passScore: parseInt(formData.passScore),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        level: formData.level
      };

      // Call API to update course
      const response = await apiClient.put(`/courses/${course.id}`, courseData);
      
      // Show success toast
      toast.success('Course updated successfully!');
      
      // Call onSave callback with updated data from API response
      if (onSave) {
        await onSave(response.data || courseData);
      }
      
      handleClose();
    } catch (error) {
      
      // Show error toast
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update course';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Pencil className="me-2" size={20} />
          Edit Course
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* Basic Information */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Course Name *</Form.Label>
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
              <Form.Group>
                <Form.Label>Course Code *</Form.Label>
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

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Max Trainees *</Form.Label>
                <Form.Control
                  type="number"
                  name="maxTrainees"
                  value={formData.maxTrainees}
                  onChange={handleInputChange}
                  isInvalid={!!errors.maxTrainees}
                  disabled={loading}
                  min="1"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maxTrainees}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Pass Score *</Form.Label>
                <Form.Control
                  type="number"
                  name="passScore"
                  value={formData.passScore}
                  onChange={handleInputChange}
                  isInvalid={!!errors.passScore}
                  disabled={loading}
                  min="0"
                  max="100"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.passScore}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Level</Form.Label>
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
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Start Date *</Form.Label>
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
              <Form.Group>
                <Form.Label>End Date *</Form.Label>
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

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Venue *</Form.Label>
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

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Description *</Form.Label>
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

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Note</Form.Label>
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
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="me-2" size={16} />
                Save Changes
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditCourseModal;
