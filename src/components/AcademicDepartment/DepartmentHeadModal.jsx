import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Person, Envelope } from 'react-bootstrap-icons';

const DepartmentHeadModal = ({ show, onClose, departmentHead, department }) => {
  if (!departmentHead) return null;

  // Build full name from API data
  const fullName = [
    departmentHead.firstName,
    departmentHead.middleName,
    departmentHead.lastName
  ].filter(Boolean).join(' ');

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Person className="me-2" />
          Department Head Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          {/* Profile Section */}
          <Col md={4}>
            <div className="text-center">
              <div 
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '80px', height: '80px' }}
              >
                <Person size={40} className="text-white" />
              </div>
              <h5 className="mb-1">{fullName}</h5>
              <Badge bg="primary" className="mb-2">
                {departmentHead.role?.name || 'Department Head'}
              </Badge>
              <p className="text-muted small mb-0">{department?.name}</p>
            </div>
          </Col>

          {/* Details Section */}
          <Col md={8}>
            <Row className="g-4">
              <Col md={12}>
                <div className="d-flex align-items-center">
                  <Envelope size={16} className="me-2 text-primary" />
                  <div>
                    <small className="text-muted">Email</small>
                    <div className="fw-semibold">{departmentHead.email || 'N/A'}</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DepartmentHeadModal;
