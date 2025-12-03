import React from 'react';
import { Modal } from 'react-bootstrap';

const PDFModal = ({ show, onHide, pdfUrl, title = 'PDF Viewer' }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      fullscreen="lg-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0, height: '70vh', minHeight: '500px' }}>
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title="PDF Viewer"
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

