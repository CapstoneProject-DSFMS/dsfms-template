import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangle, ShieldX, CheckCircle } from 'react-bootstrap-icons';

const DisableRoleModal = ({
  show,
  role,
  onConfirm,
  onCancel,
  loading
}) => {
  if (!role) return null;

  const isDisabling = role.status === 'Active';
  const actionText = isDisabling ? 'Disable' : 'Enable';
  const actionIcon = isDisabling ? ShieldX : CheckCircle;
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
        className="text-white border-0"
        style={{ 
          backgroundColor: isDisabling ? 'var(--bs-secondary)' : '#28a745',
          borderBottom: 'none'
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <ActionIcon size={24} className="me-2" />
          {actionText} Role: {role.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        <div className="d-flex align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3 text-white"
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: isDisabling ? 'var(--bs-secondary)' : '#28a745',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {role.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h6 className="mb-0">{role.name}</h6>
          </div>
        </div>

        {isDisabling ? (
          <Alert 
            variant="warning" 
            className="mb-3"
            style={{
              backgroundColor: '#f0e8e0',
              borderColor: 'var(--bs-secondary)',
              color: 'var(--bs-dark)'
            }}
          >
            <h6 className="alert-heading d-flex align-items-center">
              <ExclamationTriangle className="me-2" style={{ color: 'var(--bs-secondary)' }} /> Warning: Disabling Role
            </h6>
            <p className="mb-1">
              This action will disable the <span className="fw-bold">{role.name}</span> role.
            </p>
            <ul className="mb-0 ps-3">
              <li>Users with this role will lose access to associated permissions.</li>
              <li>Role data will be preserved but access will be restricted.</li>
              <li>Role can be re-enabled later by an administrator.</li>
              <li>Currently assigned to {role.assignedUsers} user{role.assignedUsers !== 1 ? 's' : ''}.</li>
            </ul>
          </Alert>
        ) : (
          <Alert variant="success" className="mb-3">
            <h6 className="alert-heading d-flex align-items-center">
              <CheckCircle className="me-2" /> Confirm: Enabling Role
            </h6>
            <p className="mb-1">
              This action will restore the <span className="fw-bold">{role.name}</span> role.
            </p>
            <ul className="mb-0 ps-3">
              <li>Users with this role will regain access to associated permissions.</li>
              <li>All role permissions and access will be restored.</li>
              <li>Role will be available for assignment to new users.</li>
              <li>Currently assigned to {role.assignedUsers} user{role.assignedUsers !== 1 ? 's' : ''}.</li>
            </ul>
          </Alert>
        )}

        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="outline-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={isDisabling ? 'secondary' : 'success'}
            onClick={onConfirm}
            disabled={loading}
            className="d-flex align-items-center"
            style={isDisabling ? {
              backgroundColor: 'var(--bs-secondary)',
              borderColor: 'var(--bs-secondary)',
              color: '#fff'
            } : {}}
          >
            {loading ? (
              <>
                <div 
                  className="spinner-border spinner-border-sm me-2" 
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                {isDisabling ? 'Disabling...' : 'Enabling...'}
              </>
            ) : (
              <>
                <ActionIcon size={16} className="me-2" />
                {actionText} Role
              </>
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DisableRoleModal;
