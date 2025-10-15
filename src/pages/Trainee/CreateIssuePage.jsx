import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Send, FileText, ExclamationTriangle } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

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
  const [formData, setFormData] = useState({
    request_type: '',
    severity: 'MEDIUM',
    title: '',
    description: '',
    actions_taken: '',
    is_anonymous: false
  });
  const [loading, setLoading] = useState(false);

  // Custom styles for headers
  const headerStyle = {
    backgroundColor: '#1b3c53',
    color: '#ffffff',
    borderBottom: '1px solid #dee2e6'
  };

  const guidelinesHeaderStyle = {
    backgroundColor: '#456882',
    color: '#ffffff',
    borderBottom: '1px solid #dee2e6'
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to submit incident/feedback report
      console.log('Submitting incident/feedback report:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Incident/Feedback report submitted successfully!');
      
      // Reset form
      setFormData({
        request_type: '',
        severity: 'MEDIUM',
        title: '',
        description: '',
        actions_taken: '',
        is_anonymous: false
      });
    } catch (error) {
      console.error('Error submitting incident/feedback report:', error);
      toast.error('Failed to submit incident/feedback report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <ExclamationTriangle className="me-2" size={28} />
            <div>
              <h2 className="mb-1">Create Incident/Feedback Report</h2>
              <p className="text-muted mb-0">Report incidents or provide feedback about your training experience</p>
            </div>
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
                        name="request_type"
                        value={formData.request_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select request type</option>
                        <option value="SAFETY_REPORT">Safety Report</option>
                        <option value="ASSESSMENT_APPROVAL_REQUEST">Assessment Approval Request</option>
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
                    name="actions_taken"
                    value={formData.actions_taken}
                    onChange={handleInputChange}
                    placeholder="Describe any actions you have already taken regarding this incident..."
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    name="is_anonymous"
                    checked={formData.is_anonymous}
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
                  <li>Attach screenshots if applicable</li>
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
};

export default CreateIssuePage;
