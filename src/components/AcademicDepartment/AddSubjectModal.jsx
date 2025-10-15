import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { X, Plus } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import apiClient from '../../api/config';
import courseAPI from '../../api/course';

const AddSubjectModal = ({ show, onClose, onSave, loading = false, courseId }) => {
  const [formData, setFormData] = useState({
    courseId: courseId || '',
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
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Load courses when modal opens
  useEffect(() => {
    if (show) {
      loadCourses();
    }
  }, [show]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await courseAPI.getCourses();
      if (response && response.courses) {
        setCourses(response.courses);
      } else if (Array.isArray(response)) {
        setCourses(response);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.courseId.trim()) {
      newErrors.push('Course is required');
    }
    
    if (!formData.name.trim()) {
      newErrors.push('Subject name is required');
    }
    
    if (!formData.code.trim()) {
      newErrors.push('Subject code is required');
    }
    
    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }
    
    if (!formData.duration.trim()) {
      newErrors.push('Duration is required');
    } else if (isNaN(formData.duration) || parseInt(formData.duration) <= 0) {
      newErrors.push('Duration must be a positive number');
    }

    if (!formData.passScore.trim()) {
      newErrors.push('Pass score is required');
    } else if (isNaN(formData.passScore) || parseInt(formData.passScore) < 0 || parseInt(formData.passScore) > 100) {
      newErrors.push('Pass score must be between 0 and 100');
    }

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
        courseId: courseId,
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        method: formData.method,
        duration: parseInt(formData.duration),
        type: formData.type,
        roomName: formData.roomName.trim(),
        remarkNote: formData.remarkNote.trim(),
        timeSlot: formData.timeSlot.trim(),
        isSIM: formData.isSIM,
        passScore: parseInt(formData.passScore),
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
      courseId: courseId || '',
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
          <Form.Group className="mb-3">
            <Form.Label>Course *</Form.Label>
            <Form.Select
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              required
              disabled={loadingCourses}
            >
              <option value="">{loadingCourses ? 'Loading courses...' : 'Select a course'}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

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
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter subject description"
              required
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
                <Form.Label>Duration (days) *</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Enter duration in days"
                  min="1"
                  required
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
                <Form.Label>Pass Score *</Form.Label>
                <Form.Control
                  type="number"
                  name="passScore"
                  value={formData.passScore}
                  onChange={handleInputChange}
                  placeholder="Enter pass score (0-100)"
                  min="0"
                  max="100"
                  required
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

