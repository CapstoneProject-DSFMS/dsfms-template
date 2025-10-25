import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import OnlyOfficeFormEditor from '../../../components/Admin/Forms/OnlyOfficeFormEditor';
import { PermissionWrapper } from '../../../components/Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';

const FormEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled Document');
  const [importType, setImportType] = useState('');

  // Get data from navigation state
  useEffect(() => {
    if (location.state) {
      const { 
        content: initialContent, 
        documentUrl: initialDocumentUrl,
        fileName: initialFileName, 
        importType: initialImportType 
      } = location.state;
      
      // Use documentUrl if available (from upload), otherwise use content
      const finalContent = initialDocumentUrl || initialContent || '';
      setContent(finalContent);
      setFileName(initialFileName || 'Untitled Document');
      setImportType(initialImportType || '');
      
      console.log('📄 FormEditorPage received:', { 
        documentUrl: initialDocumentUrl, 
        content: initialContent, 
        fileName: initialFileName,
        finalContent: finalContent
      });
    }
  }, [location.state]);


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
            </Row>
          </Card.Header>

          <Card.Body className="p-0">
            <OnlyOfficeFormEditor
              initialContent={content}
              fileName={fileName}
              showImportInfo={!!importType}
              importType={importType}
            />
          </Card.Body>
        </Card>

      </Container>
    </PermissionWrapper>
  );
};

export default FormEditorPage;
