import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangle, Trash } from 'react-bootstrap-icons';

const RemoveSubjectModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  trainee, 
  subject, 
  loading = false 
}) => {
  if (!trainee || !subject) return null;

  const handleConfirm = () => {
    onConfirm(trainee.id, subject.id);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="d-flex align-items-center text-danger">
          <ExclamationTriangle className="me-2" size={20} />
          Remove Subject
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <Alert variant="warning" className="mb-3">
          <ExclamationTriangle className="me-2" size={16} />
          <strong>Warning:</strong> This action cannot be undone.
        </Alert>
        
        <div className="mb-3">
          <p className="mb-2">
            Are you sure you want to remove <strong>"{subject.name}"</strong> from trainee <strong>"{trainee.name}"</strong>?
          </p>
          
          <div className="bg-light p-3 rounded">
            <div className="row">
              <div className="col-md-6">
                <small className="text-muted">Trainee:</small>
                <div className="fw-semibold">{trainee.name}</div>
                <div className="text-muted small">{trainee.eid}</div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Subject:</small>
                <div className="fw-semibold">{subject.name}</div>
                <div className="text-muted small">{subject.code}</div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-muted small mb-0">
          The trainee will no longer be enrolled in this subject and will lose access to related materials and assessments.
        </p>
      </Modal.Body>
      
      <Modal.Footer className="border-top">
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
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Removing...
            </>
          ) : (
            <>
              <Trash className="me-2" size={16} />
              Remove Subject
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveSubjectModal;
