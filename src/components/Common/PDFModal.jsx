import React, { useState, useEffect } from 'react';
import { Modal, Spinner } from 'react-bootstrap';

const PDFModal = ({ show, onHide, pdfUrl, title = 'PDF Viewer', externalLoading = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (show && pdfUrl) {
      setLoading(true);
      setError(false);
    }
  }, [show, pdfUrl]);

  // Use external loading state if provided, otherwise use internal loading
  const isLoading = externalLoading || loading;

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  // Format PDF URL to ensure it displays in iframe instead of downloading
  const getFormattedPdfUrl = (url) => {
    if (!url) return null;
    
    // If it's a blob URL (object URL), use it directly with toolbar=0
    if (url.startsWith('blob:')) {
      return `${url}#toolbar=0`;
    }
    
    // If it's already a full URL, use it directly
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Add viewer parameters to prevent download and hide toolbar
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}#toolbar=0`;
    }
    
    return url;
  };

  const formattedUrl = getFormattedPdfUrl(pdfUrl);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      fullscreen="lg-down"
      onShow={() => {
        document.body.style.overflow = 'hidden';
      }}
      onExited={() => {
        document.body.style.overflow = 'auto';
        setLoading(true);
        setError(false);
      }}
    >
      <Modal.Header closeButton className="bg-primary text-white border-0">
        <Modal.Title className="text-white">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0, height: '70vh', minHeight: '500px', position: 'relative' }}>
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 10
          }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading PDF...</p>
            </div>
          </div>
        )}
        {error ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
            <div className="text-center">
              <p className="text-danger">Failed to load PDF</p>
              <p className="text-muted small">Please check if the PDF URL is valid</p>
            </div>
          </div>
        ) : formattedUrl ? (
          <iframe
            src={formattedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: isLoading ? 'none' : 'block'
            }}
            title="PDF Viewer"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            type="application/pdf"
          />
        ) : (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
            <p className="text-muted">No PDF available</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PDFModal;

