import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import {
  ArrowLeft,
  ExclamationTriangle,
  ChatDots,
  Clock,
  CheckCircle,
  XCircle,
  Person,
  Calendar,
  FileText,
} from 'react-bootstrap-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { toast } from 'react-toastify';

const ReportDetailPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');

  useEffect(() => {
    // TODO: Implement API call to fetch report details
    const fetchReport = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockReport = {
          id: reportId,
          title: 'Safety Procedure Issue',
          description: 'Reported safety concern in training module. The safety procedures need to be updated to reflect the latest regulations.',
          requestType: 'SAFETY_REPORT',
          severity: 'HIGH',
          status: 'in_progress',
          reporter: 'John Smith',
          reporterEmail: 'john.smith@company.com',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T14:20:00Z',
          actionsTaken: 'Reported to supervisor immediately',
          isAnonymous: false,
          response: null, // Will be populated when response is added
        };
        
        setReport(mockReport);
      } catch (error) {
        console.error('Error fetching report:', error);
        toast.error('Failed to load report details');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      // TODO: Implement API call to submit response
      console.log('Submitting response:', response);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Response submitted successfully');
      setResponse('');
      
      // Update report with response
      setReport(prev => ({
        ...prev,
        response: {
          content: response,
          respondedBy: 'Current User',
          respondedAt: new Date().toISOString(),
        }
      }));
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { variant: 'danger', icon: ExclamationTriangle, label: 'OPEN' },
      in_progress: { variant: 'warning', icon: Clock, label: 'IN PROGRESS' },
      resolved: { variant: 'success', icon: CheckCircle, label: 'RESOLVED' },
      closed: { variant: 'secondary', icon: XCircle, label: 'CLOSED' },
      pending: { variant: 'warning', icon: Clock, label: 'PENDING' },
      acknowledged: { variant: 'success', icon: CheckCircle, label: 'ACKNOWLEDGED' },
      reviewed: { variant: 'info', icon: CheckCircle, label: 'REVIEWED' },
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
              onClick={() => navigate(ROUTES.REPORTS)}
            >
              <ArrowLeft size={16} className="me-2" />
              Back to Reports
            </Button>
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
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Report ID</small>
                    <code>{report.id}</code>
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <small className="text-muted d-block mb-2">Description</small>
                <p className="mb-0">{report.description}</p>
              </div>

              {report.actionsTaken && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">Actions Taken</small>
                  <p className="mb-0">{report.actionsTaken}</p>
                </div>
              )}

              <hr />

              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <small className="text-muted d-block mb-1">
                      <Person size={12} className="me-1" />
                      Reporter
                    </small>
                    <div>
                      {report.isAnonymous ? (
                        <span className="text-muted">Anonymous</span>
                      ) : (
                        <>
                          <div className="fw-medium">{report.reporter}</div>
                          <small className="text-muted">{report.reporterEmail}</small>
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

          {/* Issue Response Section */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0 d-flex align-items-center">
                <ChatDots className="me-2" size={20} />
                Issue Response
              </h5>
            </Card.Header>
            <Card.Body>
              {report.response ? (
                <div>
                  <Alert variant="success">
                    <Alert.Heading className="d-flex align-items-center">
                      <CheckCircle className="me-2" size={20} />
                      Response Submitted
                    </Alert.Heading>
                    <div className="mb-2">
                      <small className="text-muted d-block mb-1">Response by: {report.response.respondedBy}</small>
                      <small className="text-muted">Date: {formatDate(report.response.respondedAt)}</small>
                    </div>
                  </Alert>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0">{report.response.content}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Response</label>
                    <textarea
                      className="form-control"
                      rows={6}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Enter your response to this issue..."
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      onClick={handleSubmitResponse}
                      disabled={!response.trim()}
                    >
                      <ChatDots className="me-2" size={16} />
                      Submit Response
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Additional Info */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Additional Information</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Last Updated</small>
                <div>{formatDate(report.updatedAt)}</div>
              </div>
              {report.isAnonymous && (
                <Alert variant="info" className="small mb-0">
                  This report was submitted anonymously.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportDetailPage;

