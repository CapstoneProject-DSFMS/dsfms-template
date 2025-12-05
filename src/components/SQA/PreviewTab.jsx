import React from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FileEarmarkPdf } from 'react-bootstrap-icons';
import TemplateConfigSchema from './TemplateConfigSchema';

const PreviewTab = ({
  template,
  pdfUrl,
  loadingPDF
}) => {
  return (
    <div className="p-4">
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


