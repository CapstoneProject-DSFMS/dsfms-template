import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Spinner, Alert, Button } from 'react-bootstrap';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ArrowLeft } from 'react-bootstrap-icons';
import { assessmentAPI } from '../../api';
import { toast } from 'react-toastify';

const statusDisplayMap = {
  NOT_STARTED: { variant: 'secondary', text: 'Not Started' },
  ON_GOING: { variant: 'info', text: 'On Going' },
  APPROVED: { variant: 'success', text: 'Approved' },
  COMPLETED: { variant: 'success', text: 'Completed' },
  PENDING: { variant: 'warning', text: 'Pending' },
  DRAFT: { variant: 'primary', text: 'Draft' },
  SUBMITTED: { variant: 'dark', text: 'Submitted' },
  CANCELLED: { variant: 'danger', text: 'Cancelled' }
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
    assessments: []
  });

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

      // Check if we have data from location.state (from Access button)
      if (location.state?.assessments && location.state?.eventInfo) {
        setState({
          loading: false,
          error: null,
          assessments: location.state.assessments || [],
          info: {
            name: location.state.eventInfo?.entityInfo?.name || location.state.name,
            code: location.state.eventInfo?.entityInfo?.code || location.state.code
          }
        });
        return;
      }

      // If no state data (F5 or direct navigation), use new API
      // Get templateId and occuranceDate from URL query params (set when navigating from Access button)
      const templateId = searchParams.get('templateId');
      const occuranceDate = searchParams.get('occuranceDate');
      
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
            }
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
  }, [entityType, entityId, isValidType, location.state, navigate, searchParams]);

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
    navigate(ROUTES.ASSESSMENTS_SECTIONS(record.id));
  };

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
          <h4 className="mb-1">{entityType === 'course' ? 'Course Assessments' : 'Subject Assessments'}</h4>
          {state.info && (
            <p className="text-muted mb-0">
              {state.info.name}
              {state.info.code ? ` · ${state.info.code}` : ''}
            </p>
          )}
        </div>
      </div>

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
                    <th>Assessment</th>
                    <th>Trainee</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>PDF</th>
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
                                <a href={item.pdfUrl} target="_blank" rel="noreferrer">
                                  View
                                </a>
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
                                    Assess
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
    </Container>
  );
};

export default AssessmentAssignmentsPage;

