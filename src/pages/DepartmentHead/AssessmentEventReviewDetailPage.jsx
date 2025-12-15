import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import { 
  ArrowLeft, 
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  People,
  Book,
  FileText,
  Clock,
  X,
  FileEarmarkPdf,
  Person,
  ClipboardCheck
} from 'react-bootstrap-icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import assessmentAPI from '../../api/assessment';
import templateAPI from '../../api/template';
import { LoadingSkeleton, SortIcon } from '../../components/Common';
import useTableSort from '../../hooks/useTableSort';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import '../../styles/department-head.css';
import '../../styles/scrollable-table.css';

const AssessmentEventReviewDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [templatePdfUrl, setTemplatePdfUrl] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  
  // Get event type from location state or detect from data
  const [eventType, setEventType] = useState(() => {
    return location.state?.eventType || null; // Will be set after fetching data
  });
  const [formsSubTab, setFormsSubTab] = useState(() => {
    // Default subtab based on event type if available
    const type = location.state?.eventType;
    return type === 'processing' ? 'submitted' : type === 'completed' ? 'approved' : 'submitted';
  });

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy eventData từ location.state (đã có từ trang list)
      const eventDataFromState = location.state?.eventData;
      
      if (!eventDataFromState) {
        setError('Event data not found. Please navigate from the Assessment Review Requests page.');
        return;
      }

      // Format occuranceDate từ ISO string hoặc Date object sang "YYYY-MM-DD"
      let occuranceDate = null;
      if (eventDataFromState.occurrenceDate) {
        const date = new Date(eventDataFromState.occurrenceDate);
        if (!isNaN(date.getTime())) {
          occuranceDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        }
      }

      if (!occuranceDate) {
        setError('Invalid occurrence date');
        return;
      }

      let response;
      
      // Kiểm tra subjectId để quyết định gọi API nào
      if (eventDataFromState.subjectId) {
        // Subject event
        if (!eventDataFromState.templateId) {
          setError('Template ID is missing');
          return;
        }
        response = await assessmentAPI.getSubjectEventAssessments(
          eventDataFromState.subjectId,
          eventDataFromState.templateId,
          occuranceDate
        );
      } else if (eventDataFromState.courseId) {
        // Course event
        if (!eventDataFromState.templateId) {
          setError('Template ID is missing');
          return;
        }
        response = await assessmentAPI.getCourseEventAssessments(
          eventDataFromState.courseId,
          eventDataFromState.templateId,
          occuranceDate
        );
      } else {
        setError('Invalid event data: missing courseId or subjectId');
        return;
      }

      // Set assessments từ response
      setAssessments(response?.assessments || []);
      
      // Set eventData từ eventInfo trong response và eventDataFromState
      const eventInfo = response?.eventInfo || {};
      setEventData({
        eventName: eventInfo.name || eventDataFromState.eventName,
        occurrenceDate: eventInfo.occuranceDate || eventDataFromState.occurrenceDate,
        templateName: eventInfo.templateInfo?.name || eventDataFromState.templateName,
        templateId: eventInfo.templateId || eventDataFromState.templateId,
        totalTrainees: response?.numberOfTrainees || eventDataFromState.totalTrainees,
        totalTrainers: response?.numberOfParticipatedTrainers || eventDataFromState.totalTrainers,
        courseInfo: eventInfo.courseInfo,
        subjectInfo: eventInfo.subjectInfo,
        templateInfo: eventInfo.templateInfo,
        // Keep original fields for compatibility
        totalAssessments: response?.assessments?.length || eventDataFromState.totalAssessments
      });
      
      // Set eventType nếu chưa có
      if (!eventType) {
        const hasSubmitted = (response?.assessments || []).some(a => a.status === 'SUBMITTED');
        setEventType(hasSubmitted ? 'processing' : 'completed');
        setFormsSubTab(hasSubmitted ? 'submitted' : 'approved');
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load assessment event data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // Calculate statistics
  const calculateStatistics = () => {
    if (!assessments || assessments.length === 0) {
      return {
        total: 0,
        submitted: 0,
        passed: 0,
        failed: 0,
        pending: 0
      };
    }

    const stats = {
      total: assessments.length,
      submitted: 0,
      passed: 0,
      failed: 0,
      pending: 0
    };

    assessments.forEach(assessment => {
      const status = String(assessment.status || '').toUpperCase();
      
      if (status === 'SUBMITTED') {
        stats.submitted++;
      } else if (status === 'APPROVED') {
        stats.submitted++;
        // Check if passed based on resultText only
        const resultText = String(assessment.resultText || '').toUpperCase().trim();
        if (resultText === 'PASSED' || resultText === 'PASS') {
          stats.passed++;
        } else if (resultText === 'FAILED' || resultText === 'FAIL') {
          stats.failed++;
        }
        // If resultText is empty or unknown, don't count as passed or failed
      } else if (status === 'REJECTED') {
        stats.submitted++;
        stats.failed++;
      } else {
        stats.pending++;
      }
    });

    return stats;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const stats = calculateStatistics();

  // Get assessment status badge - display original status from API
  const getAssessmentStatusBadge = (status) => {
    const statusConfig = {
      SUBMITTED: { variant: 'warning', icon: Clock, label: 'SUBMITTED' },
      APPROVED: { variant: 'success', icon: CheckCircle, label: 'APPROVED' },
      REJECTED: { variant: 'danger', icon: XCircle, label: 'REJECTED' },
      CANCELLED: { variant: 'secondary', icon: X, label: 'CANCELLED' },
      IN_PROGRESS: { variant: 'info', icon: Clock, label: 'IN_PROGRESS' },
      ONGOING: { variant: 'info', icon: Clock, label: 'ONGOING' },
      COMPLETED: { variant: 'success', icon: CheckCircle, label: 'COMPLETED' },
      PENDING: { variant: 'info', icon: Clock, label: 'PENDING' },
      FAILED: { variant: 'danger', icon: XCircle, label: 'FAILED' },
      NOT_STARTED: { variant: 'secondary', icon: ClipboardCheck, label: 'NOT_STARTED' }
    };
    
    const statusUpper = String(status || '').toUpperCase();
    const config = statusConfig[statusUpper] || { variant: 'secondary', icon: ClipboardCheck, label: status || 'UNKNOWN' };
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
        <IconComponent size={12} />
        {config.label}
      </Badge>
    );
  };

  // SortableHeader component
  const SortableHeader = ({ columnKey, children, className = "", sortConfig, onSort }) => {
    const isActive = sortConfig?.key === columnKey;
    const direction = isActive ? sortConfig?.direction : null;

    return (
      <th
        className={`fw-semibold ${className}`}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)',
          textTransform: 'uppercase'
        }}
        onClick={() => onSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#214760';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bs-primary)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '700' : '600',
            color: 'white'
          }}>
            {children}
          </span>
          <div
            className="ms-2 d-flex align-items-center"
            style={{
              minWidth: '20px',
              justifyContent: 'center'
            }}
          >
            <SortIcon
              direction={direction}
              size={14}
              color="white"
            />
          </div>
        </div>
        {isActive && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'rgba(255, 255, 255, 0.5)',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </th>
    );
  };

  // Filter assessments by subtab
  const filteredAssessments = useMemo(() => {
    if (!assessments || assessments.length === 0) return [];
    
    if (activeTab !== 'forms') return assessments;
    
    return assessments.filter(assessment => {
      const status = String(assessment.status || '').toUpperCase();
      
      if (eventType === 'processing') {
        if (formsSubTab === 'submitted') return status === 'SUBMITTED';
        if (formsSubTab === 'reviewed') return status === 'APPROVED' || status === 'REJECTED';
        if (formsSubTab === 'cancelled') return status === 'CANCELLED';
      } else if (eventType === 'completed') {
        if (formsSubTab === 'approved') return status === 'APPROVED';
        if (formsSubTab === 'rejected') return status === 'REJECTED';
        if (formsSubTab === 'cancelled') return status === 'CANCELLED';
      }
      
      return true;
    });
  }, [assessments, activeTab, formsSubTab, eventType]);

  // Prepare table data for sorting
  const tableData = useMemo(() => {
    if (!filteredAssessments || filteredAssessments.length === 0) return [];
    
    return filteredAssessments.map((assessment, index) => {
      const traineeName = assessment.trainee?.fullName || 
                        `${assessment.trainee?.firstName || ''} ${assessment.trainee?.lastName || ''}`.trim() ||
                        `Trainee ${index + 1}`;
      const traineeEmail = assessment.trainee?.email || '-';
      const score = assessment.resultScore || 0;
      const maxScore = 100; // Default max score
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      
      // Determine result
      let result = null;
      if (assessment.status === 'APPROVED') {
        result = score >= 70 ? 'PASSED' : 'FAILED';
      } else if (assessment.status === 'REJECTED') {
        result = 'FAILED';
      }
      
      return {
        id: assessment.id,
        assessmentForm: assessment.name || `Assessment Form ${index + 1}`,
        trainee: traineeName,
        traineeEmail: traineeEmail,
        occurrenceDate: eventData?.occurrenceDate || assessment.occurrenceDate || assessment.createdAt,
        status: assessment.status,
        score: score,
        maxScore: maxScore,
        percentage: percentage,
        result: result,
        rawAssessment: assessment
      };
    });
  }, [filteredAssessments, eventData]);

  const { sortedData, sortConfig, handleSort } = useTableSort(tableData);

  // Get course and subject info from eventData (from API response)
  const getCourseSubjectInfo = () => {
    if (!eventData) return null;
    
    return {
      course: eventData.courseInfo ? {
        name: eventData.courseInfo.name,
        code: eventData.courseInfo.code
      } : null,
      subject: eventData.subjectInfo ? {
        name: eventData.subjectInfo.name,
        code: eventData.subjectInfo.code,
        course: eventData.subjectInfo.course ? {
          name: eventData.subjectInfo.course.name,
          code: eventData.subjectInfo.course.code
        } : null
      } : null
    };
  };

  const courseSubjectInfo = getCourseSubjectInfo();

  // Get template form ID from event data
  const getTemplateFormId = () => {
    // Priority: templateInfo from API response > eventData templateId
    if (eventData?.templateInfo?.id) {
      return eventData.templateInfo.id;
    }
    if (eventData?.templateId) {
      return eventData.templateId;
    }
    // Fallback: try to get from first assessment
    if (assessments && assessments.length > 0) {
      const firstAssessment = assessments[0];
      return firstAssessment?.templateFormId || firstAssessment?.template?.formId || firstAssessment?.template?.id || null;
    }
    return null;
  };

  const handlePreviewTemplatePDF = async () => {
    const templateFormId = getTemplateFormId();
    
    if (!templateFormId) {
      toast.error('Template information is not available');
      return;
    }

    try {
      setLoadingPDF(true);
      setShowTemplatePreview(true);
      
      // Get PDF blob from API
      const pdfBlob = await templateAPI.getTemplatePDF(templateFormId);
      
      // Create object URL for PDF
      const url = URL.createObjectURL(pdfBlob);
      setTemplatePdfUrl(url);
    } catch (error) {
      console.error('Error loading template PDF:', error);
      toast.error('Failed to load template PDF preview');
      setShowTemplatePreview(false);
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleCloseTemplatePreview = () => {
    setShowTemplatePreview(false);
    if (templatePdfUrl) {
      URL.revokeObjectURL(templatePdfUrl);
      setTemplatePdfUrl(null);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading assessment event details...</p>
        </div>
      </Container>
    );
  }

  if (error || !eventData) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          {error || 'Assessment event not found'}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate(ROUTES.DEPARTMENT_REVIEW_REQUESTS)}>
          <ArrowLeft className="me-2" size={16} />
          Back to Review Requests
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col xs={12}>
          <button
            className="btn btn-link p-0 mb-3 text-decoration-none"
            onClick={() => navigate(ROUTES.DEPARTMENT_REVIEW_REQUESTS)}
            style={{ color: 'var(--bs-primary)' }}
          >
            <ArrowLeft className="me-2" size={20} />
            Back
          </button>
        </Col>
      </Row>

      {/* Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white p-0">
            <div className="border-bottom py-2 px-3">
              <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link 
                    eventKey="overview"
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'overview' ? '600' : '400',
                      opacity: activeTab === 'overview' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <FileText className="me-2" size={16} />
                    Event Overview
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="forms"
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'forms' ? '600' : '400',
                      opacity: activeTab === 'forms' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <Book className="me-2" size={16} />
                    Assessment Forms ({assessments.length})
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
          </Card.Header>

          <Tab.Content>
            {/* Overview Tab */}
            <Tab.Pane eventKey="overview">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">Event Name</h6>
                      <p className="mb-0 fw-semibold">{eventData.eventName}</p>
                    </div>
                    <div className="mb-3">
                      <h6 className="text-muted mb-1 d-flex align-items-center">
                        <Calendar className="me-2" size={16} />
                        Occurrence Date
                      </h6>
                      <span>{formatDate(eventData.occurrenceDate)}</span>
                    </div>
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">Assessment Instrument (Template) Name</h6>
                      <p className="mb-0 fw-semibold">{eventData.templateName}</p>
                      {getTemplateFormId() && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handlePreviewTemplatePDF}
                          className="mt-2 d-inline-flex align-items-center"
                        >
                          <FileEarmarkPdf className="me-1" size={14} />
                          Template Preview
                        </Button>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <h6 className="text-muted mb-1 d-flex align-items-center">
                        <People className="me-2" size={16} />
                        Total Trainees
                      </h6>
                      <Badge bg="info" className="fs-6">{eventData.totalTrainees}</Badge>
                    </div>
                    {eventData.totalTrainers !== undefined && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-1 d-flex align-items-center">
                          <Person className="me-2" size={16} />
                          Total Trainers
                        </h6>
                        <Badge bg="info" className="fs-6">{eventData.totalTrainers}</Badge>
                      </div>
                    )}
                    {courseSubjectInfo?.course && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-1 d-flex align-items-center">
                          <Book className="me-2" size={16} />
                          Course Information
                        </h6>
                        <div>
                          <span className="fw-semibold">{courseSubjectInfo.course.name}</span>
                          {courseSubjectInfo.course.code && (
                            <span className="text-muted ms-2">({courseSubjectInfo.course.code})</span>
                          )}
                        </div>
                      </div>
                    )}
                    {courseSubjectInfo?.subject && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-1 d-flex align-items-center">
                          <Book className="me-2" size={16} />
                          Subject Information
                        </h6>
                        <div>
                          <span className="fw-semibold">{courseSubjectInfo.subject.name}</span>
                          {courseSubjectInfo.subject.code && (
                            <span className="text-muted ms-2">({courseSubjectInfo.subject.code})</span>
                          )}
                          {courseSubjectInfo.subject.course && (
                            <div className="text-muted small mt-1">
                              From course: {courseSubjectInfo.subject.course.name}
                              {courseSubjectInfo.subject.course.code && (
                                <span className="ms-1">({courseSubjectInfo.subject.course.code})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>
                
                {/* Pass/Fail Statistics */}
                <hr className="my-4" />
                <Row>
                  <Col xs={12}>
                    <h6 className="mb-3 fw-bold" style={{ color: '#456882', fontSize: '1.1rem' }}>Assessment Results Overview</h6>
                  </Col>
                  <Col md={4}>
                    <Card className="h-100 border-success">
                      <Card.Body className="text-center">
                        <h3 className="text-success mb-2">{stats.passed}</h3>
                        <p className="text-muted mb-0">Passed</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="h-100 border-danger">
                      <Card.Body className="text-center">
                        <h3 className="text-danger mb-2">{stats.failed}</h3>
                        <p className="text-muted mb-0">Failed</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="h-100 border-primary">
                      <Card.Body className="text-center">
                        <h3 className="text-primary mb-2">{stats.total}</h3>
                        <p className="text-muted mb-0">Total Forms</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Tab.Pane>

            {/* Assessment Forms Tab */}
            <Tab.Pane eventKey="forms">
              <Card.Body className="p-0">
                {/* Subtabs for Assessment Forms */}
                {eventType && (
                  <div className="border-bottom p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <Nav variant="tabs" className="border-0">
                      {eventType === 'processing' ? (
                        <>
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="submitted"
                              onClick={() => setFormsSubTab('submitted')}
                              active={formsSubTab === 'submitted'}
                              style={{ 
                                cursor: 'pointer',
                                color: formsSubTab === 'submitted' ? 'var(--bs-primary)' : '#6c757d',
                                fontWeight: formsSubTab === 'submitted' ? '600' : '400',
                                border: 'none',
                                borderBottom: formsSubTab === 'submitted' ? '2px solid var(--bs-primary)' : '2px solid transparent'
                              }}
                            >
                              <Clock className="me-1" size={14} />
                              Submitted ({assessments.filter(a => a.status === 'SUBMITTED').length})
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="reviewed"
                              onClick={() => setFormsSubTab('reviewed')}
                              active={formsSubTab === 'reviewed'}
                              style={{ 
                                cursor: 'pointer',
                                color: formsSubTab === 'reviewed' ? 'var(--bs-primary)' : '#6c757d',
                                fontWeight: formsSubTab === 'reviewed' ? '600' : '400',
                                border: 'none',
                                borderBottom: formsSubTab === 'reviewed' ? '2px solid var(--bs-primary)' : '2px solid transparent'
                              }}
                            >
                              <CheckCircle className="me-1" size={14} />
                              Reviewed ({assessments.filter(a => a.status === 'APPROVED' || a.status === 'REJECTED').length})
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="cancelled"
                              onClick={() => setFormsSubTab('cancelled')}
                              active={formsSubTab === 'cancelled'}
                              style={{ 
                                cursor: 'pointer',
                                color: formsSubTab === 'cancelled' ? 'var(--bs-primary)' : '#6c757d',
                                fontWeight: formsSubTab === 'cancelled' ? '600' : '400',
                                border: 'none',
                                borderBottom: formsSubTab === 'cancelled' ? '2px solid var(--bs-primary)' : '2px solid transparent'
                              }}
                            >
                              <X className="me-1" size={14} />
                              Cancelled ({assessments.filter(a => a.status === 'CANCELLED').length})
                            </Nav.Link>
                          </Nav.Item>
                        </>
                      ) : (
                        <>
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="approved"
                              onClick={() => setFormsSubTab('approved')}
                              active={formsSubTab === 'approved'}
                              style={{ 
                                cursor: 'pointer',
                                color: formsSubTab === 'approved' ? 'var(--bs-primary)' : '#6c757d',
                                fontWeight: formsSubTab === 'approved' ? '600' : '400',
                                border: 'none',
                                borderBottom: formsSubTab === 'approved' ? '2px solid var(--bs-primary)' : '2px solid transparent'
                              }}
                            >
                              <CheckCircle className="me-1" size={14} />
                              Approved ({assessments.filter(a => a.status === 'APPROVED').length})
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="rejected"
                              onClick={() => setFormsSubTab('rejected')}
                              active={formsSubTab === 'rejected'}
                              style={{ 
                                cursor: 'pointer',
                                color: formsSubTab === 'rejected' ? 'var(--bs-primary)' : '#6c757d',
                                fontWeight: formsSubTab === 'rejected' ? '600' : '400',
                                border: 'none',
                                borderBottom: formsSubTab === 'rejected' ? '2px solid var(--bs-primary)' : '2px solid transparent'
                              }}
                            >
                              <XCircle className="me-1" size={14} />
                              Rejected ({assessments.filter(a => a.status === 'REJECTED').length})
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link 
                              eventKey="cancelled"
                              onClick={() => setFormsSubTab('cancelled')}
                              active={formsSubTab === 'cancelled'}
                              style={{ 
                                cursor: 'pointer',
                                color: formsSubTab === 'cancelled' ? 'var(--bs-primary)' : '#6c757d',
                                fontWeight: formsSubTab === 'cancelled' ? '600' : '400',
                                border: 'none',
                                borderBottom: formsSubTab === 'cancelled' ? '2px solid var(--bs-primary)' : '2px solid transparent'
                              }}
                            >
                              <X className="me-1" size={14} />
                              Cancelled ({assessments.filter(a => a.status === 'CANCELLED').length})
                            </Nav.Link>
                          </Nav.Item>
                        </>
                      )}
                    </Nav>
                  </div>
                )}
                
                {filteredAssessments.length === 0 ? (
                  <Alert variant="info" className="m-3 mb-0">
                    No assessment forms found for this {formsSubTab} filter.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
                      <thead className="sticky-header">
                        <tr>
                          <SortableHeader columnKey="assessmentForm" sortConfig={sortConfig} onSort={handleSort}>
                            Assessment Form
                          </SortableHeader>
                          <SortableHeader columnKey="trainee" sortConfig={sortConfig} onSort={handleSort}>
                            Trainee
                          </SortableHeader>
                          <SortableHeader columnKey="occurrenceDate" sortConfig={sortConfig} onSort={handleSort}>
                            Occurrence Date
                          </SortableHeader>
                          <SortableHeader columnKey="status" sortConfig={sortConfig} onSort={handleSort}>
                            Status
                          </SortableHeader>
                          <SortableHeader columnKey="score" sortConfig={sortConfig} onSort={handleSort}>
                            Score
                          </SortableHeader>
                          <SortableHeader columnKey="result" sortConfig={sortConfig} onSort={handleSort}>
                            Result
                          </SortableHeader>
                          <th 
                            className="fw-semibold text-center"
                            style={{
                              backgroundColor: 'var(--bs-primary)',
                              color: 'white',
                              borderColor: 'var(--bs-primary)'
                            }}
                          >
                            Preview
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.map((item, index) => {
                          return (
                            <tr 
                              key={item.id}
                              className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                              style={{
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
                              }}
                            >
                              <td className="align-middle">
                                <span className="fw-medium">{item.assessmentForm}</span>
                              </td>
                              <td className="align-middle">
                                <div className="d-flex align-items-center">
                                  <Person className="me-2 text-primary" size={18} />
                                  <div>
                                    <h6 className="mb-0 fw-medium">{item.trainee}</h6>
                                    <small className="text-muted">{item.traineeEmail}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="align-middle">
                                <span>{formatDate(item.occurrenceDate)}</span>
                              </td>
                              <td className="align-middle">
                                {getAssessmentStatusBadge(item.status)}
                              </td>
                              <td className="align-middle">
                                {item.status === 'COMPLETED' || item.status === 'APPROVED' ? (
                                  <span className={`fw-bold ${item.percentage >= 70 ? 'text-success' : item.percentage >= 60 ? 'text-warning' : 'text-danger'}`}>
                                    {item.score}/{item.maxScore} ({item.percentage}%)
                                  </span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td className="align-middle">
                                {item.result ? (
                                  <Badge bg={item.result === 'PASSED' ? 'success' : 'danger'}>
                                    {item.result}
                                  </Badge>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td className="align-middle text-center">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => navigate(ROUTES.ASSESSMENTS_SECTIONS(item.id))}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Tab.Pane>
          </Tab.Content>
        </Card>
      </Tab.Container>

      {/* Template PDF Preview Modal */}
      <Modal 
        show={showTemplatePreview} 
        onHide={handleCloseTemplatePreview}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Template Preview - {eventData?.templateName}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: '500px', padding: 0 }}>
          {loadingPDF ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
              <Spinner animation="border" variant="primary" />
              <span className="ms-2">Loading PDF...</span>
            </div>
          ) : templatePdfUrl ? (
            <iframe
              src={templatePdfUrl}
              style={{
                width: '100%',
                height: '600px',
                border: 'none'
              }}
              title="Template PDF Preview"
            />
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
              <p className="text-muted">Failed to load PDF</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTemplatePreview}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AssessmentEventReviewDetailPage;
