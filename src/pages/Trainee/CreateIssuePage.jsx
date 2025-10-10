import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Send, FileText, ExclamationTriangle } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

const CreateIssuePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'MEDIUM',
    description: '',
    attachments: []
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to submit issue report
      console.log('Submitting issue report:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Issue report submitted successfully!');
      
      // Reset form
      setFormData({
        title: '',
        category: '',
        priority: 'MEDIUM',
        description: '',
        attachments: []
      });
    } catch (error) {
      console.error('Error submitting issue report:', error);
      toast.error('Failed to submit issue report. Please try again.');
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
              <h2 className="mb-1">Create Issue Report/Feedback</h2>
              <p className="text-muted mb-0">Report issues or provide feedback about your training experience</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <FileText className="me-2" size={20} />
                Issue Report Form
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Brief description of the issue"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="TECHNICAL">Technical Issue</option>
                        <option value="CONTENT">Content Problem</option>
                        <option value="ASSESSMENT">Assessment Issue</option>
                        <option value="ACCESS">Access Problem</option>
                        <option value="FEEDBACK">General Feedback</option>
                        <option value="OTHER">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Form.Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Please provide detailed information about the issue or feedback..."
                    required
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
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Guidelines</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Before submitting:</h6>
                <ul className="small text-muted mb-0">
                  <li>Check if the issue has already been reported</li>
                  <li>Provide clear and specific details</li>
                  <li>Include steps to reproduce the issue</li>
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
                <strong>Note:</strong> All reports are reviewed by our support team. You will receive a response via email.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateIssuePage;
