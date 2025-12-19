import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import {
  ArrowLeft,
  ExclamationTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Person,
  Calendar,
  FileText,
} from 'react-bootstrap-icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { toast } from 'react-toastify';
import reportAPI from '../../api/reports';

const ReportDetailPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get source from location.state (default to '/reports' if not provided)
  const source = location.state?.from || '/reports';
  const activeTab = location.state?.tab || 'incidents';
  const isFromIssueList = source === '/reports/create';
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [resolveText, setResolveText] = useState('');
  const [resolving, setResolving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await reportAPI.getReportById(reportId);
        setReport(data);
      } catch (error) {
        console.error('Error fetching report:', error);
        toast.error('Failed to load report details');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
      setActionLoading(true);
      await reportAPI.cancelReport(reportId);
      toast.success('Report cancelled successfully');
      setShowCancelModal(false);
      navigate(source);
    } catch (error) {
      console.error('Error cancelling report:', error);
      toast.error('Failed to cancel report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      setActionLoading(true);
      await reportAPI.acknowledgeReport(reportId);
      toast.success('Report acknowledged successfully');
      setReport(prev => ({
        ...prev,
        status: 'ACKNOWLEDGED'
      }));
    } catch (error) {
      console.error('Error acknowledging report:', error);
      toast.error('Failed to acknowledge report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveText.trim()) {
      toast.error('Please enter resolution notes');
      return;
    }

    try {
      setResolving(true);
      await reportAPI.respondToReport(reportId, resolveText);
      toast.success('Report resolved successfully');
      setShowResolveModal(false);
      setResolveText('');
      setReport(prev => ({
        ...prev,
        status: 'RESOLVED',
        response: resolveText
      }));
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Failed to resolve report');
    } finally {
      setResolving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    if (isFromIssueList) {
      navigate('/reports/create');
    } else {
      // Navigate back to /reports with the active tab as query parameter
      navigate(`/reports?tab=${activeTab}`);
    }
  };

  const renderActionButtons = () => {
    // If from Issue List, only show Cancel button when status is SUBMITTED (Pending)
    if (isFromIssueList) {
      if (report?.status !== 'SUBMITTED') {
        return null;
      }
      return (
        <Button
          variant="danger"
          size="sm"
          onClick={handleCancel}
          disabled={actionLoading}
        >
          Cancel
        </Button>
      );
    }

    // If from Reports page, show buttons based on status
    return (
      <>
        {report?.status === 'SUBMITTED' && (
          <Button
            variant="success"
            size="sm"
            onClick={handleAcknowledge}
            disabled={actionLoading}
          >
            Acknowledge
          </Button>
        )}
        {report?.status === 'ACKNOWLEDGED' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowResolveModal(true)}
            disabled={actionLoading}
          >
            Resolve
          </Button>
        )}
      </>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUBMITTED: { variant: 'warning', icon: Clock, label: 'Pending' },
      ACKNOWLEDGED: { variant: 'info', icon: CheckCircle, label: 'Acknowledged' },
      RESOLVED: { variant: 'success', icon: CheckCircle, label: 'Resolved' },
      CANCELLED: { variant: 'secondary', icon: XCircle, label: 'Cancelled' },
      // Keep old mapping for compatibility
      open: { variant: 'danger', icon: ExclamationTriangle, label: 'Open' },
      in_progress: { variant: 'warning', icon: Clock, label: 'In Progress' },
      pending: { variant: 'warning', icon: Clock, label: 'Pending' },
      acknowledged: { variant: 'success', icon: CheckCircle, label: 'Acknowledged' },
      reviewed: { variant: 'info', icon: CheckCircle, label: 'Reviewed' },
    };

    const config = statusConfig[status] || statusConfig.open;
    const IconComponent = config.icon;

    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {config.label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      LOW: 'info',
      MEDIUM: 'warning',
      HIGH: 'danger',
      CRITICAL: 'dark',
    };

    return <Badge bg={severityConfig[severity] || 'secondary'}>{severity}</Badge>;
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading report details...</p>
        </div>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Report Not Found</Alert.Heading>
          <p>The requested report could not be found.</p>
          <Button variant="outline-primary" onClick={() => navigate(ROUTES.REPORTS)}>
            Back to Reports
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleBack}
            >
              <ArrowLeft size={16} className="me-2" />
              {isFromIssueList ? 'Back to Issue List' : 'Back to Reports'}
            </Button>
            <div className="d-flex gap-2">
              {renderActionButtons()}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Report Details */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 d-flex align-items-center">
                  <FileText className="me-2" size={20} />
                  Report Details
                </h5>
                {getStatusBadge(report.status)}
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Title</small>
                    <h6 className="mb-0">{report.title}</h6>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Request Type</small>
                    <Badge bg="primary">{report.requestType?.replace(/_/g, ' ')}</Badge>
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Severity</small>
                    {getSeverityBadge(report.severity)}
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <small className="text-muted d-block mb-2">Description</small>
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{report.description}</p>
              </div>

              {report.actionsTaken && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">Actions Taken</small>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{report.actionsTaken}</p>
                </div>
              )}

              {report.response && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">Resolution Notes</small>
                  <Alert variant="success">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{report.response}</p>
                  </Alert>
                </div>
              )}

              <hr />

              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <small className="text-muted d-block mb-1">
                      <Person size={12} className="me-1" />
                      Created By
                    </small>
                    <div>
                      {report?.isAnonymous ? (
                        <span className="text-muted">Anonymous</span>
                      ) : (
                        <>
                          <div className="fw-medium">
                            {report?.createdBy?.lastName}{report?.createdBy?.middleName ? ' ' + report?.createdBy?.middleName : ''} {report?.createdBy?.firstName}
                          </div>
                          <small className="text-muted">{report?.createdBy?.email}</small>
                        </>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <small className="text-muted d-block mb-1">
                      <Calendar size={12} className="me-1" />
                      Created Date
                    </small>
                    <div>{formatDate(report.createdAt)}</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Report Meta Info */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Report Information</h6>
            </Card.Header>
            <Card.Body>
              {report?.isAnonymous ? (
                <Alert variant="info" className="mb-0">
                  This report was submitted anonymously.
                </Alert>
              ) : (
                <>
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Created By</small>
                    <div>
                      {report?.createdBy?.lastName}{report?.createdBy?.middleName ? ' ' + report?.createdBy?.middleName : ''} {report?.createdBy?.firstName}
                      <br />
                      <small className="text-muted">{report?.createdBy?.email}</small>
                    </div>
                  </div>
                  {report?.managedBy && (
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Managed By</small>
                      <div>
                        {report?.managedBy?.lastName}{report?.managedBy?.middleName ? ' ' + report?.managedBy?.middleName : ''} {report?.managedBy?.firstName}
                        <br />
                        <small className="text-muted">{report?.managedBy?.email}</small>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this report? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCancelModal(false)}
            disabled={actionLoading}
          >
            Keep Report
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmCancel}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Cancelling...
              </>
            ) : (
              'Cancel Report'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Resolve Modal */}
      <Modal show={showResolveModal} onHide={() => {
        setShowResolveModal(false);
        setResolveText('');
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Resolve Report - Add Resolution Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Resolution Notes *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={resolveText}
                onChange={(e) => setResolveText(e.target.value)}
                placeholder="Enter details about how this issue was resolved..."
                required
              />
              <Form.Text className="text-muted">
                Please provide detailed information about the resolution of this issue.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowResolveModal(false);
              setResolveText('');
            }}
            disabled={resolving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleResolve}
            disabled={!resolveText.trim() || resolving}
          >
            {resolving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle className="me-2" size={16} />
                Resolve
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReportDetailPage;
