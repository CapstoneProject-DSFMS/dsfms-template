import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Badge } from 'react-bootstrap';
import { ExclamationTriangle } from 'react-bootstrap-icons';
import subjectAPI from '../../api/subject';
import apiClient from '../../api/config';

const DisableSubjectModal = ({ show, onClose, onDisable, subject, loading = false }) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const expectedText = 'ARCHIVE';
  const isConfirmValid = confirmText === expectedText;

  // Load enrollment count when modal opens
  useEffect(() => {
    if (show && subject?.id) {
      loadEnrollmentCount();
    } else {
      setEnrollmentCount(0);
      setConfirmText('');
      setError('');
    }
  }, [show, subject?.id]);

  const loadEnrollmentCount = async () => {
    if (!subject?.id) return;
    
    setLoadingEnrollments(true);
    try {
      const response = await subjectAPI.getSubjectById(subject.id);
      // Check if response has enrollmentCount or enrollments array
      if (response?.enrollmentCount !== undefined) {
        setEnrollmentCount(response.enrollmentCount);
      } else if (response?.enrollments && Array.isArray(response.enrollments)) {
        setEnrollmentCount(response.enrollments.length);
      } else {
        // Try to fetch enrollments separately
        try {
          const enrollmentsResponse = await apiClient.get(`/subjects/${subject.id}/enrollments`);
          if (enrollmentsResponse?.data?.enrollments) {
            setEnrollmentCount(enrollmentsResponse.data.enrollments.length);
          } else if (enrollmentsResponse?.data?.count !== undefined) {
            setEnrollmentCount(enrollmentsResponse.data.count);
          }
        } catch {
          setEnrollmentCount(0);
        }
      }
    } catch {
      setEnrollmentCount(0);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setError('');
    setEnrollmentCount(0);
    onClose();
  };

  const handleDisable = async () => {
    if (!isConfirmValid) {
      setError('Please type "ARCHIVE" to confirm');
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
          <p className="text-warning mb-2">
            <strong>Warning:</strong> This action will:
          </p>
          <ul className="text-warning mb-3">
            <li>Make the subject unavailable for new enrollments</li>
            <li>Remove the subject from active course offerings</li>
            <li>Affect any ongoing training sessions</li>
            {enrollmentCount > 0 && (
              <li className="fw-bold">
                <strong>Cascade cancel all {enrollmentCount} enrollment{enrollmentCount > 1 ? 's' : ''}</strong> associated with this subject
              </li>
            )}
          </ul>
          {enrollmentCount > 0 && (
            <div className="alert alert-warning mb-0">
              <strong>Total Enrollments:</strong> <Badge bg="warning" className="text-dark ms-2">{enrollmentCount}</Badge>
              {enrollmentCount > 0 && (
                <p className="mb-0 mt-2 small">
                  All {enrollmentCount} enrollment{enrollmentCount > 1 ? 's' : ''} will be automatically cancelled when this subject is archived.
                </p>
              )}
            </div>
          )}
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
          disabled={loading || !isConfirmValid || loadingEnrollments}
        >
          {loading ? (
            <>
              <span 
                className="spinner-border spinner-border-sm me-2" 
                role="status" 
                aria-hidden="true"
                style={{ 
                  width: '0.75rem', 
                  height: '0.75rem',
                  borderWidth: '0.15em'
                }}
              ></span>
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
