import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table } from 'react-bootstrap';
import { 
  Person, 
  Calendar, 
  Book, 
  X,
  Trash
} from 'react-bootstrap-icons';
import RemoveSubjectModal from './RemoveSubjectModal';

const TraineeDetailsModal = ({ 
  show, 
  onClose, 
  trainee, 
  onRemoveSubject,
  loading = false 
}) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  if (!trainee) return null;

  const handleRemoveSubject = (subjectId, subjectName) => {
    const subject = trainee.subjects.find(s => s.id === subjectId);
    if (subject) {
      setSelectedSubject(subject);
      setShowRemoveModal(true);
    }
  };

  const handleConfirmRemove = async (traineeId, subjectId) => {
    setIsRemoving(true);
    try {
      await onRemoveSubject(traineeId, subjectId);
      setShowRemoveModal(false);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error removing subject:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCloseRemoveModal = () => {
    setShowRemoveModal(false);
    setSelectedSubject(null);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="d-flex align-items-center">
          <Person className="me-2 text-primary" size={20} />
          Trainee Details
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {/* Basic Information */}
        <Row className="mb-4">
          <Col md={6}>
            <div className="mb-3">
              <h6 className="text-muted mb-1">Full Name</h6>
              <p className="mb-0 fw-semibold">{trainee.name}</p>
            </div>
            <div className="mb-3">
              <h6 className="text-muted mb-1">Employee ID</h6>
              <Badge bg="secondary" className="px-2 py-1">
                {trainee.eid}
              </Badge>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <h6 className="text-muted mb-1">Email</h6>
              <span>{trainee.email}</span>
            </div>
            <div className="mb-3">
              <h6 className="text-muted mb-1">Phone</h6>
              <span>{trainee.phone}</span>
            </div>
          </Col>
        </Row>

        {/* Enrollment Information */}
        <Row className="mb-4">
          <Col md={6}>
            <div className="mb-3">
              <h6 className="text-muted mb-1">Enroll Date</h6>
              <div className="d-flex align-items-center">
                <Calendar size={16} className="me-2 text-primary" />
                <span>{trainee.enrollDate || 'N/A'}</span>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <h6 className="text-muted mb-1">Enroll Batch</h6>
              <Badge bg="info" className="px-2 py-1">
                {trainee.enrollBatch || 'N/A'}
              </Badge>
            </div>
          </Col>
        </Row>

        {/* Subjects Section */}
        <div className="mb-3">
          <h6 className="text-muted mb-3 d-flex align-items-center">
            <Book className="me-2 text-primary" size={16} />
            Enrolled Subjects ({trainee.subjects?.length || 0})
          </h6>
          
          {trainee.subjects && trainee.subjects.length > 0 ? (
            <div className="table-responsive">
              <Table hover size="sm" className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Subject Name</th>
                    <th className="border-0">Code</th>
                    <th className="border-0">Status</th>
                    <th className="border-0 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainee.subjects.map((subject, index) => (
                    <tr key={index}>
                      <td className="border-0">
                        <div className="fw-semibold">{subject.name}</div>
                        {subject.description && (
                          <small className="text-muted">{subject.description}</small>
                        )}
                      </td>
                      <td className="border-0">
                        <Badge bg="secondary" className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
                          {subject.code}
                        </Badge>
                      </td>
                      <td className="border-0">
                        <Badge 
                          bg={subject.status === 'ACTIVE' ? 'success' : subject.status === 'COMPLETED' ? 'primary' : 'warning'}
                          className="px-2 py-1" 
                          style={{ fontSize: '0.75rem' }}
                        >
                          {subject.status}
                        </Badge>
                      </td>
                      <td className="border-0 text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveSubject(subject.id || index, subject.name)}
                          disabled={loading}
                          className="p-1"
                          style={{ minWidth: '32px' }}
                        >
                          <Trash size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted py-3">
              <Book size={32} className="mb-2" />
              <p className="mb-0">No subjects enrolled</p>
            </div>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-top">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>

      {/* Remove Subject Confirmation Modal */}
      <RemoveSubjectModal
        show={showRemoveModal}
        onClose={handleCloseRemoveModal}
        onConfirm={handleConfirmRemove}
        trainee={trainee}
        subject={selectedSubject}
        loading={isRemoving}
      />
    </Modal>
  );
};

export default TraineeDetailsModal;
