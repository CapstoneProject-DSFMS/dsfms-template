import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangle, CheckCircle, X } from 'react-bootstrap-icons';

const RoleChangeConfirmModal = ({ 
  show, 
  user, 
  newRole, 
  onConfirm, 
  onCancel, 
  loading = false 
}) => {
  if (!user) {
    return null;
  }

  const getEidPrefix = (role) => {
    switch (role) {
      case 'ADMIN': return 'AD';
      case 'ACADEMIC_DEPT': return 'AC';
      case 'DEPT_HEAD': return 'DH';
      case 'TRAINER': return 'TR';
      case 'TRAINEE': return 'TN';
      case 'SQA_AUDITOR': return 'QA';
      default: return 'EM';
    }
  };

  const currentEidPrefix = getEidPrefix(user.role);
  const newEidPrefix = getEidPrefix(newRole);

  return (
    <Modal 
      show={show} 
      onHide={onCancel}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header 
        closeButton 
        className="bg-warning-subtle border-0"
      >
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangle 
            className="me-2 text-warning" 
            size={20} 
          />
          Role Change Confirmation
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-4">
        <div className="text-center mb-4">
          <div className="bg-warning-subtle rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
               style={{ width: '64px', height: '64px' }}>
            <ExclamationTriangle 
              size={32} 
              className="text-warning" 
            />
          </div>
          
          <h5 className="mb-3">Role Change Will Update EID</h5>
          
          <p className="text-muted mb-4">
            Changing the user's role will automatically update their Employee ID (EID) to match the new role prefix.
          </p>
        </div>

        <div className="bg-light rounded p-3 mb-4">
          <div className="d-flex align-items-center mb-2">
            <div className="me-3">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: '40px', height: '40px' }}>
                <span className="fw-bold">{user.fullName.charAt(0)}</span>
              </div>
            </div>
            <div>
              <div className="fw-semibold">{user.fullName}</div>
              <small className="text-muted">{user.email}</small>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-6">
              <div className="text-muted small">Current Role</div>
              <div className="fw-medium">{user.role}</div>
            </div>
            <div className="col-6">
              <div className="text-muted small">New Role</div>
              <div className="fw-medium text-primary">{newRole}</div>
            </div>
          </div>
        </div>

        <Alert variant="warning" className="mb-0">
          <div className="fw-semibold mb-2">⚠️ EID Change Details:</div>
          <ul className="mb-0 small">
            <li><strong>Current EID:</strong> {user.eid} (Prefix: {currentEidPrefix})</li>
            <li><strong>New EID:</strong> {newEidPrefix}XXXXXX (Prefix: {newEidPrefix})</li>
            <li>The EID will be automatically updated to reflect the new role</li>
            <li>This change cannot be undone easily</li>
          </ul>
        </Alert>
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light">
        <Button 
          variant="outline-secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          <X className="me-2" size={16} />
          Cancel
        </Button>
        <Button 
          variant="warning"
          onClick={() => {
            onConfirm();
          }}
          disabled={loading}
          className="d-flex align-items-center"
        >
          {loading ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Updating...
            </>
          ) : (
            <>
              <CheckCircle className="me-2" size={16} />
              Confirm Role Change
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoleChangeConfirmModal;
