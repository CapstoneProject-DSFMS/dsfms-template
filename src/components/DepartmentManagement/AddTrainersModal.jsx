import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, Row, Col, Spinner } from 'react-bootstrap';
import { PersonPlus, X } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { departmentAPI } from '../../api';
import { userAPI } from '../../api/user';

const AddTrainersModal = ({ show, onHide, departmentId, assignedTrainers = [], onTrainersAdded }) => {
  const [availableTrainers, setAvailableTrainers] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load available trainers when modal opens
  useEffect(() => {
    if (show && departmentId) {
      loadAvailableTrainers();
    }
  }, [show, departmentId, assignedTrainers]);

  const loadAvailableTrainers = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const response = await userAPI.getUsers();
      const allUsers = response.data || [];
      
      // Filter users with TRAINER role
      const trainersData = allUsers.filter(user => 
        user.role && user.role.name === 'TRAINER'
      );
      
      // Transform data to match our table structure
      const transformedTrainers = trainersData.map(trainer => ({
        id: trainer.id,
        eid: trainer.eid,
        firstName: trainer.firstName,
        middleName: trainer.middleName,
        lastName: trainer.lastName,
        email: trainer.email,
        status: trainer.status,
        address: trainer.address,
        gender: trainer.gender,
        phoneNumber: trainer.phoneNumber
      }));
      
      // Filter out trainers that are already assigned to this department
      const assignedTrainerIds = assignedTrainers.map(trainer => trainer.id);
      const availableTrainers = transformedTrainers.filter(trainer => 
        !assignedTrainerIds.includes(trainer.id)
      );
      
      setAvailableTrainers(availableTrainers);
    } catch (error) {
      console.error('Error loading available trainers:', error);
      toast.error('Failed to load available trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainerSelect = (trainerId, isSelected) => {
    if (isSelected) {
      setSelectedTrainers(prev => [...prev, trainerId]);
    } else {
      setSelectedTrainers(prev => prev.filter(id => id !== trainerId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const filteredTrainers = getFilteredTrainers();
      setSelectedTrainers(filteredTrainers.map(trainer => trainer.id));
    } else {
      setSelectedTrainers([]);
    }
  };

  const getFilteredTrainers = () => {
    if (!searchTerm) return availableTrainers;
    
    const term = searchTerm.toLowerCase();
    return availableTrainers.filter(trainer => 
      trainer.eid?.toLowerCase().includes(term) ||
      trainer.firstName?.toLowerCase().includes(term) ||
      trainer.lastName?.toLowerCase().includes(term) ||
      trainer.email?.toLowerCase().includes(term)
    );
  };

  const getFullName = (trainer) => {
    const { firstName, middleName, lastName } = trainer;
    return [lastName, middleName, firstName].filter(Boolean).join(' ');
  };

  const handleSubmit = async () => {
    if (selectedTrainers.length === 0) {
      toast.warning('Please select at least one trainer');
      return;
    }

    setSubmitting(true);
    try {
      // Get trainer EIDs from selected trainer IDs
      const selectedTrainerEids = selectedTrainers.map(trainerId => {
        const trainer = availableTrainers.find(t => t.id === trainerId);
        return trainer ? trainer.eid : null;
      }).filter(eid => eid !== null);

      await departmentAPI.assignTrainersToDepartment(departmentId, selectedTrainerEids);
      toast.success(`Successfully assigned ${selectedTrainerEids.length} trainer(s) to department`);
      onTrainersAdded();
      handleClose();
    } catch (error) {
      console.error('Error assigning trainers:', error);
      toast.error('Failed to assign trainers');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTrainers([]);
    setSearchTerm('');
    onHide();
  };

  const filteredTrainers = getFilteredTrainers();
  const allSelected = filteredTrainers.length > 0 && 
    filteredTrainers.every(trainer => selectedTrainers.includes(trainer.id));

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header className="border-0 pb-0 d-flex align-items-center justify-content-between" style={{ 
        background: 'linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-secondary) 100%)' 
      }}>
        <div></div>
        <Modal.Title className="d-flex align-items-center text-white">
          <PersonPlus className="me-2" size={20} />
          Add Trainers to Department
        </Modal.Title>
        <Button
          variant="link"
          onClick={handleClose}
          className="p-0"
          style={{ 
            fontSize: '1.5rem', 
            lineHeight: 1,
            color: 'white',
            filter: 'brightness(1.2)'
          }}
        >
          <X />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="pt-0">
        <div className="mb-4">
          <p className="text-muted mb-3" style={{ padding: '20px 24px' }}>
            Select trainers to assign to this department.
          </p>
          
          <Row className="align-items-center">
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Search by EID, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={4} className="text-end">
              <span className="text-muted">
                {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''} found
              </span>
            </Col>
          </Row>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading available trainers...</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '400px' }}>
            <Table hover className="mb-0">
              <thead className="table-light sticky-top">
                <tr>
                  <th style={{ width: '50px', padding: '16px 12px' }}>
                    <Form.Check
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th style={{ padding: '16px 12px' }}>EID</th>
                  <th style={{ padding: '16px 12px' }}>Full Name</th>
                  <th style={{ padding: '16px 12px' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainers.map((trainer) => (
                  <tr key={trainer.id}>
                    <td style={{ padding: '16px 12px' }}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedTrainers.includes(trainer.id)}
                        onChange={(e) => handleTrainerSelect(trainer.id, e.target.checked)}
                      />
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <code className="text-primary">{trainer.eid}</code>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span>{getFullName(trainer)}</span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>{trainer.email}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {filteredTrainers.length === 0 && !loading && (
          <div className="text-center py-4">
            <PersonPlus size={48} className="text-muted mb-3" />
            <h5 className="text-muted">No trainers available</h5>
            <p className="text-muted">
              {searchTerm ? 'No trainers match your search criteria.' : 'All trainers are already assigned to departments.'}
            </p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={selectedTrainers.length === 0 || submitting}
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="me-2" />
              Assigning...
            </>
          ) : (
            `Assign ${selectedTrainers.length} Trainer${selectedTrainers.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddTrainersModal;
