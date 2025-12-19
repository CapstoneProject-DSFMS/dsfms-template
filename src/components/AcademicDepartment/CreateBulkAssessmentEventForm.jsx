import React, { useState, useEffect, useMemo } from 'react';
import { Form, Row, Col, Button, Card, Badge, Alert, Modal } from 'react-bootstrap';
import { Save, Eye, X } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { assessmentAPI, templateAPI, courseAPI, subjectAPI, departmentAPI } from '../../api';
import { DownwardSelect } from '../Common';

const CreateBulkAssessmentEventForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    departmentId: '',
    templateId: '',
    subjectId: '',
    courseId: '',
    occuranceDate: '',
    name: '',
    excludeTraineeIds: []
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

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);

  // Load departments (with authentication)
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const departmentsData = await departmentAPI.getDepartments();
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
        setFormData(prev => ({ ...prev, courseId: '', subjectId: '', excludeTraineeIds: [] }));
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
        
        // Filter courses with status PLANNED, ONGOING, or FINISHED
        const filteredCourses = coursesData.filter(c => c.status === 'PLANNED' || c.status === 'ON_GOING' || c.status === 'COMPLETED');
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
        
        // Filter subjects with status PLANNED, ONGOING, or COMPLETED
        const filteredSubjects = uniqueSubjects.filter(s => s.status === 'PLANNED' || s.status === 'ON_GOING' || s.status === 'COMPLETED');
        setSubjects(filteredSubjects);
        
        // DON'T reset subjectId here - let user choose subjects after loading
        // Only reset courseId when department is cleared
        
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

  // Load trainees when course or subject changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      const loadTrainees = async () => {
        if (!formData.courseId && !formData.subjectId) {
          setTrainees([]);
          setFormData(prev => ({ ...prev, excludeTraineeIds: [] }));
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
        } catch (error) {
          console.error('Error loading trainees:', error);
          toast.error('Failed to load trainees');
          setTrainees([]);
        } finally {
          setLoadingTrainees(false);
        }
      };

      loadTrainees();
    }, 300); // Debounce 300ms to avoid rapid API calls

    return () => clearTimeout(timer);
  }, [formData.courseId, formData.subjectId]);

  const getTraineeName = (trainee) => {
    const firstName = trainee.firstName || '';
    const lastName = trainee.lastName || '';
    const middleName = trainee.middleName || '';
    return `${lastName}${middleName ? ' ' + middleName : ''} ${firstName}`.trim() || trainee.eid || 'Unknown';
  };

  // Memoize filtered subjects to avoid re-filtering on every render
  const filteredSubjects = useMemo(() => {
    if (!formData.courseId) return [];
    return subjects.filter(s => s.courseId === formData.courseId);
  }, [subjects, formData.courseId]);

  // Memoize subject options to avoid re-mapping on every render
  const subjectOptions = useMemo(() => {
    return filteredSubjects.map(subject => ({
      value: subject.id,
      label: `${subject.name} (${subject.code})`
    }));
  }, [filteredSubjects]);

  // TraineeItem component with React.memo to prevent unnecessary re-renders
  const TraineeItem = React.memo(({ trainee, isExcluded, onToggle }) => (
    <div
      key={trainee.id}
      className={`border rounded cursor-pointer ${isExcluded ? 'bg-primary' : 'bg-light'}`}
      onClick={() => onToggle(trainee.id)}
      style={{
        padding: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isExcluded ? 'var(--bs-primary)' : 'var(--bs-light)',
        color: isExcluded ? '#ffffff' : 'var(--bs-dark)',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (!isExcluded) {
          e.currentTarget.style.backgroundColor = '#e9ecef';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExcluded) {
          e.currentTarget.style.backgroundColor = 'var(--bs-light)';
        }
      }}
    >
      <div className="d-flex align-items-center justify-content-between w-100 gap-2" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 auto', minWidth: '0px' }}>
          <strong style={{ color: isExcluded ? '#ffffff' : 'inherit', wordBreak: 'break-word', fontSize: '0.95rem' }}>
            {getTraineeName(trainee)}
          </strong>
          {trainee.eid && (
            <Badge
              bg={isExcluded ? 'light' : 'secondary'}
              style={{
                marginLeft: '0.5rem',
                color: isExcluded ? 'var(--bs-primary)' : '#ffffff',
                fontSize: '0.7rem',
                padding: '0.35rem 0.6rem'
              }}
            >
              {trainee.eid}
            </Badge>
          )}
        </div>
        {isExcluded && (
          <Badge
            bg="light"
            style={{
              color: 'var(--bs-primary)',
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
              padding: '0.35rem 0.6rem'
            }}
          >
            Excluded
          </Badge>
        )}
      </div>
    </div>
  ));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle courseId/subjectId - both can be selected now
    if (name === 'courseId') {
      setFormData(prev => ({
        ...prev,
        courseId: value,
        // Don't clear subjectId - user can select both
        excludeTraineeIds: [] // Reset excluded trainees when source changes
      }));
    } else if (name === 'subjectId') {
      setFormData(prev => ({
        ...prev,
        subjectId: value,
        // Don't clear courseId - user can select both
        excludeTraineeIds: [] // Reset excluded trainees when source changes
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
      const currentIds = prev.excludeTraineeIds || [];
      const newIds = currentIds.includes(traineeId)
        ? currentIds.filter(id => id !== traineeId)
        : [...currentIds, traineeId];
      
      return {
        ...prev,
        excludeTraineeIds: newIds
      };
    });
    
    // Clear error when excludeTraineeIds changes
    if (errors.excludeTraineeIds) {
      setErrors(prev => ({
        ...prev,
        excludeTraineeIds: ''
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

    // Course is required, Subject is optional
    if (!formData.courseId) {
      newErrors.courseSubject = 'Course is required';
    }

    if (!formData.occuranceDate) {
      newErrors.occuranceDate = 'Occurrence date is required';
    } else {
      // Validate occurrence date against subject or course date range
      const occDate = new Date(formData.occuranceDate);
      
      if (formData.subjectId) {
        // If subject is selected, validate against subject start date only
        const selectedSubject = subjects.find(s => s.id === formData.subjectId);
        if (selectedSubject) {
          const subjectStart = new Date(selectedSubject.startDate);
          
          if (occDate < subjectStart) {
            newErrors.occuranceDate = `Occurrence date must be on or after subject start date (${subjectStart.toLocaleDateString()})`;
          }
        }
      } else if (formData.courseId) {
        // If only course is selected, validate against course start date only
        const selectedCourse = courses.find(c => c.id === formData.courseId);
        if (selectedCourse) {
          const courseStart = new Date(selectedCourse.startDate);
          
          if (occDate < courseStart) {
            newErrors.occuranceDate = `Occurrence date must be on or after course start date (${courseStart.toLocaleDateString()})`;
          }
        }
      }
    }

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Event name is required';
    }

    // excludeTraineeIds is optional - no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Build request data for confirmation
    const requestData = {
      templateId: formData.templateId,
      occuranceDate: formData.occuranceDate,
      name: formData.name,
      excludeTraineeIds: formData.excludeTraineeIds || []
    };

    if (formData.subjectId) {
      requestData.subjectId = formData.subjectId;
    } else if (formData.courseId) {
      requestData.courseId = formData.courseId;
    }

    // Calculate trainees count and entity name
    const numTraineesToCreate = trainees.length - (formData.excludeTraineeIds?.length || 0);
    let entityName = '';
    
    if (formData.subjectId) {
      const subject = subjects.find(s => s.id === formData.subjectId);
      entityName = subject?.name || 'Subject';
    } else if (formData.courseId) {
      const course = courses.find(c => c.id === formData.courseId);
      entityName = course?.name || 'Course';
    }

    // Store pending data and show confirmation
    setPendingSubmitData({
      requestData,
      numTraineesToCreate,
      entityName
    });
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingSubmitData) return;

    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      await assessmentAPI.createBulkAssessmentEvent(pendingSubmitData.requestData);

      toast.success('Bulk assessment event created successfully');
      
      // Reset form
      setFormData({
        departmentId: '',
        templateId: '',
        subjectId: '',
        courseId: '',
        occuranceDate: '',
        name: '',
        excludeTraineeIds: []
      });
      setErrors({});
      setTrainees([]);
      setPendingSubmitData(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating bulk assessment event:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create bulk assessment event';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Course/Subject Selection */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3 course-select-group">
            <Form.Label className="fw-semibold">
              Course <span className="text-danger">*</span>
            </Form.Label>
            <DownwardSelect
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              isInvalid={!!errors.courseSubject}
              disabled={isSubmitting || loadingCourses}
              placeholder="Select a course"
              options={courses.map(course => ({
                value: course.id,
                label: `${course.name} (${course.code})`
              }))}
            />
            <Form.Control.Feedback type="invalid">
              {errors.courseSubject}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3 subject-select-group">
            <Form.Label className="fw-semibold">
              Subject (Optional)
            </Form.Label>
            <DownwardSelect
              name="subjectId"
              value={formData.subjectId}
              onChange={handleInputChange}
              disabled={isSubmitting || loadingSubjects || !formData.courseId}
              placeholder={!formData.courseId ? 'Select a course first' : 'Select a subject (optional)'}
              options={subjectOptions}
            />
            {!formData.courseId && (
              <Form.Text className="text-muted">
                Please select a course first to load subjects.
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

      {/* Event Name and Occurrence Date */}
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

      {/* Exclude Trainees Selection */}
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Exclude Trainees (Optional)
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
              <div style={{
                maxHeight: 'clamp(200px, 40vh, 400px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
                border: '1px solid #dee2e6',
                borderRadius: '0.375rem',
                backgroundColor: '#fff'
              }}>
                <div style={{ padding: '0.75rem' }}>
                  <div className="d-flex flex-column gap-2">
                    {trainees.map(trainee => (
                      <TraineeItem
                        key={trainee.id}
                        trainee={trainee}
                        isExcluded={formData.excludeTraineeIds?.includes(trainee.id)}
                        onToggle={handleTraineeToggle}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {formData.excludeTraineeIds && formData.excludeTraineeIds.length > 0 && (
              <Form.Text className="text-muted">
                {formData.excludeTraineeIds.length} trainee(s) excluded
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
              excludeTraineeIds: []
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
              Create Bulk Assessment Event
            </>
          )}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirmation}
        onHide={() => {
          setShowConfirmation(false);
          setPendingSubmitData(null);
        }}
        centered
        size="lg"
      >
        <Modal.Header 
          closeButton 
          className="bg-primary text-white"
          style={{ borderBottom: 'none' }}
        >
          <Modal.Title className="fw-bold">
            Confirm Bulk Assessment Event Creation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '2rem' }}>
          <div style={{ lineHeight: '1.8' }}>
            <p style={{ fontSize: '1rem', color: 'var(--bs-dark)', marginBottom: '1.5rem' }}>
              Assessment Forms will be generated for{' '}
              <strong style={{ fontSize: '1.15rem', color: 'var(--bs-primary)' }}>
                {pendingSubmitData?.numTraineesToCreate || 0}
              </strong>{' '}
              Trainees of{' '}
              <strong style={{ fontSize: '1.15rem', color: 'var(--bs-secondary)' }}>
                {formData.subjectId ? 'Subject' : 'Course'}
              </strong>{' '}
              <strong style={{ fontSize: '1.15rem', color: 'var(--bs-primary)' }}>
                {pendingSubmitData?.entityName || 'N/A'}
              </strong>
              .
            </p>
            <div style={{ 
              backgroundColor: 'var(--bs-light)',
              border: '1px solid var(--bs-neutral)',
              borderRadius: '0.375rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--bs-dark)' }}>
                <strong>Summary:</strong>
              </p>
              <ul style={{ marginBottom: '0', paddingLeft: '1.5rem', color: 'var(--bs-dark)', fontSize: '0.95rem' }}>
                <li>Type: <strong>{formData.subjectId ? 'Subject' : 'Course'}</strong></li>
                <li>Name: <strong>{pendingSubmitData?.entityName || 'N/A'}</strong></li>
                <li>Total Trainees: <strong>{trainees.length}</strong></li>
                <li>Excluded Trainees: <strong>{formData.excludeTraineeIds?.length || 0}</strong></li>
                <li>Trainees to Include: <strong style={{ color: 'var(--bs-primary)' }}>{pendingSubmitData?.numTraineesToCreate || 0}</strong></li>
              </ul>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--bs-dark)', marginBottom: '0' }}>
              Please review the information above before confirming.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid var(--bs-neutral)', padding: '1.5rem' }}>
          <Button
            variant="light"
            onClick={() => {
              setShowConfirmation(false);
              setPendingSubmitData(null);
            }}
            disabled={isSubmitting}
            style={{ 
              color: 'var(--bs-dark)',
              borderColor: 'var(--bs-neutral)',
              transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmSubmit}
            disabled={isSubmitting}
            className="d-flex align-items-center"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              <>
                <Save className="me-2" size={16} />
                Confirm & Create
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

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

export default CreateBulkAssessmentEventForm;

