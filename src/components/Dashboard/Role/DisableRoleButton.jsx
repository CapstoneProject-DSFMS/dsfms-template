import React, { useState } from 'react';
import { Button, Modal, Alert } from 'react-bootstrap';
import { ShieldX, ExclamationTriangle } from 'react-bootstrap-icons';

const DisableRoleButton = ({ 
  roleId, 
  roleName, 
  onDisable, 
  size = 'sm',
  className = ''
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const handleDisable = async () => {
    setIsDisabling(true);
    try {
      await onDisable(roleId);
      setShowConfirm(false);
    } catch (error) {
      console.error('Error disabling role:', error);
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <>
      <Button
        variant="outline-warning"
        size={size}
        onClick={() => setShowConfirm(true)}
        className={`d-flex align-items-center ${className}`}
        style={{
          borderColor: 'var(--bs-warning)',
          color: 'var(--bs-warning)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--bs-warning)';
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'var(--bs-warning)';
        }}
      >
        <ShieldX size={14} className="me-1" />
        Disable
      </Button>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header className="bg-warning text-dark border-0">
          <Modal.Title className="d-flex align-items-center">
            <ExclamationTriangle className="me-2" size={20} />
            Disable Role
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Alert variant="warning" className="mb-3">
            <ExclamationTriangle className="me-2" size={16} />
            <strong>Warning:</strong> This action will disable the role and prevent it from being assigned to new users.
          </Alert>

          <p className="mb-3">
            Are you sure you want to disable the role <strong>"{roleName}"</strong>?
          </p>

          <div className="bg-light-custom p-3 rounded">
            <h6 className="text-primary-custom mb-2">What happens when you disable a role:</h6>
            <ul className="text-muted small mb-0">
              <li>Existing users with this role will keep their permissions</li>
              <li>This role cannot be assigned to new users</li>
              <li>You can re-enable the role later if needed</li>
            </ul>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 p-4">
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirm(false)}
            disabled={isDisabling}
          >
            Cancel
          </Button>
          
          <Button
            variant="warning"
            onClick={handleDisable}
            disabled={isDisabling}
          >
            {isDisabling ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Disabling...
              </>
            ) : (
              <>
                <ShieldX className="me-2" size={16} />
                Disable Role
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DisableRoleButton;
