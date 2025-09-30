import React, { useState } from 'react';
import { Table, Button, Dropdown, Modal } from 'react-bootstrap';
import { PersonCheck, PersonPlus, ThreeDotsVertical, PersonDash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { departmentAPI } from '../../api/department';

const AssignedTrainersTable = ({ 
  trainers = [], 
  loading = false, 
  showAddButton = false, 
  onAddClick,
  departmentId,
  onTrainerRemoved 
}) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [trainerToRemove, setTrainerToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading trainers...</p>
      </div>
    );
  }

  if (!trainers || trainers.length === 0) {
    return (
      <div className="text-center py-5">
        <PersonCheck size={48} className="text-muted mb-3" />
        <h5 className="text-muted">No trainers assigned</h5>
        <p className="text-muted">This department doesn't have any trainers assigned yet.</p>
      </div>
    );
  }

  const getFullName = (trainer) => {
    const { firstName, middleName, lastName } = trainer;
    return [firstName, middleName, lastName].filter(Boolean).join(' ');
  };

  const handleRemoveClick = (trainer) => {
    setTrainerToRemove(trainer);
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!trainerToRemove || !departmentId) return;

    setRemoving(true);
    try {
      await departmentAPI.removeTrainersFromDepartment(departmentId, [trainerToRemove.eid]);
      toast.success(`Successfully removed ${getFullName(trainerToRemove)} from department`);
      
      if (onTrainerRemoved) {
        onTrainerRemoved();
      }
      
      setShowRemoveModal(false);
      setTrainerToRemove(null);
    } catch (error) {
      console.error('Error removing trainer:', error);
      toast.error('Failed to remove trainer from department');
    } finally {
      setRemoving(false);
    }
  };

  const handleRemoveCancel = () => {
    setShowRemoveModal(false);
    setTrainerToRemove(null);
  };


  return (
    <div className="assigned-trainers-table">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          <PersonCheck className="me-2" />
          Assigned Trainers ({trainers.length})
        </h5>
        {showAddButton && (
          <Button 
            variant="primary"
            onClick={onAddClick}
            className="d-flex align-items-center"
          >
            <PersonPlus className="me-2" size={16} />
            Add Trainers to Department
          </Button>
        )}
      </div>

      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th>EID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th width="80">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((trainer) => (
              <tr key={trainer.id}>
                <td>
                  <code className="text-primary">{trainer.eid}</code>
                </td>
                <td>
                  <div className="fw-medium">{getFullName(trainer)}</div>
                </td>
                <td>
                  <span>{trainer.email}</span>
                </td>
                <td>
                  {trainer.phoneNumber ? (
                    <span>{trainer.phoneNumber}</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {trainer.address ? (
                    <span className="text-truncate" style={{ maxWidth: '200px' }} title={trainer.address}>
                      {trainer.address}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle 
                      variant="outline-secondary" 
                      size="sm"
                      className="border-0 bg-transparent p-1"
                    >
                      <ThreeDotsVertical size={16} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item 
                        onClick={() => handleRemoveClick(trainer)}
                        className="text-danger"
                      >
                        <PersonDash className="me-2" size={14} />
                        Remove from Department
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Remove Trainer Confirmation Modal */}
      <Modal show={showRemoveModal} onHide={handleRemoveCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <PersonDash className="me-2 text-danger" size={20} />
            Remove Trainer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to remove <strong>{trainerToRemove ? getFullName(trainerToRemove) : ''}</strong> from this department?
          </p>
          <p className="text-muted small mb-0">
            This action cannot be undone. The trainer will no longer be associated with this department.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRemoveCancel} disabled={removing}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRemoveConfirm}
            disabled={removing}
          >
            {removing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Removing...
              </>
            ) : (
              'Remove Trainer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignedTrainersTable;
