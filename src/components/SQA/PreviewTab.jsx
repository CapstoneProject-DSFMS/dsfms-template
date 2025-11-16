import React from 'react';
import { Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { Download, FileEarmarkPdf, CheckCircle, XCircle } from 'react-bootstrap-icons';
import TemplateConfigSchema from './TemplateConfigSchema';

const PreviewTab = ({
  template,
  pdfUrl,
  loadingPDF,
  onViewTemplateConfig,
  onOpenApproveModal,
  onOpenRejectModal,
  reviewing
}) => {
  return (
    <div className="p-4">
      <Row>
        <Col xs={12} className="mb-3">
          <div className="d-flex justify-content-end gap-2 mb-3">
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
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenApproveModal}
              className="d-flex align-items-center"
              disabled={template?.status !== 'PENDING' || reviewing}
            >
              <CheckCircle className="me-2" size={16} />
              Approve
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onOpenRejectModal}
              className="d-flex align-items-center"
              disabled={template?.status !== 'PENDING' || reviewing}
              style={{
                backgroundColor: 'white',
                borderColor: '#dee2e6',
                color: '#333'
              }}
            >
              <XCircle className="me-2" size={16} />
              Reject
            </Button>
          </div>
        </Col>
      </Row>
      
      <Row>
        {/* PDF Preview */}
        <Col xs={12} lg={7} className="mb-4">
          <div className="mb-2">
            <h6 className="mb-0" style={{ color: '#333', fontWeight: 500 }}>PDF Preview</h6>
          </div>
          {loadingPDF ? (
            <div className="border rounded p-4 bg-light text-center" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted mb-0">Loading PDF preview...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div style={{ height: '60vh', overflow: 'hidden' }}>
              <iframe
                src={pdfUrl}
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


