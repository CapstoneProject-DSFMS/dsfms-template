import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { PersonCheck, Upload, Trash, Eye, Save, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const ConfigureSignaturePage = () => {
  const navigate = useNavigate();
  const [signature, setSignature] = useState(null);
  const [previewSignature, setPreviewSignature] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSignature(file);
          setPreviewSignature(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setMessage({ type: 'danger', text: 'Please upload an image file.' });
      }
    }
  };

  const handleSaveSignature = async () => {
    if (!signature) {
      setMessage({ type: 'warning', text: 'Please upload a signature first.' });
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: 'Signature saved successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to save signature. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSignature = () => {
    setSignature(null);
    setPreviewSignature(null);
    setMessage({ type: 'info', text: 'Signature removed.' });
  };

  const handleBackToProfile = () => {
    navigate(ROUTES.PROFILE);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button 
              variant="outline-secondary" 
              onClick={handleBackToProfile}
              className="me-3"
            >
              <ArrowLeft size={16} className="me-2" />
              Back to Profile
            </Button>
          </div>
          <h2 className="mb-2">Configure Signature</h2>
          <p className="text-muted">Upload and manage your digital signature for assessments</p>
        </Col>
      </Row>

      {message.text && (
        <Alert variant={message.type} className="mb-4">
          {message.text}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <PersonCheck size={20} className="me-2" />
                Digital Signature
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label>Upload Signature Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="mb-3"
                  />
                  <Form.Text className="text-muted">
                    Supported formats: JPG, PNG, GIF. Maximum size: 2MB
                  </Form.Text>
                </Form.Group>

                {previewSignature && (
                  <Form.Group className="mb-4">
                    <Form.Label>Signature Preview</Form.Label>
                    <div className="border rounded p-3 text-center bg-light">
                      <img
                        src={previewSignature}
                        alt="Signature Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                        className="img-fluid"
                      />
                    </div>
                  </Form.Group>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleSaveSignature}
                    disabled={!signature || saving}
                  >
                    {saving ? (
                      <>
                        <span 
                          className="spinner-border spinner-border-sm me-2" 
                          role="status" 
                          aria-hidden="true"
                          style={{ width: '0.75rem', height: '0.75rem', borderWidth: '0.15em' }}
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="me-2" />
                        Save Signature
                      </>
                    )}
                  </Button>
                  
                  {previewSignature && (
                    <>
                      <Button
                        variant="outline-info"
                        onClick={() => setShowPreview(true)}
                      >
                        <Eye size={16} className="me-2" />
                        Preview
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={handleRemoveSignature}
                      >
                        <Trash size={16} className="me-2" />
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Signature Guidelines</h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <small className="text-muted">
                    <strong>Format:</strong> Use clear, high-contrast signature
                  </small>
                </li>
                <li className="mb-2">
                  <small className="text-muted">
                    <strong>Size:</strong> Recommended 300x100 pixels
                  </small>
                </li>
                <li className="mb-2">
                  <small className="text-muted">
                    <strong>Background:</strong> White or transparent background
                  </small>
                </li>
                <li className="mb-2">
                  <small className="text-muted">
                    <strong>Quality:</strong> High resolution for clarity
                  </small>
                </li>
                <li className="mb-0">
                  <small className="text-muted">
                    <strong>Usage:</strong> Will be used on all assessment documents
                  </small>
                </li>
              </ul>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Current Status</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                {signature ? (
                  <>
                    <div className="text-success mb-2">
                      <PersonCheck size={32} />
                    </div>
                    <h6 className="text-success">Signature Configured</h6>
                    <small className="text-muted">
                      Your signature is ready for use
                    </small>
                  </>
                ) : (
                  <>
                    <div className="text-muted mb-2">
                      <PersonCheck size={32} />
                    </div>
                    <h6 className="text-muted">No Signature</h6>
                    <small className="text-muted">
                      Upload a signature to get started
                    </small>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Signature Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewSignature && (
            <div className="border rounded p-4 bg-light">
              <img
                src={previewSignature}
                alt="Signature Preview"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
                className="img-fluid"
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ConfigureSignaturePage;

