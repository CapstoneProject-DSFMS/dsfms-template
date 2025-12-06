import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangle, Trash } from 'react-bootstrap-icons';

const DeleteGlobalFieldModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  field, 
  loading = false 
}) => {
  if (!field) return null;

  const handleConfirm = () => {
    onConfirm(field.id);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header className="bg-danger text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangle className="me-2" size={20} />
          Delete Global Field
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Alert variant="warning" className="mb-3">
          <ExclamationTriangle className="me-2" size={16} />
          <strong>Warning:</strong> This action cannot be undone. This will permanently delete the global field.
        </Alert>
        
        <div className="mb-3">
          <p className="mb-2">
            Are you sure you want to delete <strong>"{field.label}"</strong>?
          </p>
          
          <div className="bg-light p-3 rounded">
            <div className="row">
              <div className="col-md-6">
                <small className="text-muted">Label:</small>
                <div className="fw-semibold">{field.label}</div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Field Name:</small>
                <div className="fw-semibold">
                  <code>{field.fieldName}</code>
                </div>
              </div>
            </div>
            {field.roleRequired && (
              <div className="row mt-2">
                <div className="col-md-6">
                  <small className="text-muted">Role Required:</small>
                  <div>
                    <span className="badge bg-secondary">{field.roleRequired}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-muted small mb-0">
          This global field will be permanently removed from the system and cannot be recovered.
        </p>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleConfirm}
          disabled={loading}
          className="d-flex align-items-center"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Deleting...
            </>
          ) : (
            <>
              <Trash className="me-2" size={16} />
              Delete Global Field
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteGlobalFieldModal;

