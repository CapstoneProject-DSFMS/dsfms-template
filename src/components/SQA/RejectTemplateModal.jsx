import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { XCircle } from 'react-bootstrap-icons';

const RejectTemplateModal = ({
  show,
  onHide,
  template,
  rejectComment,
  onRejectCommentChange,
  onReject,
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
      <Modal.Header className="bg-secondary text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <XCircle className="me-2" size={20} />
          Reject Template
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="mb-3">
          Are you sure you want to reject the template <strong>"{template?.name}"</strong>?
        </p>
        <Form.Group>
          <Form.Label>
            <strong>Reason for Rejection <span className="text-danger">*</span></strong>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={rejectComment}
            onChange={(e) => onRejectCommentChange(e.target.value)}
            placeholder="Please provide a reason for rejecting this template..."
            disabled={reviewing}
          />
          <Form.Text className="text-muted">
            This comment will be visible to the template creator.
          </Form.Text>
        </Form.Group>
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
          variant="secondary" 
          onClick={onReject}
          disabled={reviewing || !rejectComment.trim()}
          className="d-flex align-items-center"
        >
          {reviewing ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="me-2" size={16} />
              Reject
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RejectTemplateModal;

