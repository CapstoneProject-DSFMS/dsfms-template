import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { X, Save, Eye, Book } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { departmentAPI } from '../../api/department';

const CourseModal = ({ show, course, mode, onSave, onClose, departmentId }) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  // Fetch departments from API
  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await departmentAPI.getDepartments();
      const departmentsData = response.departments || [];
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchDepartments();
    }
  }, [show]);

  useEffect(() => {
    if (course && mode !== 'add') {
      setFormData({
        name: course.name || '',
        code: course.code || '',
        description: course.description || '',
        maxNumTrainee: course.maxNumTrainee || '',
        venue: course.venue || '',
        note: course.note || '',
        passScore: course.passScore || '',
        startDate: course.startDate || '',
        endDate: course.endDate || '',
        level: course.level || 'BEGINNER'
      });
    } else if (mode === 'add') {
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
    }
    setErrors({});
  }, [course, mode, show]);

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

    if (formData.maxNumTrainee && (isNaN(formData.maxNumTrainee) || formData.maxNumTrainee < 1)) {
      newErrors.maxNumTrainee = 'Max trainees must be a positive number';
    }

    if (formData.passScore && (isNaN(formData.passScore) || formData.passScore < 0 || formData.passScore > 100)) {
      newErrors.passScore = 'Pass score must be between 0 and 100';
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

    setIsSubmitting(true);
    try {
      const courseData = {
        ...formData,
        departmentId: departmentId,
        maxNumTrainee: formData.maxNumTrainee ? parseInt(formData.maxNumTrainee) : null,
        passScore: formData.passScore ? parseFloat(formData.passScore) : null
      };

      await onSave(courseData);
      toast.success(mode === 'add' ? 'Course created successfully!' : 'Course updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
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

  const getModalTitle = () => {
    switch (mode) {
      case 'add':
        return 'Add New Course';
      case 'edit':
        return 'Edit Course';
      case 'view':
        return 'View Course Details';
      default:
        return 'Course';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header 
        className="bg-gradient-primary-custom text-white border-0"
        closeButton
        closeVariant="white"
      >
        <Modal.Title className="d-flex align-items-center">
          {mode === 'view' ? <Eye className="me-2" size={20} /> : <Book className="me-2" size={20} />}
          {getModalTitle()}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {Object.keys(errors).length > 0 && (
            <div className="alert alert-danger mb-3">
              <strong>Please fix the following errors:</strong>
              <ul className="mb-0 mt-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Course Name and Code */}
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Course Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter course name"
                  isInvalid={!!errors.name}
                  readOnly={isReadOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Course Code <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., CCT-001"
                  isInvalid={!!errors.code}
                  readOnly={isReadOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Description */}
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter course description"
                  isInvalid={!!errors.description}
                  readOnly={isReadOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Max Trainees and Venue */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Max Trainees
                </Form.Label>
                <Form.Control
                  type="number"
                  name="maxNumTrainee"
                  value={formData.maxNumTrainee}
                  onChange={handleInputChange}
                  placeholder="Maximum number of trainees"
                  min="1"
                  isInvalid={!!errors.maxNumTrainee}
                  readOnly={isReadOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maxNumTrainee}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Venue
                </Form.Label>
                <Form.Control
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="Course venue location"
                  readOnly={isReadOnly}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Pass Score and Level */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Pass Score
                </Form.Label>
                <Form.Control
                  type="number"
                  name="passScore"
                  value={formData.passScore}
                  onChange={handleInputChange}
                  placeholder="Minimum pass score (0-100)"
                  min="0"
                  max="100"
                  step="0.1"
                  isInvalid={!!errors.passScore}
                  readOnly={isReadOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.passScore}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Level
                </Form.Label>
                <Form.Select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Start Date and End Date */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  Start Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  isInvalid={!!errors.startDate}
                  readOnly={isReadOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.startDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-primary-custom fw-semibold">
                  End Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  isInvalid={!!errors.endDate}
                  readOnly={isReadOnly}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.endDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

           {/* Note */}
           <Row>
             <Col>
               <Form.Group className="mb-3">
                 <Form.Label className="text-primary-custom fw-semibold">
                   Note
                 </Form.Label>
                 <Form.Control
                   type="text"
                   name="note"
                   value={formData.note}
                   onChange={handleInputChange}
                   placeholder="Additional course notes"
                   readOnly={isReadOnly}
                 />
               </Form.Group>
             </Col>
           </Row>
        </Modal.Body>

        <Modal.Footer className="border-0 p-4">
          <Button
            variant="outline-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="me-2" size={16} />
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {mode !== 'view' && (
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="me-2" size={16} />
                  {mode === 'add' ? 'Add Course' : 'Save Changes'}
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CourseModal;
