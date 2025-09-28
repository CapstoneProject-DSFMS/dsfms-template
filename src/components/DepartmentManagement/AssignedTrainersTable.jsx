import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { PersonCheck, PersonPlus } from 'react-bootstrap-icons';

const AssignedTrainersTable = ({ trainers = [], loading = false, showAddButton = false, onAddClick }) => {
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
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AssignedTrainersTable;
