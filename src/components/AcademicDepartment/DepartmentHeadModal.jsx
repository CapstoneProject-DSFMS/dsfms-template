import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Person, Envelope, Phone, Calendar, Building, Award } from 'react-bootstrap-icons';

const DepartmentHeadModal = ({ show, onClose, departmentHead, department }) => {
  if (!departmentHead) return null;

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
              <h5 className="mb-1">{departmentHead.firstName} {departmentHead.lastName}</h5>
              <Badge bg="primary" className="mb-2">Department Head</Badge>
              <p className="text-muted small mb-0">{department?.name}</p>
            </div>
          </Col>

          {/* Details Section */}
          <Col md={8}>
            <Row className="g-3">
              <Col md={6}>
                <div className="d-flex align-items-center">
                  <Envelope size={16} className="me-2 text-primary" />
                  <div>
                    <small className="text-muted">Email</small>
                    <div className="fw-semibold">{departmentHead.email}</div>
                  </div>
                </div>
              </Col>
              
              <Col md={6}>
                <div className="d-flex align-items-center">
                  <Phone size={16} className="me-2 text-primary" />
                  <div>
                    <small className="text-muted">Phone</small>
                    <div className="fw-semibold">{departmentHead.phone || 'N/A'}</div>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="d-flex align-items-center">
                  <Building size={16} className="me-2 text-primary" />
                  <div>
                    <small className="text-muted">Department</small>
                    <div className="fw-semibold">{department?.name} ({department?.code})</div>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="d-flex align-items-center">
                  <Calendar size={16} className="me-2 text-primary" />
                  <div>
                    <small className="text-muted">Appointed Date</small>
                    <div className="fw-semibold">{departmentHead.appointedDate || 'N/A'}</div>
                  </div>
                </div>
              </Col>

              <Col md={12}>
                <div className="d-flex align-items-start">
                  <Award size={16} className="me-2 text-primary mt-1" />
                  <div>
                    <small className="text-muted">Responsibilities</small>
                    <div className="fw-semibold">
                      {departmentHead.responsibilities || 'Oversee department operations, manage training programs, and ensure compliance with safety standards.'}
                    </div>
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
