import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card, Badge, Alert, Modal } from 'react-bootstrap';
import { Save, Eye, X } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { assessmentAPI, templateAPI, courseAPI, subjectAPI, departmentAPI } from '../../api';
import { DownwardSelect } from '../Common';

const CreateAssessmentEventForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    departmentId: '',
    templateId: '',
    subjectId: '',
    courseId: '',
    occuranceDate: '',
    name: '',
    traineeIds: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);

  // Loading states
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingTrainees, setLoadingTrainees] = useState(false);

  // Load departments from public API (no permission required)
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const departmentsData = await departmentAPI.getPublicDepartments();
        
        // Filter only ACTIVE departments
        const activeDepartments = departmentsData.filter(dept => dept.isActive === true);
        setDepartments(activeDepartments);
      } catch (error) {
        console.error('Error loading departments:', error);
        toast.error('Failed to load departments');
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };
    loadDepartments();
  }, []);

  // Load templates when department is selected
  useEffect(() => {
    const loadTemplates = async () => {
      if (!formData.departmentId) {
        setTemplates([]);
        setFormData(prev => ({ ...prev, templateId: '' }));
        return;
      }

      try {
        setLoadingTemplates(true);
        const response = await templateAPI.getTemplatesByDepartment(formData.departmentId);
        const templatesData = response?.data?.templates || response?.templates || response?.data || response || [];
        setTemplates(templatesData);
        // Reset template selection when department changes
        setFormData(prev => ({ ...prev, templateId: '' }));
      } catch (error) {
        console.error('Error loading templates:', error);
        toast.error('Failed to load templates');
        setTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, [formData.departmentId]);

  // Load courses and subjects from department
  useEffect(() => {
    const loadCoursesAndSubjects = async () => {
      if (!formData.departmentId) {
        setCourses([]);
        setSubjects([]);
        setLoadingCourses(false);
        setLoadingSubjects(false);
        // Reset course and subject selection when department is cleared
        setFormData(prev => ({ ...prev, courseId: '', subjectId: '', traineeIds: [] }));
        return;
      }

      try {
        setLoadingCourses(true);
        setLoadingSubjects(true);
        
        // Fetch department with includeDeleted=true
        const response = await departmentAPI.getDepartmentById(formData.departmentId);
        
        // Extract courses from response
        let coursesData = [];
        if (response?.courses && Array.isArray(response.courses)) {
          coursesData = response.courses;
        } else if (response?.data?.courses && Array.isArray(response.data.courses)) {
          coursesData = response.data.courses;
        }
        
        // Filter courses with status PLANNED, ON_GOING, or FINISHED
        const filteredCourses = coursesData.filter(c => c.status === 'PLANNED' || c.status === 'ON_GOING' || c.status === 'FINISHED');
        setCourses(filteredCourses);
        
        // Extract subjects from courses (if each course has subjects array)
        let allSubjects = [];
        filteredCourses.forEach(course => {
          if (course.subjects && Array.isArray(course.subjects)) {
            allSubjects = allSubjects.concat(course.subjects);
          }
        });
        
        // Also check if subjects are directly in response
        if (response?.subjects && Array.isArray(response.subjects)) {
          allSubjects = allSubjects.concat(response.subjects);
        } else if (response?.data?.subjects && Array.isArray(response.data.subjects)) {
          allSubjects = allSubjects.concat(response.data.subjects);
        }
        
        // Remove duplicates based on id
        const uniqueSubjects = allSubjects.filter((subject, index, self) =>
          index === self.findIndex(s => s.id === subject.id)
        );
        
        // Filter subjects with status PLANNED, ON_GOING, or FINISHED
        const filteredSubjects = uniqueSubjects.filter(s => s.status === 'PLANNED' || s.status === 'ON_GOING' || s.status === 'FINISHED');
        setSubjects(filteredSubjects);
        
        // Reset course and subject selection when department changes
        setFormData(prev => ({ ...prev, courseId: '', subjectId: '', traineeIds: [] }));
        
      } catch (error) {
        console.error('Error loading courses and subjects:', error);
        toast.error('Failed to load courses and subjects');
        setCourses([]);
        setSubjects([]);
      } finally {
        setLoadingCourses(false);
        setLoadingSubjects(false);
      }
    };
    
    loadCoursesAndSubjects();
  }, [formData.departmentId]);

  // Load trainees when courseId or subjectId changes
  useEffect(() => {
    const loadTrainees = async () => {
      if (!formData.courseId && !formData.subjectId) {
        setTrainees([]);
        setFormData(prev => ({ ...prev, traineeIds: [] }));
        return;
      }

      try {
        setLoadingTrainees(true);
        let traineesData = [];

        if (formData.courseId && !formData.subjectId) {
          // Load from course
          const response = await courseAPI.getCourseTrainees(formData.courseId);
          traineesData = response?.trainees || response?.data?.trainees || [];
        } else if (formData.subjectId) {
          // Load from subject
          const response = await subjectAPI.getSubjectById(formData.subjectId);
          // Extract trainees from enrollmentsByBatch
          const allTrainees = [];
          if (response?.enrollmentsByBatch) {
            response.enrollmentsByBatch.forEach(batch => {
              if (batch.trainees && Array.isArray(batch.trainees)) {
                batch.trainees.forEach(trainee => {
                  allTrainees.push({
                    id: trainee.id,
                    eid: trainee.eid,
                    firstName: trainee.firstName,
                    lastName: trainee.lastName,
                    email: trainee.email
                  });
                });
              }
            });
          }
          traineesData = allTrainees;
        }

        setTrainees(traineesData);
        // Reset selected trainees when source changes
        setFormData(prev => ({ ...prev, traineeIds: [] }));
      } catch (error) {
        console.error('Error loading trainees:', error);
        toast.error('Failed to load trainees');
        setTrainees([]);
      } finally {
        setLoadingTrainees(false);
      }
    };

    loadTrainees();
  }, [formData.courseId, formData.subjectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle courseId/subjectId validation
    if (name === 'courseId') {
      setFormData(prev => ({
        ...prev,
        courseId: value,
        subjectId: value ? '' : prev.subjectId // Clear subjectId if courseId is selected
      }));
    } else if (name === 'subjectId') {
      setFormData(prev => ({
        ...prev,
        subjectId: value,
        courseId: value ? '' : prev.courseId // Clear courseId if subjectId is selected
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTraineeToggle = (traineeId) => {
    setFormData(prev => {
      const currentIds = prev.traineeIds || [];
      const newIds = currentIds.includes(traineeId)
        ? currentIds.filter(id => id !== traineeId)
        : [...currentIds, traineeId];
      
      return {
        ...prev,
        traineeIds: newIds
      };
    });
    
    // Clear error when traineeIds changes
    if (errors.traineeIds) {
      setErrors(prev => ({
        ...prev,
        traineeIds: ''
      }));
    }
  };

  const handleTemplateSelect = (templateId) => {
    setFormData(prev => ({ ...prev, templateId }));
  };

  const handlePreviewTemplate = async (template) => {
    if (!template || !template.id) {
      toast.error('Template not found');
      return;
    }

    try {
      setLoadingPDF(true);
      setShowTemplatePreview(true);
      
      // Get PDF blob from API
      const pdfBlob = await templateAPI.getTemplatePDF(template.id);
      
      // Create object URL for PDF
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF preview');
      setShowTemplatePreview(false);
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleClosePreview = () => {
    setShowTemplatePreview(false);
    // Clean up object URL to prevent memory leaks
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    if (!formData.templateId) {
      newErrors.templateId = 'Template is required';
    }

    if (!formData.subjectId && !formData.courseId) {
      newErrors.courseSubject = 'Either Course or Subject must be selected';
    }

    if (formData.subjectId && formData.courseId) {
      newErrors.courseSubject = 'Course and Subject cannot be selected at the same time';
    }

    if (!formData.occuranceDate) {
      newErrors.occuranceDate = 'Occurrence date is required';
    }

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Event name is required';
    }

    if (!formData.traineeIds || formData.traineeIds.length === 0) {
      newErrors.traineeIds = 'At least one trainee must be selected';
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
      // Build request data
      const requestData = {
        templateId: formData.templateId,
        occuranceDate: formData.occuranceDate, // YYYY-MM-DD format
        name: formData.name,
        traineeIds: formData.traineeIds
      };

      // Add courseId or subjectId (not both)
      if (formData.courseId) {
        requestData.courseId = formData.courseId;
      } else if (formData.subjectId) {
        requestData.subjectId = formData.subjectId;
      }

      await assessmentAPI.createAssessmentEvent(requestData);

      toast.success('Assessment event created successfully');
      
      // Reset form
      setFormData({
        departmentId: '',
        templateId: '',
        subjectId: '',
        courseId: '',
        occuranceDate: '',
        name: '',
        traineeIds: []
      });
      setErrors({});
      setTrainees([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating assessment event:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create assessment event';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTraineeName = (trainee) => {
    const firstName = trainee.firstName || '';
    const lastName = trainee.lastName || '';
    const middleName = trainee.middleName || '';
    return `${firstName} ${middleName} ${lastName}`.trim() || trainee.eid || 'Unknown';
  };

  return (
    <Form onSubmit={handleSubmit} className="create-assessment-event-form">
      {/* Department Selection */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Department <span className="text-danger">*</span>
            </Form.Label>
            <DownwardSelect
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              isInvalid={!!errors.departmentId}
              disabled={isSubmitting || loadingDepartments}
              placeholder="Select a department"
              options={departments.map(department => ({
                value: department.id,
                label: department.name
              }))}
            />
            <Form.Control.Feedback type="invalid">
              {errors.departmentId}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Template Selection */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Template <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex gap-2">
            <DownwardSelect
              name="templateId"
              value={formData.templateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              isInvalid={!!errors.templateId}
              disabled={isSubmitting || loadingTemplates || !formData.departmentId}
              placeholder={!formData.departmentId ? 'Select a department first' : 'Select a template'}
              options={templates.map(template => ({
                value: template.id,
                label: template.name
              }))}
            />
              {formData.templateId && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    const template = templates.find(t => t.id === formData.templateId);
                    if (template) handlePreviewTemplate(template);
                  }}
                  disabled={isSubmitting}
                  className="d-flex align-items-center"
                >
                  <Eye size={16} className="me-1" />
                  Preview
                </Button>
              )}
            </div>
            <Form.Control.Feedback type="invalid">
              {errors.templateId}
            </Form.Control.Feedback>
            {!formData.departmentId && (
              <Form.Text className="text-muted">
                Please select a department first to load templates.
              </Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3 course-select-group">
            <Form.Label className="fw-semibold">
              Course
            </Form.Label>
            <DownwardSelect
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              disabled={isSubmitting || loadingCourses || !!formData.subjectId}
              placeholder="Select a course (optional)"
              options={courses.map(course => ({
                value: course.id,
                label: `${course.name} (${course.code})`
              }))}
            />
            {formData.subjectId && (
              <Form.Text className="text-muted">
                Subject is selected. Course cannot be selected.
              </Form.Text>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3 subject-select-group">
            <Form.Label className="fw-semibold">
              Subject
            </Form.Label>
            <DownwardSelect
              name="subjectId"
              value={formData.subjectId}
              onChange={handleInputChange}
              disabled={isSubmitting || loadingSubjects || !!formData.courseId}
              placeholder="Select a subject (optional)"
              options={subjects.map(subject => ({
                value: subject.id,
                label: `${subject.name} (${subject.code})`
              }))}
            />
            {formData.courseId && (
              <Form.Text className="text-muted">
                Course is selected. Subject cannot be selected.
              </Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>

      {errors.courseSubject && (
        <Alert variant="danger" className="mb-3">
          {errors.courseSubject}
        </Alert>
      )}

      <Row>
        <Col md={6}>
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
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
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
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.occuranceDate}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Trainees Selection */}
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Trainees <span className="text-danger">*</span>
            </Form.Label>
            {!formData.courseId && !formData.subjectId ? (
              <Alert variant="info" className="mb-0">
                Please select a Course or Subject first to load trainees.
              </Alert>
            ) : loadingTrainees ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading trainees...</span>
                </div>
                <p className="mt-2 text-muted">Loading trainees...</p>
              </div>
            ) : trainees.length === 0 ? (
              <Alert variant="warning" className="mb-0">
                No trainees found for the selected {formData.courseId ? 'course' : 'subject'}.
              </Alert>
            ) : (
              <Card className="border" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Card.Body className="p-3">
                  <div className="d-flex flex-column gap-2">
                    {trainees.map(trainee => {
                      const isSelected = formData.traineeIds?.includes(trainee.id);
                      return (
                        <div
                          key={trainee.id}
                          className={`p-2 border rounded cursor-pointer ${isSelected ? 'bg-primary' : 'bg-light'}`}
                          onClick={() => handleTraineeToggle(trainee.id)}
                          style={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: isSelected ? 'var(--bs-primary)' : 'var(--bs-light)',
                            color: isSelected ? '#ffffff' : 'var(--bs-dark)'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#e9ecef';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'var(--bs-light)';
                            }
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <strong style={{ color: isSelected ? '#ffffff' : 'inherit' }}>
                                {getTraineeName(trainee)}
                              </strong>
                              {trainee.eid && (
                                <Badge 
                                  bg={isSelected ? 'light' : 'secondary'} 
                                  className="ms-2"
                                  style={{ 
                                    color: isSelected ? 'var(--bs-primary)' : '#ffffff'
                                  }}
                                >
                                  {trainee.eid}
                                </Badge>
                              )}
                            </div>
                            {isSelected && (
                              <Badge bg="light" style={{ color: 'var(--bs-primary)' }}>
                                Selected
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            )}
            {errors.traineeIds && formData.traineeIds?.length === 0 && (
              <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                {errors.traineeIds}
              </div>
            )}
            {formData.traineeIds && formData.traineeIds.length > 0 && (
              <Form.Text className="text-muted">
                {formData.traineeIds.length} trainee(s) selected
              </Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            setFormData({
              departmentId: '',
              templateId: '',
              subjectId: '',
              courseId: '',
              occuranceDate: '',
              name: '',
              traineeIds: []
            });
            setErrors({});
            setTrainees([]);
            setTemplates([]);
          }}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="d-flex align-items-center"
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creating...
            </>
          ) : (
            <>
              <Save className="me-2" size={16} />
              Create Assessment Event
            </>
          )}
        </Button>
      </div>


      {/* Template PDF Preview Modal */}
      <Modal
        show={showTemplatePreview}
        onHide={handleClosePreview}
        size="lg"
        centered
        fullscreen="lg-down"
      >
        <Modal.Header closeButton className="bg-primary text-white border-0">
          <Modal.Title className="text-white">Template Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0, height: '70vh', minHeight: '500px' }}>
          {loadingPDF ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading PDF...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Template PDF Preview"
            />
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
              <p className="text-muted">No preview available</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Form>
  );
};

export default CreateAssessmentEventForm;

