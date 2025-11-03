import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangle } from 'react-bootstrap-icons';

const DisableSubjectModal = ({ show, onClose, onDisable, subject, loading = false }) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const expectedText = 'ARCHIVE';
  const isConfirmValid = confirmText === expectedText;

  const handleClose = () => {
    setConfirmText('');
    setError('');
    onClose();
  };

  const handleDisable = async () => {
    if (!isConfirmValid) {
      setError('Please type "DISABLE" to confirm');
      return;
    }

    try {
      await onDisable(subject?.id);
      handleClose();
    } catch (error) {
      setError(error.message || 'Failed to disable subject. Please try again.');
    }
  };

  const handleConfirmTextChange = (e) => {
    setConfirmText(e.target.value);
    setError('');
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="bg-warning text-dark border-0">
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangle className="me-2" size={20} />
          Archive Subject
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <div className="mb-3">
          <p className="mb-2">
            You are about to archive the following subject:
          </p>
          <div className="bg-light p-3 rounded">
            <strong>Subject Code:</strong> {subject?.code}<br />
            <strong>Subject Name:</strong> {subject?.name}<br />
            {subject?.description && (
              <>
                <strong>Description:</strong> {subject?.description}
              </>
            )}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-danger mb-2">
            <strong>Warning:</strong> This action will:
          </p>
          <ul className="text-danger mb-3">
            <li>Make the subject unavailable for new enrollments</li>
            <li>Remove the subject from active course offerings</li>
            <li>Affect any ongoing training sessions</li>
          </ul>
        </div>

        <div className="mb-3">
          <label htmlFor="confirmText" className="form-label">
            To confirm, please type <strong>ARCHIVE</strong> in the box below:
          </label>
          <input
            type="text"
            className={`form-control ${confirmText && !isConfirmValid ? 'is-invalid' : ''}`}
            id="confirmText"
            value={confirmText}
            onChange={handleConfirmTextChange}
            placeholder="Type ARCHIVE here"
            disabled={loading}
          />
          {confirmText && !isConfirmValid && (
            <div className="invalid-feedback">
              Please type "ARCHIVE" exactly as shown
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          variant="warning"
          onClick={handleDisable}
          disabled={loading || !isConfirmValid}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Archiving...
            </>
          ) : (
            <>
              <ExclamationTriangle className="me-2" size={16} />
              Archive Subject
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DisableSubjectModal;
