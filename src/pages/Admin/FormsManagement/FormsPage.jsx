import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Upload, FileText, FileEarmark, Plus } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PermissionWrapper } from '../../../components/Common';
import { API_PERMISSIONS } from '../../../constants/apiPermissions';
import ImportFileModal from '../../../components/Admin/Forms/ImportFileModal';

const FormsPage = () => {
  const navigate = useNavigate();
  const [showImportModal, setShowImportModal] = useState(false);

  const handleImportFile = () => {
    setShowImportModal(true);
  };

  const handleCreateNewForm = () => {
    navigate('/admin/forms/editor', {
      state: {
        content: '<h1 style="text-align: center;">New Form</h1><p>Start creating your form here...</p>',
        fileName: 'New Form',
        importType: 'New Form'
      }
    });
  };

  const handleImportSuccess = (importType, fileName) => {
    toast.success(`${importType} file "${fileName}" imported successfully!`);
    setShowImportModal(false);
  };

  const handleImportError = (error) => {
    toast.error(`Import failed: ${error}`);
  };

  return (
    <Container fluid className="py-4 forms-page">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <FileText className="me-2 text-primary-custom" size={24} />
                <h4 className="mb-0 text-primary-custom">Form Templates</h4>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          <Row className="mb-4">
            <Col>
              <div className="text-center py-5">
                <FileEarmark size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No form templates found</h5>
                <p className="text-muted mb-4">
                  Get started by creating a new form or importing an existing file.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <PermissionWrapper 
                    permission={API_PERMISSIONS.TEMPLATES.CREATE}
                    fallback={null}
                  >
                    <Button
                      variant="outline-primary"
                      onClick={handleCreateNewForm}
                      className="d-flex align-items-center"
                    >
                      <Plus className="me-2" size={16} />
                      Create New Form
                    </Button>
                  </PermissionWrapper>
                  
                  <PermissionWrapper 
                    permission={API_PERMISSIONS.TEMPLATES.CREATE}
                    fallback={null}
                  >
                    <Button
                      variant="primary-custom"
                      onClick={handleImportFile}
                      className="d-flex align-items-center"
                    >
                      <Upload className="me-2" size={16} />
                      Import File
                    </Button>
                  </PermissionWrapper>
                </div>
              </div>
            </Col>
          </Row>

          {/* Import File Modal */}
          <ImportFileModal
            show={showImportModal}
            onHide={() => setShowImportModal(false)}
            onImportSuccess={handleImportSuccess}
            onImportError={handleImportError}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FormsPage;
