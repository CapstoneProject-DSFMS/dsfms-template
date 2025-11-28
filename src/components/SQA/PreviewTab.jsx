import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { Download, FileEarmarkPdf } from 'react-bootstrap-icons';
import TemplateConfigSchema from './TemplateConfigSchema';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { PermissionWrapper } from '../Common';
import templateAPI from '../../api/template';
import { toast } from 'react-toastify';

const PreviewTab = ({
  template,
  pdfUrl,
  loadingPDF,
  onViewTemplateConfig
}) => {
  const [pdfConfigUrl, setPdfConfigUrl] = useState(null);
  const [loadingPdfConfig, setLoadingPdfConfig] = useState(false);

  // Load PDF config from /templates/pdf-config/{templateId} endpoint
  useEffect(() => {
    const loadPdfConfig = async () => {
      if (template?.id || template?.formId) {
        try {
          setLoadingPdfConfig(true);
          const templateId = template.id || template.formId;
          const response = await templateAPI.getTemplatePdfConfig(templateId);
          
          // Extract PDF URL from response
          if (response?.data?.pdfUrl) {
            setPdfConfigUrl(response.data.pdfUrl);
          } else if (response?.pdfUrl) {
            setPdfConfigUrl(response.pdfUrl);
          }
        } catch (error) {
          console.error('Error loading PDF config:', error);
          toast.warning('Could not load PDF configuration');
        } finally {
          setLoadingPdfConfig(false);
        }
      }
    };

    loadPdfConfig();
  }, [template?.id, template?.formId]);
  return (
    <div className="p-4">
      <Row>
        <Col xs={12} className="mb-3">
          <div className="d-flex justify-content-end gap-2 mb-3">
            <PermissionWrapper
              permission={PERMISSION_IDS.VIEW_TEMPLATE_DETAILS}
              fallback={null}
            >
              <Button
                variant="outline-primary"
                size="sm"
                onClick={onViewTemplateConfig}
                className="d-flex align-items-center"
                disabled={!template?.templateConfig}
              >
                <Download className="me-2" size={16} />
                View Template Config
              </Button>
            </PermissionWrapper>
          </div>
        </Col>
      </Row>
      
      <Row>
        {/* PDF Preview */}
        <Col xs={12} lg={7} className="mb-4">
          <div className="mb-2">
            <h6 className="mb-0" style={{ color: '#333', fontWeight: 500 }}>PDF Preview</h6>
          </div>
          {loadingPDF || loadingPdfConfig ? (
            <div className="border rounded p-4 bg-light text-center" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted mb-0">Loading PDF preview...</p>
              </div>
            </div>
          ) : pdfUrl || pdfConfigUrl ? (
            <div style={{ height: '60vh', overflow: 'hidden' }}>
              <iframe
                src={pdfUrl || pdfConfigUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem',
                  display: 'block'
                }}
                title="Template PDF Preview"
              />
            </div>
          ) : (
            <Alert variant="warning" className="mb-0">
              <FileEarmarkPdf className="me-2" />
              PDF preview is not available. Please try again or contact support.
            </Alert>
          )}
        </Col>

        {/* Template Config Schema */}
        <Col xs={12} lg={5}>
          <div className="mb-2">
            <h6 className="mb-0" style={{ color: '#333', fontWeight: 500 }}>Template fields & sections</h6>
          </div>
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <TemplateConfigSchema sections={template?.sections || []} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PreviewTab;


