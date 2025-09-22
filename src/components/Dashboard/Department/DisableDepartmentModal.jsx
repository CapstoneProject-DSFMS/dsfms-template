import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangle, X } from 'react-bootstrap-icons';

const DisableDepartmentModal = ({ 
  show, 
  department, 
  onConfirm, 
  onCancel, 
  isProcessing 
}) => {
  if (!department) return null;

  const isDeactivating = department.status === 'ACTIVE';
  const actionText = isDeactivating ? 'deactivate' : 'activate';
  const actionTextCapitalized = isDeactivating ? 'Deactivate' : 'Activate';

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangle className="me-2 text-warning" size={20} />
          {actionTextCapitalized} Department
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-0">
        <Alert variant={isDeactivating ? 'warning' : 'info'} className="mb-3">
          <div className="d-flex align-items-start">
            <ExclamationTriangle className="me-2 mt-1" size={16} />
            <div>
              <strong>Are you sure you want to {actionText} this department?</strong>
              <div className="mt-2">
                <strong>Department:</strong> {department.name} ({department.code})
              </div>
              {isDeactivating && (
                <div className="mt-2">
                  <strong>Warning:</strong> Deactivating this department will:
                  <ul className="mb-0 mt-1">
                    <li>Make it unavailable for new course assignments</li>
                    <li>Hide it from department selection dropdowns</li>
                    <li>Not affect existing courses and users</li>
                  </ul>
                </div>
              )}
              {!isDeactivating && (
                <div className="mt-2">
                  <strong>Note:</strong> Activating this department will make it available for:
                  <ul className="mb-0 mt-1">
                    <li>New course assignments</li>
                    <li>Department selection in forms</li>
                    <li>User management operations</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Alert>

        <div className="bg-light p-3 rounded">
          <div className="row">
            <div className="col-6">
              <strong>Department Head:</strong><br />
              <span className="text-muted">
                {department.departmentHead?.name || 'N/A'}
              </span>
            </div>
            <div className="col-6">
              <strong>Current Status:</strong><br />
              <span className={`badge ${
                department.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'
              }`}>
                {department.status}
              </span>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-4">
              <strong>Courses:</strong> {department.coursesCount || 0}
            </div>
            <div className="col-4">
              <strong>Trainees:</strong> {department.traineesCount || 0}
            </div>
            <div className="col-4">
              <strong>Trainers:</strong> {department.trainersCount || 0}
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={isProcessing}
        >
          <X className="me-2" size={16} />
          Cancel
        </Button>
        <Button
          variant={isDeactivating ? 'warning' : 'success'}
          onClick={onConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            <>
              <ExclamationTriangle className="me-2" size={16} />
              {actionTextCapitalized} Department
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DisableDepartmentModal;
