import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Send, FileText } from 'react-bootstrap-icons';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { PermissionWrapper } from '../../components/Common';
import UnifiedReportsPage from '../SQA/UnifiedReportsPage';
import reportAPI from '../../api/reports';

// Add custom CSS to override Bootstrap card-header styles
const customStyles = `
  .create-issue-form .card-header {
    background-color: #1b3c53 !important;
    color: #ffffff !important;
    border-bottom: 1px solid #dee2e6 !important;
  }
  .create-issue-form .card-header h5 {
    color: #ffffff !important;
  }
  .create-issue-form .card-header svg {
    color: #ffffff !important;
  }
  .create-issue-guidelines .card-header {
    background-color: #1b3c53 !important;
    color: #ffffff !important;
    border-bottom: 1px solid #dee2e6 !important;
  }
  .create-issue-guidelines .card-header h5 {
    color: #ffffff !important;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

const CreateIssuePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const showForm = searchParams.get('form') === 'true';
  
  const [formData, setFormData] = useState({
    requestType: '',
    severity: 'MEDIUM',
    title: '',
    description: '',
    actionsTaken: '',
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.requestType || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        requestType: formData.requestType,
        title: formData.title,
        description: formData.description,
        actionsTaken: formData.actionsTaken || '',
        severity: formData.severity,
        isAnonymous: formData.isAnonymous
      };

      await reportAPI.createReport(payload);
      
      toast.success('Report submitted successfully!');
      
      // Reset form and navigate back to list
      setFormData({
        requestType: '',
        severity: 'MEDIUM',
        title: '',
        description: '',
        actionsTaken: '',
        isAnonymous: false
      });
      
      // Navigate back to issue list
      setSearchParams({});
    } catch (error) {
      console.error('Error submitting report:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit report. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShowForm = () => {
    setSearchParams({ form: 'true' });
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  // Show form if form=true in URL params
  if (showForm) {
    return (
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center justify-content-start">
              <Button variant="outline-secondary" onClick={handleBackToList} className="me-3">
                Back to List
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm create-issue-form">
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  <FileText className="me-2" size={20} />
                  Incident/Feedback Report Form
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Brief description of the incident or feedback"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Request Type *</Form.Label>
                        <Form.Select
                          name="requestType"
                          value={formData.requestType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select request type</option>
                          <option value="SAFETY_REPORT">Safety Report</option>
                          <option value="INSTRUCTOR_REPORT">Instructor Report</option>
                          <option value="FATIGUE_REPORT">Fatigue Report</option>
                          <option value="TRAINING_PROGRAM_REPORT">Training Program Report</option>
                          <option value="FACILITIES_REPORT">Facilities Report</option>
                          <option value="COURSE_ORGANIZATION_REPORT">Course Organization Report</option>
                          <option value="FEEDBACK">Feedback</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Severity</Form.Label>
                        <Form.Select
                          name="severity"
                          value={formData.severity}
                          onChange={handleInputChange}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Please provide detailed information about the incident or feedback..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Actions Taken</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="actionsTaken"
                      value={formData.actionsTaken}
                      onChange={handleInputChange}
                      placeholder="Describe any actions you have already taken regarding this incident..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={handleInputChange}
                      label="Submit anonymously (your identity will be kept confidential)"
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="me-2" size={16} />
                          Submit Incident/Feedback Report
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm create-issue-guidelines">
              <Card.Header>
                <h5 className="mb-0">Guidelines</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <h6>Before submitting:</h6>
                  <ul className="small text-muted mb-0">
                    <li>Check if the incident has already been reported</li>
                    <li>Provide clear and specific details</li>
                    <li>Include steps to reproduce the incident</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <h6>Response time:</h6>
                  <ul className="small text-muted mb-0">
                    <li>High priority: Within 24 hours</li>
                    <li>Medium priority: Within 2-3 days</li>
                    <li>Low priority: Within 1 week</li>
                  </ul>
                </div>

                <Alert variant="info" className="small">
                  <strong>Note:</strong> All incident/feedback reports are reviewed by our support team. You will receive a response via email.
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Show list by default
  return <UnifiedReportsPage source="/reports/create" onShowForm={handleShowForm} />;
};

export default CreateIssuePage;
