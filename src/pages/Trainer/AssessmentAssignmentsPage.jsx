import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Spinner, Alert, Button, Row, Col, Badge } from 'react-bootstrap';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ArrowLeft, FileEarmarkPdf } from 'react-bootstrap-icons';
import { assessmentAPI } from '../../api';
import { toast } from 'react-toastify';
import { PDFModal } from '../../components/Common';

const statusDisplayMap = {
  NOT_STARTED: { variant: 'secondary', text: 'NOT STARTED' },
  ON_GOING: { variant: 'info', text: 'ON GOING' },
  APPROVED: { variant: 'success', text: 'APPROVED' },
  COMPLETED: { variant: 'success', text: 'COMPLETED' },
  PENDING: { variant: 'warning', text: 'PENDING' },
  DRAFT: { variant: 'primary', text: 'DRAFT' },
  SUBMITTED: { variant: 'dark', text: 'SUBMITTED' },
  CANCELLED: { variant: 'danger', text: 'CANCELLED' }
};

const getStatusBadge = (status) => {
  const config = statusDisplayMap[status] || { variant: 'secondary', text: status || 'Unknown' };
  return <span className={`badge bg-${config.variant}`}>{config.text}</span>;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return { date: '—', time: '' };
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  };
};

const AssessmentAssignmentsPage = () => {
  const { entityType, entityId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({
    loading: true,
    error: null,
    info: location.state || null,
    assessments: [],
    eventInfo: null
  });
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState(null);

  const isValidType = entityType === 'course' || entityType === 'subject';

  useEffect(() => {
    const fetchDetails = async () => {
      if (!entityId || !isValidType) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Invalid assessment context'
        }));
        return;
      }

      // If shouldRefresh flag is set (from navigate back), skip using location.state data
      const shouldRefresh = location.state?.shouldRefresh;

      // Check if we have data from location.state (from Access button) and not refreshing
      if (!shouldRefresh && location.state?.assessments && location.state?.eventInfo) {
        setState({
          loading: false,
          error: null,
          assessments: location.state.assessments || [],
          info: {
            name: location.state.eventInfo?.entityInfo?.name || location.state.name,
            code: location.state.eventInfo?.entityInfo?.code || location.state.code
          },
          eventInfo: location.state.eventInfo || null
        });
        return;
      }

      // If no state data (F5 or direct navigation), use new API
      // Get templateId and occuranceDate from URL query params (set when navigating from Access button)
      // Or from location.state if navigating back from sections page
      const templateId = location.state?.templateId || searchParams.get('templateId');
      const occuranceDate = location.state?.occuranceDate || searchParams.get('occuranceDate');
      
      if (!templateId || !occuranceDate) {
        // Missing required params - show error message
        setState({
          loading: false,
          error: 'Please access this page through the "Access" button from the assessment list.',
          assessments: [],
          info: location.state || null
        });
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        
        let response;
        const requestBody = {
          courseId: entityType === 'course' ? entityId : undefined,
          subjectId: entityType === 'subject' ? entityId : undefined,
          templateId: templateId,
          occuranceDate: occuranceDate
        };

        // Remove undefined properties
        Object.keys(requestBody).forEach(key => 
          requestBody[key] === undefined && delete requestBody[key]
        );

        // Call new API with all required params
        if (entityType === 'course') {
          response = await assessmentAPI.getCourseEvents(requestBody);
        } else {
          response = await assessmentAPI.getSubjectEvents(requestBody);
        }

        if (response?.assessments && response?.eventInfo) {
          setState({
            loading: false,
            error: null,
            assessments: response.assessments || [],
            info: {
              name: response.eventInfo?.entityInfo?.name || response.eventInfo?.name,
              code: response.eventInfo?.entityInfo?.code || ''
            },
            eventInfo: response.eventInfo || null
          });
        } else {
          // If API doesn't return expected data structure, show empty state
          setState({
            loading: false,
            error: null,
            assessments: [],
            info: location.state || null
          });
        }
        
        // Clear shouldRefresh flag from location state after fetching
        if (shouldRefresh) {
          window.history.replaceState({}, document.title);
        }
      } catch (err) {
        console.error('Error loading assessments:', err);
        toast.error('Failed to load assessments');
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.response?.data?.message || err.message || 'Failed to load assessments'
        }));
      }
    };

    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId, isValidType, location.key, searchParams]);

  if (!isValidType) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Invalid assessment type.</Alert>
      </Container>
    );
  }

  const handleAssessTrainee = (record) => {
    // Exclude these statuses: NOT_STARTED, SUBMITTED, APPROVED, CANCELLED
    const excludedStatuses = ['NOT_STARTED', 'SUBMITTED', 'APPROVED', 'CANCELLED'];
    if (excludedStatuses.includes(record.status)) return;
    
    // Get templateId and occuranceDate from URL params or location.state
    const templateId = location.state?.templateId || searchParams.get('templateId');
    const occuranceDate = location.state?.occuranceDate || searchParams.get('occuranceDate');
    
    // Navigate to sections page with return info
    navigate(ROUTES.ASSESSMENTS_SECTIONS(record.id), {
      state: {
        returnPath: location.pathname + location.search,
        entityType,
        entityId,
        templateId,
        occuranceDate,
        info: state.info
      }
    });
  };

  const handleViewPDF = (pdfUrl) => {
    setSelectedPDFUrl(pdfUrl);
    setShowPDFModal(true);
  };

  const handleClosePDFModal = () => {
    setShowPDFModal(false);
    setSelectedPDFUrl(null);
  };

  // Calculate pass/fail statistics
  const calculateStats = () => {
    const total = state.assessments.length;
    let passed = 0;
    let failed = 0;
    
    state.assessments.forEach(assessment => {
      if (assessment.status === 'APPROVED' || assessment.status === 'COMPLETED') {
        const score = assessment.resultScore || 0;
        if (score >= 70) {
          passed++;
        } else {
          failed++;
        }
      } else if (assessment.status === 'REJECTED' || assessment.status === 'CANCELLED') {
        failed++;
      }
    });
    
    return { total, passed, failed };
  };

  const stats = calculateStats();
  const eventInfo = state.eventInfo || location.state?.eventInfo;

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center mb-3 flex-wrap gap-3">
        <Button
          variant="outline-secondary"
          className="d-flex align-items-center justify-content-center"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="me-2" />
          Back
        </Button>
        <div>
          <h4 className="mb-1">Assessment Event Details</h4>
        </div>
      </div>

      {/* General Information Section */}
      {!state.loading && !state.error && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">General Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="mb-2 fw-bold" style={{ fontSize: '1rem', color: '#333' }}>Event Details</h6>
                  <p className="mb-0 fw-semibold">
                    {eventInfo?.name || state.assessments[0]?.name || '—'}
                  </p>
                  {eventInfo?.occuranceDate || eventInfo?.occurrenceDate || state.assessments[0]?.occuranceDate ? (
                    <div className="mt-2">
                      <span className="text-muted">
                        {formatDateTime(eventInfo?.occuranceDate || eventInfo?.occurrenceDate || state.assessments[0]?.occuranceDate).date}
                      </span>
                    </div>
                  ) : null}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="mb-2 fw-bold" style={{ fontSize: '1rem', color: '#333' }}>
                    {entityType === 'course' ? 'Course' : 'Subject'} Details
                  </h6>
                  <p className="mb-0 fw-semibold">
                    {state.info?.name || '—'}
                    {state.info?.code ? (
                      <Badge bg="secondary" className="ms-2">{state.info.code}</Badge>
                    ) : null}
                  </p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="mb-2 fw-bold" style={{ fontSize: '1rem', color: '#333' }}>
                    Trainers in Assessments
                  </h6>
                  <p className="mb-0 text-muted">Trainer information will be displayed here</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <h6 className="mb-2 fw-bold" style={{ fontSize: '1rem', color: '#333' }}>Total Pass/Fail</h6>
                  <div className="d-flex gap-3">
                    <div>
                      <Badge bg="success" className="px-3 py-2 fs-6">Passed: {stats.passed}</Badge>
                    </div>
                    <div>
                      <Badge bg="danger" className="px-3 py-2 fs-6">Failed: {stats.failed}</Badge>
                    </div>
                    <div>
                      <Badge bg="info" className="px-3 py-2 fs-6">Total: {stats.total}</Badge>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          {state.loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : state.error ? (
            <Alert variant="danger" className="mb-0">
              {state.error}
            </Alert>
          ) : state.assessments.length === 0 ? (
            <div className="text-center py-4 text-muted">No assessments found.</div>
          ) : (
            <div className="scrollable-table-container" style={{ maxHeight: '70vh' }}>
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Assessment Form</th>
                    <th>Trainee</th>
                    <th>Occurrence date</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Preview</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                      {state.assessments.map((item) => {
                    const formatted = formatDateTime(item.occuranceDate);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-semibold">{item.name}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{item.trainee?.fullName || '—'}</div>
                          <small className="text-muted">{item.trainee?.eid || item.trainee?.email || '—'}</small>
                        </td>
                        <td>
                          <div>{formatted.date}</div>
                        </td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>{item.resultScore !== null && item.resultScore !== undefined ? item.resultScore : '—'}</td>
                        <td>{item.resultText || '—'}</td>
                            <td>
                              {item.pdfUrl ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleViewPDF(item.pdfUrl)}
                                  className="d-flex align-items-center"
                                >
                                  <FileEarmarkPdf className="me-1" size={14} />
                                  Preview
                                </Button>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="text-center">
                              {(() => {
                                const excludedStatuses = ['NOT_STARTED', 'SUBMITTED', 'APPROVED', 'CANCELLED'];
                                const canAssess = !excludedStatuses.includes(item.status);
                                return canAssess ? (
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleAssessTrainee(item)}
                                  >
                                    View Form
                                  </Button>
                                ) : (
                                  <span className="text-muted">—</span>
                                );
                              })()}
                            </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* PDF Modal */}
      <PDFModal
        show={showPDFModal}
        onHide={handleClosePDFModal}
        pdfUrl={selectedPDFUrl}
        title="Assessment PDF"
      />
    </Container>
  );
};

export default AssessmentAssignmentsPage;

