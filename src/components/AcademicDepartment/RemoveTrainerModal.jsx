import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationTriangle, Trash } from 'react-bootstrap-icons';

const RemoveTrainerModal = ({ show, onClose, onConfirm, trainer, loading = false }) => {
  const handleConfirm = async () => {
    await onConfirm(trainer?.id);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header className="bg-danger text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangle className="me-2" size={20} />
          Remove Trainer from Course
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <div className="mb-3">
          <p className="mb-3">
            You are about to remove the following trainer from the course:
          </p>
          <div className="bg-light p-3 rounded mb-3">
            <div className="mb-2">
              <strong>Name:</strong> {trainer?.firstName} {trainer?.middleName} {trainer?.lastName}
            </div>
            <div className="mb-2">
              <strong>EID:</strong> {trainer?.eid}
            </div>
            <div className="mb-2">
              <strong>Email:</strong> {trainer?.email}
            </div>
            {trainer?.roleInCourse && trainer.roleInCourse.length > 0 && (
              <div>
                <strong>Role:</strong> {trainer.roleInCourse.join(', ')}
              </div>
            )}
          </div>

          <div className="alert alert-warning mb-0" role="alert">
            <strong>Warning:</strong> This action cannot be undone. The trainer will no longer have access to this course.
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top p-3">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Removing...
            </>
          ) : (
            <>
              <Trash className="me-2" size={16} />
              Remove Trainer
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveTrainerModal;
