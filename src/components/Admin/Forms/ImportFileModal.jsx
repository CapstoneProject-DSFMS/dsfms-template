import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmark, FileEarmarkText } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { uploadAPI } from '../../../api';
import { departmentAPI } from '../../../api/department';

const ImportFileModal = ({ show, onHide, onImportSuccess, onImportError }) => {
  const navigate = useNavigate();
  const [importType, setImportType] = useState('with-fields'); // 'with-fields' or 'without-fields'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [templateInfo, setTemplateInfo] = useState({
    name: '',
    description: '',
    departmentId: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const fileInputRef = useRef(null);

  // Load departments when modal opens
  useEffect(() => {
    if (show) {
      loadDepartments();
    }
  }, [show]);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await departmentAPI.getDepartments();
      const departmentsData = response.departments || response.data || [];
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

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
      
      // Xử lý 2 luồng khác nhau
      if (importType === 'with-fields') {
        // Luồng 1: File with fields - Navigate trực tiếp
        navigate('/admin/forms/editor', {
          state: {
            documentUrl: documentUrl,
            fileName: selectedFile.name.replace('.docx', ''),
            importType: 'File with fields'
          }
        });
        
        handleClose();
        onImportSuccess('File with fields', selectedFile.name);
      } else {
        // Luồng 2: File without fields - Lưu thông tin và navigate
        const templateData = {
          name: templateInfo.name,
          description: templateInfo.description,
          departmentId: templateInfo.departmentId,
          templateContent: documentUrl,
          fileName: selectedFile.name.replace('.docx', ''),
          importType: 'File without fields',
          createdAt: new Date().toISOString()
        };

        // Lưu vào localStorage
        localStorage.setItem('templateInfo', JSON.stringify(templateData));
        console.log('💾 Template info saved to localStorage:', templateData);

        // Navigate đến editor
        navigate('/admin/forms/editor', {
          state: {
            documentUrl: documentUrl,
            fileName: templateData.fileName,
            importType: 'File without fields',
            templateInfo: templateData
          }
        });

        handleClose();
        onImportSuccess('File without fields', selectedFile.name);
      }
    } catch (error) {
      onImportError(error.message || 'Import failed');
    } finally {
      setIsUploading(false);
    }
  };



  const handleClose = () => {
    setSelectedFile(null);
    setImportType('with-fields');
    setTemplateInfo({
      name: '',
      description: '',
      departmentId: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onHide();
  };








  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg" 
      centered 
      className="import-file-modal"
      dialogClassName="import-file-modal-dialog"
    >
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

      <Modal.Body className="p-3 p-md-4">
        {/* Import Type Selection */}
        <div className="mb-4">
          <h6 className="text-primary-custom mb-3">Select Import Type</h6>
          <Row className="g-3 import-type-row">
            <Col xs={12} sm={12} md={6} className="import-type-col">
              <Card 
                className={`import-type-card ${importType === 'with-fields' ? 'border-primary bg-light' : 'border-secondary'}`}
                onClick={() => setImportType('with-fields')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center p-3 p-md-4 d-flex flex-column">
                  <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                    <FileEarmarkText size={48} className="text-primary mb-3" />
                    <h6 className="text-primary mb-2">File with Fields</h6>
                    <p className="text-muted small mb-0">
                      Import a Word document that already contains predefined form fields and structure. The system will automatically parse and create form templates.
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} className="import-type-col">
              <Card 
                className={`import-type-card ${importType === 'without-fields' ? 'border-primary bg-light' : 'border-secondary'}`}
                onClick={() => setImportType('without-fields')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center p-3 p-md-4 d-flex flex-column">
                  <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                    <FileEarmark size={48} className="text-success mb-3" />
                    <h6 className="text-success mb-2">File without Fields</h6>
                    <p className="text-muted small mb-0">
                      Import a raw Word document without predefined structure. You will manually define form fields and mapping after import.
                    </p>
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

        {/* Template Information Form - Show for "without-fields" */}
        {importType === 'without-fields' && (
          <div className="mb-4">
            <h6 className="text-primary-custom mb-3">Fill in Basic Template Information</h6>
            <Form>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-primary-custom">Template Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Flight Training Assessment Form"
                      value={templateInfo.name}
                      onChange={(e) => setTemplateInfo(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-primary-custom">Description <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="e.g., Comprehensive flight training evaluation form with competency assessment"
                      value={templateInfo.description}
                      onChange={(e) => setTemplateInfo(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-primary-custom">Department <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={templateInfo.departmentId}
                      onChange={(e) => setTemplateInfo(prev => ({ ...prev, departmentId: e.target.value }))}
                      required
                      disabled={loadingDepartments}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingDepartments && (
                      <Form.Text className="text-muted">
                        Loading departments...
                      </Form.Text>
                    )}
                    {templateInfo.templateContent && (
                      <Form.Text className="text-muted">
                        Template Content: {templateInfo.templateContent}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Form>

          </div>
        )}

        {/* File Upload Section - Show for both types */}
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
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-3 p-md-3 d-flex flex-column flex-md-row gap-2 gap-md-2 justify-content-end">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleClose}
          disabled={isUploading}
          className="w-100 w-md-auto order-2 order-md-1"
        >
          <X className="me-2" size={14} />
          Cancel
        </Button>
        
        {importType === 'with-fields' && (
          <Button
            variant="primary-custom"
            size="sm"
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
            className="w-100 w-md-auto order-1 order-md-2"
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '0.875rem', height: '0.875rem' }}></span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="me-2" size={14} />
                Import File
              </>
            )}
          </Button>
        )}

        {importType === 'without-fields' && (
          <Button
            variant="primary-custom"
            size="sm"
            onClick={handleImport}
            disabled={!selectedFile || !templateInfo.name || !templateInfo.description || !templateInfo.departmentId || isUploading}
            className="w-100 w-md-auto order-1 order-md-2"
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '0.875rem', height: '0.875rem' }}></span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="me-2" size={14} />
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
