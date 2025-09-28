import React, { useState, useEffect, useCallback } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { userAPI } from '../../api/user';
import { departmentAPI } from '../../api/department';
import SearchBar from '../Common/SearchBar';
import TrainerTable from './TrainerTable';

const AddTrainersToDepartment = ({ department }) => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTrainers = async () => {
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
        fullName: `${trainer.firstName} ${trainer.lastName}`,
        email: trainer.email,
        status: trainer.status
      }));
      
      setTrainers(transformedTrainers);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const filterTrainers = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredTrainers(trainers);
      return;
    }

    const filtered = trainers.filter(trainer => 
      trainer.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredTrainers(filtered);
  }, [trainers, searchTerm]);

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [filterTrainers]);

  const handleTrainerSelect = (trainerId) => {
    setSelectedTrainers(prev => 
      prev.includes(trainerId)
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    );
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allTrainerIds = filteredTrainers.map(trainer => trainer.id);
      setSelectedTrainers(allTrainerIds);
    } else {
      setSelectedTrainers([]);
    }
  };

  const handleAssignTrainers = async () => {
    if (selectedTrainers.length === 0) {
      toast.error('Please select at least one trainer');
      return;
    }

    setLoading(true);

    try {
      // Get trainer EIDs from selected trainer IDs
      const selectedTrainerEids = selectedTrainers.map(trainerId => {
        const trainer = trainers.find(t => t.id === trainerId);
        return trainer ? trainer.eid : null;
      }).filter(eid => eid !== null);

      await departmentAPI.assignTrainersToDepartment(department.id, selectedTrainerEids);
      
      toast.success(`${selectedTrainerEids.length} trainer(s) assigned successfully!`);
      setSelectedTrainers([]);
      
      // Optionally refresh the trainers list to show updated data
      // fetchTrainers();
    } catch (err) {
      console.error('Error assigning trainers:', err);
      toast.error('Failed to assign trainers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="mb-4">Add Trainers to Department</h4>

      <div className="mb-4">
        <p className="text-muted">
          Select trainers to assign to <strong>{department.name}</strong>
        </p>
      </div>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={6}>
          <SearchBar
            placeholder="Search by EID, name, or email..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </Col>
        <Col md={6} className="d-flex align-items-center justify-content-end">
          <small className="text-muted">
            {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''} found
            {selectedTrainers.length > 0 && (
              <span className="ms-2 text-primary">
                • {selectedTrainers.length} selected
              </span>
            )}
          </small>
        </Col>
      </Row>

      {/* Trainers Table */}
      <div className="mb-4">
        <TrainerTable
          trainers={filteredTrainers}
          loading={loading}
          selectedTrainers={selectedTrainers}
          onTrainerSelect={handleTrainerSelect}
          onSelectAll={handleSelectAll}
          searchTerm={searchTerm}
        />
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        <Button 
          variant="primary"
          onClick={handleAssignTrainers}
          disabled={loading || selectedTrainers.length === 0}
        >
          {loading ? 'Assigning...' : `Assign ${selectedTrainers.length} Trainer${selectedTrainers.length !== 1 ? 's' : ''}`}
        </Button>
        {selectedTrainers.length > 0 && (
          <Button 
            variant="outline-secondary"
            onClick={() => setSelectedTrainers([])}
          >
            Clear Selection
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddTrainersToDepartment;
