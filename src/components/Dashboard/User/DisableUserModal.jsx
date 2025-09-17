import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangle, PersonX, CheckCircle } from 'react-bootstrap-icons';

const DisableUserModal = ({ 
  show, 
  user, 
  onConfirm, 
  onCancel, 
  loading = false 
}) => {
  if (!user) return null;

  const isDisabling = user.status === 'Active';
  const actionText = isDisabling ? 'Disable' : 'Enable';
  const actionIcon = isDisabling ? PersonX : CheckCircle;
  const ActionIcon = actionIcon;

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
        className={`border-0 ${isDisabling ? 'bg-warning-subtle' : 'bg-success-subtle'}`}
      >
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangle 
            className={`me-2 ${isDisabling ? 'text-warning' : 'text-success'}`} 
            size={20} 
          />
          {actionText} User
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-4">
        <div className="text-center mb-4">
          <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 ${
            isDisabling ? 'bg-warning-subtle' : 'bg-success-subtle'
          }`} 
          style={{ width: '64px', height: '64px' }}>
            <ActionIcon 
              size={32} 
              className={isDisabling ? 'text-warning' : 'text-success'} 
            />
          </div>
          
          <h5 className="mb-3">
            {isDisabling ? 'Disable User Account' : 'Enable User Account'}
          </h5>
          
          <p className="text-muted mb-4">
            {isDisabling 
              ? 'Are you sure you want to disable this user account? This action will:'
              : 'Are you sure you want to enable this user account? This action will:'
            }
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
            <div className="col-4">
              <div className="text-muted small">EID</div>
              <div className="fw-medium">{user.eid}</div>
            </div>
            <div className="col-4">
              <div className="text-muted small">Role</div>
              <div className="fw-medium">{user.role}</div>
            </div>
            <div className="col-4">
              <div className="text-muted small">Department</div>
              <div className="fw-medium">{user.department}</div>
            </div>
          </div>
        </div>

        {isDisabling ? (
          <Alert variant="warning" className="mb-0">
            <div className="fw-semibold mb-2">⚠️ What happens when disabled:</div>
            <ul className="mb-0 small">
              <li>User cannot log into the system</li>
              <li>All active sessions will be terminated</li>
              <li>User data will be preserved but access restricted</li>
              <li>User can be re-enabled later by an administrator</li>
            </ul>
          </Alert>
        ) : (
          <Alert variant="success" className="mb-0">
            <div className="fw-semibold mb-2">✅ What happens when enabled:</div>
            <ul className="mb-0 small">
              <li>User can log into the system normally</li>
              <li>All permissions and access will be restored</li>
              <li>User will receive notification of account activation</li>
              <li>Previous data and settings will be available</li>
            </ul>
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light">
        <Button 
          variant="outline-secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          variant={isDisabling ? 'warning' : 'success'}
          onClick={onConfirm}
          disabled={loading}
          className="d-flex align-items-center"
        >
          {loading ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              {isDisabling ? 'Disabling...' : 'Enabling...'}
            </>
          ) : (
            <>
              <ActionIcon className="me-2" size={16} />
              {actionText} User
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DisableUserModal;
