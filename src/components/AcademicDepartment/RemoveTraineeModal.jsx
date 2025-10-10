import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationTriangle, Trash } from 'react-bootstrap-icons';

const RemoveTraineeModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  trainee, 
  subjectName = null,
  loading = false 
}) => {
  const isRemoveFromAll = !subjectName;
  const title = isRemoveFromAll ? 'Remove Trainee from All Subjects' : 'Remove Trainee from Subject';
  const confirmButtonText = isRemoveFromAll ? 'Remove from All Subjects' : 'Remove from Subject';

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header className="bg-danger text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangle className="me-2" size={20} />
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <div className="mb-3">
          <p className="mb-3">
            Are you sure you want to remove <strong>"{trainee?.name}"</strong> 
            {isRemoveFromAll ? ' from ALL subjects' : ` from "${subjectName}"`}?
          </p>
          
          <div className="bg-light p-3 rounded mb-3">
            <strong>Trainee:</strong> {trainee?.name}<br />
            <strong>EID:</strong> {trainee?.eid}
            {!isRemoveFromAll && (
              <>
                <br />
                <strong>Subject:</strong> {subjectName}
              </>
            )}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-danger mb-2">
            <strong>Warning:</strong> This action will:
          </p>
          <ul className="text-danger mb-3">
            {isRemoveFromAll ? (
              <>
                <li>Remove the trainee from all enrolled subjects</li>
                <li>Cancel all ongoing training sessions for this trainee</li>
                <li>Remove the trainee from the course completely</li>
              </>
            ) : (
              <>
                <li>Remove the trainee from this specific subject only</li>
                <li>Cancel any ongoing training sessions for this subject</li>
                <li>Keep the trainee enrolled in other subjects</li>
              </>
            )}
            <li><strong>Cannot be undone</strong></li>
          </ul>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
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
              {confirmButtonText}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveTraineeModal;
