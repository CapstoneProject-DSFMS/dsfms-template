import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { Upload, X, Download, FileEarmarkSpreadsheet } from 'react-bootstrap-icons';

const BulkImportTraineesModal = ({ show, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setFile(null);
    setError('');
    onClose();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      
      await onImport(formData);
      handleClose();
    } catch (error) {
      setError(error.message || 'Failed to import trainees');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = [
      'EID,First Name,Last Name,Middle Name,Email,Phone Number,Date of Birth,Address,Department',
      'TR001,John,Doe,Michael,john.doe@example.com,+1234567890,1990-01-15,123 Main St,Department A',
      'TR002,Jane,Smith,Elizabeth,jane.smith@example.com,+1234567891,1992-05-20,456 Oak Ave,Department B'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trainees_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Upload className="me-2" size={20} />
          Bulk Import Trainees
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <div className="text-center mb-4">
            <FileEarmarkSpreadsheet size={48} className="text-primary mb-3" />
            <h5>Import Trainees from File</h5>
            <p className="text-muted">
              Upload a CSV or Excel file containing trainee information. 
              Make sure your file follows the required format.
            </p>
          </div>

          <Row className="mb-4">
            <Col md={6}>
              <div className="border rounded p-3 text-center">
                <h6 className="mb-2">Download Template</h6>
                <p className="text-muted small mb-3">
                  Get the CSV template with the correct format
                </p>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={downloadTemplate}
                >
                  <Download className="me-1" size={16} />
                  Download Template
                </Button>
              </div>
            </Col>
            <Col md={6}>
              <div className="border rounded p-3 text-center">
                <h6 className="mb-2">Upload File</h6>
                <p className="text-muted small mb-3">
                  Select your CSV or Excel file
                </p>
                <Form.Control
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </div>
            </Col>
          </Row>

          {file && (
            <Alert variant="info" className="mb-3">
              <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </Alert>
          )}

          <div className="bg-light rounded p-3">
            <h6 className="mb-2">Required Fields:</h6>
            <ul className="mb-0 small text-muted">
              <li><strong>EID:</strong> Unique trainee identifier</li>
              <li><strong>First Name:</strong> Trainee's first name</li>
              <li><strong>Last Name:</strong> Trainee's last name</li>
              <li><strong>Email:</strong> Valid email address</li>
              <li><strong>Phone Number:</strong> Contact phone number</li>
              <li><strong>Date of Birth:</strong> Format: YYYY-MM-DD</li>
            </ul>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 p-4">
          <Button 
            variant="outline-secondary" 
            onClick={handleClose} 
            disabled={loading}
          >
            <X className="me-2" size={16} />
            Cancel
          </Button>
          
          <Button
            variant="primary"
            type="submit"
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="me-2" size={16} />
                Import Trainees
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BulkImportTraineesModal;
