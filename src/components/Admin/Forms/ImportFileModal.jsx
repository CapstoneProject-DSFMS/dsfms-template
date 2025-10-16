import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmark, FileEarmarkText, Download } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      // Different processing logic based on import type
      if (importType === 'with-fields') {
        await handleImportWithFields(selectedFile);
      } else {
        await handleImportWithoutFields(selectedFile);
      }
      
      // Parse file content (simulate)
      const parsedContent = await parseFileContent(selectedFile, importType);
      
      // Navigate to editor with parsed content
      navigate('/admin/forms/editor', {
        state: {
          content: parsedContent,
          fileName: selectedFile.name,
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

  // Separate processing logic for files with fields
  const handleImportWithFields = async (file) => {
    // Processing file with fields
    
    // Simulate API call for files with predefined fields
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Logic for files that already have form structure:
    // 1. Parse file to extract field definitions
    // 2. Validate field structure
    // 3. Create form template with predefined fields
    // 4. Map data to form fields
    
    // File with fields processed successfully
  };

  // Separate processing logic for files without fields
  const handleImportWithoutFields = async (file) => {
    // Processing file without fields
    
    // Simulate API call for raw files
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Logic for raw files:
    // 1. Parse file to extract raw data
    // 2. Identify column headers
    // 3. Create form template with empty field definitions
    // 4. Allow user to manually define fields later
    
    // File without fields processed successfully
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

  // Parse file content based on import type
  const parseFileContent = async (file, type) => {
    // Simulate DOCX file parsing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (type === 'with-fields') {
      // Simulate parsing DOCX with predefined fields
      return `
        <h1 style="text-align: center;">Imported Word Document with Fields</h1>
        <p><strong>Source Document:</strong> ${file.name}</p>
        <p><strong>Document Type:</strong> Word Document (.docx)</p>
        <hr>
        <p><strong>Customer Name:</strong> {{customer_name}}</p>
        <p><strong>Email Address:</strong> {{email}}</p>
        <p><strong>Phone Number:</strong> {{phone}}</p>
        <p><strong>Company Name:</strong> {{company_name}}</p>
        <p><strong>Invoice Date:</strong> {{invoice_date}}</p>
        <p><strong>Invoice Total:</strong> {{invoice_total}}</p>
        <p><strong>Address:</strong> {{address}}</p>
        <p><strong>Signature:</strong> {{signature}}</p>
        <hr>
        <p><em>This document was automatically parsed from a Word document with predefined fields.</em></p>
      `;
    } else {
      // Simulate parsing raw DOCX file
      return `
        <h1 style="text-align: center;">Imported Raw Word Document</h1>
        <p><strong>Source Document:</strong> ${file.name}</p>
        <p><strong>Document Type:</strong> Word Document (.docx)</p>
        <hr>
        <p>This is a raw Word document that was imported. The content has been converted to HTML format.</p>
        <p>You can now add merge fields and structure as needed using the field buttons on the left.</p>
        <p>Use the editor to format and customize the content to create your form template.</p>
        <hr>
        <p><em>This document was imported as raw content. Add fields manually using the merge field buttons.</em></p>
      `;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
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
          <Row>
            <Col md={6}>
              <Card 
                className={`h-100 cursor-pointer ${importType === 'with-fields' ? 'border-primary bg-light' : 'border-secondary'}`}
                onClick={() => setImportType('with-fields')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center p-4">
                  <FileEarmarkText size={48} className="text-primary mb-3" />
                  <h6 className="text-primary">File with Fields</h6>
                         <p className="text-muted small mb-3">
                           Import a Word document that already contains predefined form fields and structure. The system will automatically parse and create form templates.
                         </p>
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
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card 
                className={`h-100 cursor-pointer ${importType === 'without-fields' ? 'border-primary bg-light' : 'border-secondary'}`}
                onClick={() => setImportType('without-fields')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center p-4">
                  <FileEarmark size={48} className="text-success mb-3" />
                  <h6 className="text-success">File without Fields</h6>
                         <p className="text-muted small mb-3">
                           Import a raw Word document without predefined structure. You will manually define form fields and mapping after import.
                         </p>
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
                         <li><strong>Manual Processing:</strong> You will define form fields and mapping after import</li>
                         <li>Document can contain raw content without predefined form structure</li>
                         <li>Content will be imported as-is, then you configure fields manually</li>
                         <li>More flexible but requires additional setup steps</li>
                         <li>Perfect for converting existing documents to forms</li>
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
