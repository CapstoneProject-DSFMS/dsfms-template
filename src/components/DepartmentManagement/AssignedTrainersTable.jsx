import React, { useState } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import { PersonCheck, PersonPlus, ThreeDotsVertical, PersonDash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { departmentAPI } from '../../api/department';
import PermissionWrapper from '../Common/PermissionWrapper';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import '../../styles/scrollable-table.css';

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

      <div className="scrollable-table-container admin-table">
        <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
          <thead className="sticky-header">
            <tr>
              <th 
                className="fw-semibold show-mobile"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                EID
              </th>
              <th 
                className="fw-semibold show-mobile"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Full Name
              </th>
              <th 
                className="fw-semibold show-mobile"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Email
              </th>
              <th 
                className="fw-semibold hide-mobile"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Phone
              </th>
              <th 
                className="fw-semibold hide-mobile"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Address
              </th>
              <th 
                className="fw-semibold text-center show-mobile"
                width="80"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((trainer, index) => (
              <tr 
                key={trainer.id}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                style={{
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
                }}
              >
                <td className="border-neutral-200 align-middle show-mobile">
                  <span className="fw-semibold text-primary-custom">
                    {trainer.eid}
                  </span>
                </td>
                <td className="border-neutral-200 align-middle show-mobile">
                  <div className="fw-medium text-dark">
                    {getFullName(trainer)}
                  </div>
                </td>
                <td className="border-neutral-200 align-middle show-mobile">
                  <span className="text-dark">
                    {trainer.email}
                  </span>
                </td>
                <td className="border-neutral-200 align-middle hide-mobile">
                  {trainer.phoneNumber ? (
                    <span className="text-dark">{trainer.phoneNumber}</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="border-neutral-200 align-middle hide-mobile">
                  {trainer.address ? (
                    <span className="text-truncate text-dark" style={{ maxWidth: '200px' }} title={trainer.address}>
                      {trainer.address}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="border-neutral-200 align-middle text-center show-mobile">
                  <PermissionWrapper 
                    permission={PERMISSION_IDS.REMOVE_TRAINER_FROM_COURSE}
                    fallback={null}
                  >
                    <PortalUnifiedDropdown
                      align="end"
                      className="table-dropdown"
                      placement="bottom-end"
                      trigger={{
                        variant: 'link',
                        className: 'btn btn-link p-0 text-primary-custom',
                        style: { border: 'none', background: 'transparent' },
                        children: <ThreeDotsVertical size={16} />
                      }}
                      items={[
                        {
                          label: 'Remove from Department',
                          icon: <PersonDash />,
                          className: 'text-danger',
                          onClick: () => handleRemoveClick(trainer)
                        }
                      ]}
                    />
                  </PermissionWrapper>
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
