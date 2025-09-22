import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { X, PersonPlus, PersonDash } from 'react-bootstrap-icons';

const AssignInstructorsModal = ({ 
  show, 
  department, 
  onClose, 
  onAssign,
  availableInstructors = [],
  assignedInstructors = []
}) => {
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (show) {
      setSelectedInstructors([]);
      setSearchTerm('');
    }
  }, [show]);

  const handleInstructorToggle = (instructorId) => {
    setSelectedInstructors(prev => 
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const handleAssign = () => {
    onAssign(selectedInstructors);
    setSelectedInstructors([]);
  };

  const handleRemoveInstructor = (instructorId) => {
    // This would call a remove function from parent
    console.log('Remove instructor:', instructorId);
  };

  const filteredAvailableInstructors = availableInstructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!show || !department) return null;

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header 
        className="bg-gradient-primary-custom text-white border-0"
        closeButton
        closeVariant="white"
      >
        <Modal.Title className="d-flex align-items-center">
          <PersonPlus className="me-2" size={20} />
          Assign Instructors - {department.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Row>
          {/* Available Instructors */}
          <Col md={6}>
            <div className="mb-3">
              <h5 className="fw-semibold text-dark mb-3">Available Instructors</h5>
              
              {/* Search */}
              <Form.Control
                type="text"
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
                style={{
                  borderColor: 'var(--bs-primary)',
                  borderWidth: '2px'
                }}
              />

              {/* Instructors List */}
              <div 
                className="border rounded"
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                {filteredAvailableInstructors.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    No available instructors found
                  </div>
                ) : (
                  filteredAvailableInstructors.map((instructor) => (
                    <div 
                      key={instructor.id} 
                      className="d-flex align-items-center p-3 border-bottom"
                      style={{ 
                        backgroundColor: selectedInstructors.includes(instructor.id) 
                          ? 'var(--bs-primary-bg-subtle)' 
                          : 'transparent'
                      }}
                    >
                      <Form.Check
                        type="checkbox"
                        checked={selectedInstructors.includes(instructor.id)}
                        onChange={() => handleInstructorToggle(instructor.id)}
                        className="me-3"
                      />
                      <div className="flex-grow-1">
                        <div className="fw-semibold text-dark">{instructor.name}</div>
                        <div className="text-muted small">{instructor.email}</div>
                        <div className="text-muted small">
                          {instructor.specialization || 'No specialization'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Col>

          {/* Currently Assigned */}
          <Col md={6}>
            <div className="mb-3">
              <h5 className="fw-semibold text-dark mb-3">Currently Assigned</h5>
              
              <div 
                className="border rounded"
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  borderColor: 'var(--bs-success)'
                }}
              >
                {assignedInstructors.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    No instructors assigned yet
                  </div>
                ) : (
                  assignedInstructors.map((instructor) => (
                    <div 
                      key={instructor.id} 
                      className="d-flex align-items-center p-3 border-bottom bg-light"
                    >
                      <div className="flex-grow-1">
                        <div className="fw-semibold text-dark">{instructor.name}</div>
                        <div className="text-muted small">{instructor.email}</div>
                        <div className="text-muted small">
                          {instructor.specialization || 'No specialization'}
                        </div>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveInstructor(instructor.id)}
                        title="Remove instructor"
                      >
                        <PersonDash size={14} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Selection Summary */}
        {selectedInstructors.length > 0 && (
          <Alert variant="info" className="mt-3">
            <strong>{selectedInstructors.length}</strong> instructor(s) selected for assignment
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button
          variant="outline-secondary"
          onClick={onClose}
        >
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        <Button
          variant="primary"
          onClick={handleAssign}
          disabled={selectedInstructors.length === 0}
        >
          <PersonPlus className="me-2" size={16} />
          Assign {selectedInstructors.length} Instructor(s)
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignInstructorsModal;
