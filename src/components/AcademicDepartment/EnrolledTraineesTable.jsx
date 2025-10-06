import React, { useState } from 'react';
import { Card, Table, Badge, Modal, Button } from 'react-bootstrap';
import { People, X } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import EnrolledTraineeActions from './EnrolledTraineeActions';

const mockSubjects = [
  { id: 's1', name: 'Safety Basics', code: 'SB01' },
  { id: 's2', name: 'Evacuation Drills', code: 'ED02' },
  { id: 's3', name: 'CPR & First Aid', code: 'FA03' },
  { id: 's4', name: 'Fire Safety', code: 'FS04' },
  { id: 's5', name: 'Emergency Procedures', code: 'EP05' }
];

const EnrolledTraineesTable = ({ courseId, enrolledTrainees, onUpdate, loading = false }) => {
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  
  const { sortedData, sortConfig, handleSort, getSortIcon, getSortClass } = useTableSort(enrolledTrainees);

  const handleViewSubjects = (trainee) => {
    setSelectedTrainee(trainee);
    setShowSubjectModal(true);
  };

  const handleRemoveTrainee = (traineeId) => {
    console.log('Remove trainee from all subjects:', traineeId);
    // TODO: Implement remove trainee from all subjects
    onUpdate(enrolledTrainees.filter(t => t.id !== traineeId));
  };

  const handleRemoveSubject = (traineeId, subjectId) => {
    console.log('Remove trainee from subject:', traineeId, subjectId);
    // TODO: Implement remove trainee from specific subject
    const updatedTrainees = enrolledTrainees.map(trainee => {
      if (trainee.id === traineeId) {
        return {
          ...trainee,
          subjects: trainee.subjects.filter(s => s !== subjectId)
        };
      }
      return trainee;
    });
    onUpdate(updatedTrainees);
  };

  const getSubjectName = (subjectId) => {
    const subject = mockSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getSubjectCode = (subjectId) => {
    const subject = mockSubjects.find(s => s.id === subjectId);
    return subject ? subject.code : 'Unknown';
  };

  if (loading) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-white border-bottom">
          <h6 className="mb-0">Enrolled Trainees</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <LoadingSkeleton rows={4} columns={4} />
        </Card.Body>
      </Card>
    );
  }

  if (enrolledTrainees.length === 0) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-white border-bottom">
          <h6 className="mb-0">Enrolled Trainees (0)</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="text-center py-5">
            <div className="text-muted">
              <h5>No enrolled trainees</h5>
              <p>This course doesn't have any enrolled trainees yet.</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;

    return (
      <th
        className={`border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.08)';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '700' : '600'
          }}>
            {children}
          </span>
          <div
            className="ms-2 d-flex align-items-center"
            style={{
              minWidth: '20px',
              justifyContent: 'center'
            }}
          >
            <SortIcon
              direction={direction}
              size={14}
            />
          </div>
        </div>
        {isActive && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, var(--bs-primary), var(--bs-info))',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </th>
    );
  };

  return (
    <>
      <Card className="d-flex flex-column">
        <Card.Header className="bg-white border-bottom">
          <h6 className="mb-0">Enrolled Trainees ({enrolledTrainees.length})</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="department-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <Table hover className="mb-0 table-mobile-responsive">
              <thead className="sticky-header bg-gradient-primary-custom">
                <tr>
                  <SortableHeader columnKey="name" className="show-mobile">
                    Trainee
                  </SortableHeader>
                  <SortableHeader columnKey="eid" className="show-mobile">
                    EID
                  </SortableHeader>
                  <SortableHeader columnKey="subjects" className="show-mobile">
                    Subjects
                  </SortableHeader>
                  <th className="border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 text-center show-mobile">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((trainee, index) => (
                  <tr key={trainee.id}>
                    <td className="show-mobile">
                      <div className="fw-semibold text-primary-custom">
                        {trainee.name}
                      </div>
                    </td>
                    <td className="show-mobile">
                      <Badge 
                        bg="secondary" 
                        className="px-2 py-1"
                        style={{ 
                          fontSize: '0.75rem',
                          width: 'fit-content'
                        }}
                      >
                        {trainee.eid}
                      </Badge>
                    </td>
                    <td className="show-mobile">
                      <div className="d-flex align-items-center">
                        <People size={14} className="me-1 text-muted" />
                        <Badge 
                          bg="info"
                          className="px-2 py-1"
                          style={{ 
                            fontSize: '0.75rem',
                            width: 'fit-content'
                          }}
                        >
                          {trainee.subjects.length} subjects
                        </Badge>
                      </div>
                    </td>
                    <td className="text-center show-mobile">
                      <EnrolledTraineeActions
                        trainee={trainee}
                        onViewSubjects={handleViewSubjects}
                        onRemoveTrainee={handleRemoveTrainee}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Subject List Modal */}
      <Modal show={showSubjectModal} onHide={() => setShowSubjectModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>
            Subjects for {selectedTrainee?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTrainee && (
            <div>
              <p className="text-muted mb-3">
                <strong>EID:</strong> {selectedTrainee.eid}
              </p>
              <div className="list-group">
                {selectedTrainee.subjects.map(subjectId => (
                  <div 
                    key={subjectId}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-semibold">{getSubjectName(subjectId)}</div>
                      <small className="text-muted">{getSubjectCode(subjectId)}</small>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline-danger"
                      onClick={() => {
                        handleRemoveSubject(selectedTrainee.id, subjectId);
                        setShowSubjectModal(false);
                      }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubjectModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EnrolledTraineesTable;
