import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { CheckCircle } from 'react-bootstrap-icons';

const ApproveTemplateModal = ({
  show,
  onHide,
  template,
  onApprove,
  reviewing
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <CheckCircle className="me-2" size={20} />
          Approve Template
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="mb-0">
          Are you sure you want to approve the template <strong>"{template?.name}"</strong>?
        </p>
        <p className="text-muted mt-2 mb-0">
          Once approved, the template will be published and available for use.
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button 
          variant="outline-secondary" 
          onClick={onHide}
          disabled={reviewing}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={onApprove}
          disabled={reviewing}
          className="d-flex align-items-center"
        >
          {reviewing ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle className="me-2" size={16} />
              Approve
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApproveTemplateModal;


