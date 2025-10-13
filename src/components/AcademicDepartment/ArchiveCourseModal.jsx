import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangle, X } from 'react-bootstrap-icons';

const ArchiveCourseModal = ({ show, onClose, onArchive, course, loading = false }) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const expectedText = 'ARCHIVE';
  const isConfirmValid = confirmText === expectedText;

  const handleClose = () => {
    setConfirmText('');
    setError('');
    onClose();
  };

  const handleArchive = async () => {
    if (!isConfirmValid) {
      setError('Please type "ARCHIVE" to confirm');
      return;
    }

    try {
      await onArchive(course?.id);
      handleClose();
    } catch (error) {
      setError(error.message || 'Failed to archive course. Please try again.');
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
          Archive Course
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
            You are about to archive the following course:
          </p>
          <div className="bg-light p-3 rounded">
            <strong>Course Code:</strong> {course?.code}<br />
            <strong>Course Name:</strong> {course?.name}<br />
            {course?.description && (
              <>
                <strong>Description:</strong> {course?.description}<br />
              </>
            )}
            {course?.venue && (
              <>
                <strong>Venue:</strong> {course?.venue}<br />
              </>
            )}
            {course?.startDate && course?.endDate && (
              <>
                <strong>Duration:</strong> {course?.startDate} to {course?.endDate}
              </>
            )}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-danger mb-2">
            <strong>Warning:</strong> This action will:
          </p>
          <ul className="text-danger mb-3">
            <li>Archive the course and make it unavailable for new enrollments</li>
            <li>Move the course to archived status</li>
            <li>Preserve all course data and trainee progress</li>
            <li>Allow course to be restored if needed</li>
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
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        <Button
          variant="warning"
          onClick={handleArchive}
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
              Archive Course
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ArchiveCourseModal;
