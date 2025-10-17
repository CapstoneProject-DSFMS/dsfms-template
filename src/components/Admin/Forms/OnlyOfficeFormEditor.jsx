import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { Save, Eye, Download, ArrowLeft } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import MergeFieldsPanel from './MergeFieldsPanel';

const OnlyOfficeFormEditor = ({
  initialContent = '',
  fileName = 'Untitled Document',
  onSave,
  onPreview,
  onExport,
  onBack,
  readOnly = false,
  mergeFields = [],
  showMergeFields = true,
  showImportInfo = false,
  importType = '',
  className = ""
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const onlyOfficeRef = useRef(null);

  useEffect(() => {
    // Convert HTML content to DOCX if needed
    if (initialContent && initialContent.includes('<')) {
      convertHtmlToDocx(initialContent);
    } else {
      setDocumentUrl(initialContent);
      setIsLoading(false);
    }
  }, [initialContent]);

  const convertHtmlToDocx = async (htmlContent) => {
    try {
      // For now, we'll use a simple approach
      // In production, you'd want to use a proper HTML to DOCX converter
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);
      setIsLoading(false);
    } catch (error) {
      console.error('Error converting HTML to DOCX:', error);
      toast.error('Failed to convert content to DOCX format');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      // Get document content from ONLYOFFICE
      if (onlyOfficeRef.current && window.DocsAPI) {
        // This would need to be implemented based on ONLYOFFICE API
        await onSave(content);
        setHasUnsavedChanges(false);
        toast.success('Form saved successfully!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save form');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(content);
    } else {
      toast.info('Preview functionality will be implemented soon!');
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(content, fileName);
    } else {
      toast.info('Export functionality will be implemented soon!');
    }
  };

  const handleInsertField = (fieldName) => {
    // Insert merge field into ONLYOFFICE document
    const mergeField = `{{${fieldName}}}`;
    toast.success(`Inserted {{${fieldName}}} field`);
    
    // Note: Direct insertion into ONLYOFFICE would require API calls
    // This is a simplified version
    setHasUnsavedChanges(true);
  };

  const handleOnlyOfficeSave = (data) => {
    console.log('ONLYOFFICE Save:', data);
    setHasUnsavedChanges(false);
    toast.success('Document saved successfully!');
  };

  const handleOnlyOfficeError = (error) => {
    console.error('ONLYOFFICE Error:', error);
    toast.error('ONLYOFFICE Error: ' + error);
  };

  if (isLoading) {
    return (
      <Card className={`border-neutral-200 shadow-sm ${className}`}>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ height: '600px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading ONLYOFFICE Editor...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={`border-neutral-200 shadow-sm ${className}`}>
      {/* Header */}
      <Card.Header className="bg-light-custom border-neutral-200">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              {onBack && (
                <Button variant="outline-secondary" size="sm" onClick={onBack} className="me-3">
                  <ArrowLeft size={16} />
                </Button>
              )}
              <h5 className="mb-0 text-primary-custom">{fileName}</h5>
              {hasUnsavedChanges && (
                <span className="badge bg-warning ms-2">Unsaved Changes</span>
              )}
            </div>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handlePreview}
                disabled={isSaving}
              >
                <Eye className="me-1" size={14} />
                Preview
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleExport}
                disabled={isSaving}
              >
                <Download className="me-1" size={14} />
                Export
              </Button>
              <Button
                variant="primary-custom"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  <Save className="me-1" size={14} />
                )}
                Save
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body className="p-0">
        {showImportInfo && (
          <Alert variant="info" className="mb-0 rounded-0">
            You are editing an imported form: <strong>{importType}</strong>
          </Alert>
        )}

        <Row className="g-0">
          {/* Merge Fields Panel */}
          {showMergeFields && (
            <Col md={3} className="border-end">
              <MergeFieldsPanel
                mergeFields={mergeFields}
                onInsertField={handleInsertField}
                readOnly={readOnly}
                className="h-100"
              />
            </Col>
          )}

          {/* Simple Text Editor */}
          <Col md={showMergeFields ? 9 : 12}>
            <div className="p-3 h-100">
              <Alert variant="info" className="mb-3">
                <strong>Simple Form Editor</strong><br />
                This is a simplified form editor. You can edit the content below and use merge fields from the panel.
              </Alert>
              
              <textarea
                className="form-control"
                style={{ height: '500px', fontFamily: 'monospace' }}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Enter your form content here..."
                readOnly={readOnly}
              />
              
              <div className="mt-2 text-muted small">
                <strong>Content Preview:</strong> {content.length} characters
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default OnlyOfficeFormEditor;

