import React from 'react';
import { Modal, Row, Col, Badge } from 'react-bootstrap';
import { X, Building, People, Book, PersonCheck } from 'react-bootstrap-icons';

const DepartmentDetailsModal = ({ show, department, onClose }) => {
  if (!show || !department) return null;

  const getTypeColor = (type) => {
    switch (type) {
      case 'CCT': return 'bg-info';
      case 'FCTD': return 'bg-success';
      case 'GOT': return 'bg-warning';
      case 'SQA': return 'bg-secondary';
      default: return 'bg-dark';
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered style={{ maxHeight: '100vh' }}>
      <Modal.Header 
        className="bg-gradient-primary-custom text-white border-0"
        closeButton
        closeVariant="white"
      >
        <Modal.Title className="d-flex align-items-center">
          <Building className="me-2" size={20} />
          Department Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Row className="mb-4">
          <Col md={8}>
            <h3 className="fw-bold text-dark mb-2">{department.name}</h3>
            <p className="text-muted mb-3">{department.description}</p>
          </Col>
          <Col md={4} className="text-end">
            <Badge 
              bg={department.status === 'ACTIVE' ? 'success' : 'secondary'}
              className="px-3 py-2 fs-6"
            >
              {department.status?.replace(/_/g, ' ')}
            </Badge>
          </Col>
        </Row>

        {/* Basic Information */}
        <Row className="mb-4">
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">
                Department Code
              </label>
              <div className="p-3 bg-light rounded">
                <Badge bg="primary" className="px-3 py-2 fs-6">
                  {department.code}
                </Badge>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">
                Department Type
              </label>
              <div className="p-3 bg-light rounded">
                <Badge 
                  bg={getTypeColor(department.type).replace('bg-', '')}
                  className="px-3 py-2 fs-6"
                >
                  {department.type}
                </Badge>
              </div>
            </div>
          </Col>
        </Row>

        {/* Department Head */}
        <Row className="mb-4">
          <Col md={12}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">
                Department Head
              </label>
              <div className="p-3 bg-light rounded">
                {department.departmentHead ? (
                  <div className="d-flex align-items-center">
                    <PersonCheck className="me-3 text-primary" size={24} />
                    <div>
                      <div className="fw-semibold text-dark">
                        {department.departmentHead.name}
                      </div>
                      <div className="text-muted">
                        {department.departmentHead.email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted italic">Not assigned</span>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Statistics */}
        <Row className="mb-4">
          <Col md={12}>
            <label className="form-label fw-semibold text-dark mb-3">
              Department Statistics
            </label>
            <Row>
              <Col md={4}>
                <div className="bg-primary bg-opacity-10 p-4 rounded text-center">
                  <Book className="text-primary mb-2" size={32} />
                  <div className="h3 fw-bold text-primary mb-1">
                    {department.coursesCount || 0}
                  </div>
                  <div className="text-primary fw-semibold">Courses</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="bg-success bg-opacity-10 p-4 rounded text-center">
                  <People className="text-success mb-2" size={32} />
                  <div className="h3 fw-bold text-success mb-1">
                    {department.traineesCount || 0}
                  </div>
                  <div className="text-success fw-semibold">Trainees</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="bg-info bg-opacity-10 p-4 rounded text-center">
                  <PersonCheck className="text-info mb-2" size={32} />
                  <div className="h3 fw-bold text-info mb-1">
                    {department.trainersCount || 0}
                  </div>
                  <div className="text-info fw-semibold">Trainers</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Additional Information */}
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">
                Created Date
              </label>
              <div className="p-3 bg-light rounded">
                {new Date(department.createdAt).toLocaleDateString()}
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">
                Last Updated
              </label>
              <div className="p-3 bg-light rounded">
                {new Date(department.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <button
          className="btn btn-secondary"
          onClick={onClose}
        >
          <X className="me-2" size={16} />
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default DepartmentDetailsModal;
