import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { ArrowLeft, Save, Eye, Download } from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import OnlyOfficeFormEditor from '../../../components/Admin/Forms/OnlyOfficeFormEditor';
import FormPreviewModal from '../../../components/Admin/Forms/FormPreviewModal';
import { PermissionWrapper } from '../../../components/Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';

const FormEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled Document');
  const [importType, setImportType] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Get data from navigation state
  useEffect(() => {
    if (location.state) {
      const { content: initialContent, fileName: initialFileName, importType: initialImportType } = location.state;
      setContent(initialContent || '');
      setFileName(initialFileName || 'Untitled Document');
      setImportType(initialImportType || '');
    }
  }, [location.state]);

  const handleSave = async (editorContent) => {
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically save to your backend
      console.log('Saving content:', editorContent);
      console.log('File name:', fileName);
      
      toast.success(`Form "${fileName}" saved successfully!`);
    } catch (error) {
      throw new Error('Failed to save form');
    }
  };

  const handlePreview = (editorContent) => {
    setContent(editorContent);
    setShowPreview(true);
  };

  const handleExport = (editorContent, currentFileName) => {
    // Simulate export operation
    toast.info(`Exporting "${currentFileName}" to Word/PDF...`);
    
    // Here you would implement actual export functionality
    // For now, just show a success message
    setTimeout(() => {
      toast.success('Export completed! (Demo mode)');
    }, 2000);
  };

  const handleBack = () => {
    navigate('/admin/forms');
  };

  return (
    <PermissionWrapper 
      permission={API_PERMISSIONS.TEMPLATES.CREATE}
      fallback={
        <Container fluid className="py-4">
          <div className="text-center text-muted">
            <h4>Access Denied</h4>
            <p>You don't have permission to edit form templates.</p>
          </div>
        </Container>
      }
    >
      <Container fluid className="py-4 form-editor-page form-component">
        <Card className="border-neutral-200 shadow-sm">
          <Card.Header className="bg-light-custom border-neutral-200">
            <Row className="align-items-center">
              <Col xs={12} md={8}>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleBack} 
                    className="me-3"
                    size="sm"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <div>
                    <h4 className="mb-0 text-primary-custom">
                      {fileName}
                    </h4>
                    {importType && (
                      <small className="text-muted">
                        Import Type: {importType}
                      </small>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={12} md={4} className="mt-2 mt-md-0">
                <div className="d-flex gap-2 justify-content-md-end">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setShowPreview(true)}
                    size="sm"
                    className="flex-fill flex-md-fill-0"
                  >
                    <Eye className="me-2" size={16} />
                    Preview
                  </Button>
                  <Button 
                    variant="primary-custom" 
                    onClick={() => handleExport(content, fileName)}
                    size="sm"
                    className="flex-fill flex-md-fill-0"
                  >
                    <Download className="me-2" size={16} />
                    Export
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-0">
            {importType && (
              <Alert variant="info" className="m-3 mb-0">
                <strong>Import Info:</strong> This form was created from a {importType.toLowerCase()} file. 
                You can now edit the content and add merge fields as needed.
              </Alert>
            )}
            
            <OnlyOfficeFormEditor
              initialContent={content}
              fileName={fileName}
              onSave={handleSave}
              onPreview={handlePreview}
              onExport={handleExport}
              onBack={handleBack}
              showImportInfo={!!importType}
              importType={importType}
            />
          </Card.Body>
        </Card>

        {/* Preview Modal */}
        <FormPreviewModal
          show={showPreview}
          onHide={() => setShowPreview(false)}
          content={content}
          fileName={fileName}
        />
      </Container>
    </PermissionWrapper>
  );
};

export default FormEditorPage;
