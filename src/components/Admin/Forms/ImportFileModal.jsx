import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmark, FileEarmarkText, Download } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { uploadAPI } from '../../../api';

const ImportFileModal = ({ show, onHide, onImportSuccess, onImportError }) => {
  const navigate = useNavigate();
  const [importType, setImportType] = useState('with-fields'); // 'with-fields' or 'without-fields'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type - only DOCX files
      const allowedTypes = ['.docx'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please select a valid Word document file (.docx)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsUploading(true);
    try {
      // Get docs type from filename (first 3 characters)
      const docsType = uploadAPI.getDocsType(selectedFile.name);
      
      // Upload file using uploadAPI
      const result = await uploadAPI.uploadDocument(selectedFile, docsType);
      
      // Extract URL from response data structure
      let documentUrl;
      if (result.data && result.data.length > 0 && result.data[0].url) {
        documentUrl = result.data[0].url;
        console.log(`🎯 Form Template Upload Success! Document URL: ${documentUrl}`);
      } else {
        throw new Error('Invalid response format from upload API');
      }
      
      // Navigate to editor with document URL
      navigate('/admin/forms/editor', {
        state: {
          documentUrl: documentUrl,
          fileName: selectedFile.name.replace('.docx', ''),
          importType: importType === 'with-fields' ? 'File with fields' : 'File without fields'
        }
      });
      
      // Close modal
      handleClose();
      
      // Call success callback
      const importTypeLabel = importType === 'with-fields' ? 'File with fields' : 'File without fields';
      onImportSuccess(importTypeLabel, selectedFile.name);
    } catch (error) {
      onImportError(error.message || 'Import failed');
    } finally {
      setIsUploading(false);
    }
  };


  const handleClose = () => {
    setSelectedFile(null);
    setImportType('with-fields');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onHide();
  };

  const downloadTemplate = (type) => {
    // Simulate template download
    toast.info(`Downloading ${type} template...`);
  };






  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="import-file-modal">
      <Modal.Header 
        className="bg-primary-custom text-white border-0"
        closeButton
        closeVariant="white"
      >
        <Modal.Title className="d-flex align-items-center">
          <Upload className="me-2" size={20} />
          Import Form File
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Import Type Selection */}
        <div className="mb-4">
          <h6 className="text-primary-custom mb-3">Select Import Type</h6>
          <Row className="g-3">
            <Col md={6}>
              <Card 
                className={`h-100 cursor-pointer ${importType === 'with-fields' ? 'border-primary bg-light' : 'border-secondary'}`}
                onClick={() => setImportType('with-fields')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center p-4 d-flex flex-column">
                  <div className="flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <FileEarmarkText size={48} className="text-primary mb-3" />
                      <h6 className="text-primary">File with Fields</h6>
                      <p className="text-muted small mb-3">
                        Import a Word document that already contains predefined form fields and structure. The system will automatically parse and create form templates.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate('with-fields');
                        }}
                      >
                        <Download className="me-1" size={14} />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card 
                className={`h-100 cursor-pointer ${importType === 'without-fields' ? 'border-primary bg-light' : 'border-secondary'}`}
                onClick={() => setImportType('without-fields')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center p-4 d-flex flex-column">
                  <div className="flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <FileEarmark size={48} className="text-success mb-3" />
                      <h6 className="text-success">File without Fields</h6>
                      <p className="text-muted small mb-3">
                        Import a raw Word document without predefined structure. You will manually define form fields and mapping after import.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate('without-fields');
                        }}
                      >
                        <Download className="me-1" size={14} />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Instructions when no import type selected */}
        {!importType && (
          <Alert variant="info" className="mb-4">
            <h6 className="text-primary-custom mb-2">Please select an import type</h6>
            <p className="mb-0 small">
              Choose between "File with Fields" or "File without Fields" above to continue with the import process.
            </p>
          </Alert>
        )}

        {/* File Upload Section - Only show after import type is selected */}
        {importType && (
          <>
            <div className="mb-4">
              <h6 className="text-primary-custom mb-3">Select File</h6>
              <Form.Group>
                       <Form.Control
                         ref={fileInputRef}
                         type="file"
                         accept=".docx"
                         onChange={handleFileSelect}
                         className="mb-2"
                       />
                       <Form.Text className="text-muted">
                         Supported format: Word document (.docx). Maximum file size: 10MB
                       </Form.Text>
              </Form.Group>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <Alert variant="info" className="mb-4">
                <div className="d-flex align-items-center">
                  <FileEarmark className="me-2" size={20} />
                  <div>
                    <strong>Selected File:</strong> {selectedFile.name}
                    <br />
                    <small className="text-muted">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>
                </div>
              </Alert>
            )}

            {/* Import Instructions */}
            <Alert variant="light" className="mb-0">
              <h6 className="text-primary-custom mb-2">Import Instructions</h6>
                     {importType === 'with-fields' ? (
                       <ul className="mb-0 small">
                         <li><strong>Automatic Processing:</strong> System will parse Word document and create form templates automatically</li>
                         <li>Document should contain predefined form fields and structure</li>
                         <li>Form fields will be automatically mapped and validated</li>
                         <li>Content will be converted to editable form template</li>
                         <li>Download the template above for the correct format</li>
                       </ul>
                            ) : (
                              <ul className="mb-0 small">
                                <li><strong>Manual Processing:</strong> You will manually define form fields and structure</li>
                                <li>Document content will be parsed and converted to editable format</li>
                                <li>Use merge field buttons to add dynamic fields to the content</li>
                                <li>Perfect for documents that need custom field mapping</li>
                                <li>Full control over form structure and field placement</li>
                              </ul>
                            )}
            </Alert>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={isUploading}
        >
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        {importType && (
          <Button
            variant="primary-custom"
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}></span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="me-2" size={16} />
                Import File
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ImportFileModal;
