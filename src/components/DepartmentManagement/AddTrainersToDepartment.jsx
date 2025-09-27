import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';

const AddTrainersToDepartment = ({ department }) => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // This would typically fetch available trainers from an API
    // For now, using mock data
    const mockTrainers = [
      { id: '1', name: 'John Smith', email: 'john.smith@academy.com', role: 'TRAINER' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@academy.com', role: 'TRAINER' },
      { id: '3', name: 'Michael Brown', email: 'michael.brown@academy.com', role: 'TRAINER' },
      { id: '4', name: 'Emily Davis', email: 'emily.davis@academy.com', role: 'TRAINER' },
    ];
    setTrainers(mockTrainers);
  }, []);

  const handleTrainerToggle = (trainerId) => {
    setSelectedTrainers(prev => 
      prev.includes(trainerId)
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    );
  };

  const handleAssignTrainers = async () => {
    if (selectedTrainers.length === 0) {
      setError('Please select at least one trainer');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // This would typically call an API to assign trainers to department
      console.log('Assigning trainers:', selectedTrainers, 'to department:', department.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setSelectedTrainers([]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error assigning trainers:', err);
      setError('Failed to assign trainers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="mb-4">Add Trainers to Department</h4>
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-3">
          Trainers assigned successfully!
        </Alert>
      )}

      <div className="mb-4">
        <p className="text-muted">
          Select trainers to assign to <strong>{department.name}</strong>
        </p>
      </div>

      <div className="mb-4">
        <h6>Available Trainers</h6>
        <div className="row">
          {trainers.map(trainer => (
            <div key={trainer.id} className="col-md-6 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`trainer-${trainer.id}`}
                  checked={selectedTrainers.includes(trainer.id)}
                  onChange={() => handleTrainerToggle(trainer.id)}
                />
                <label className="form-check-label" htmlFor={`trainer-${trainer.id}`}>
                  <div>
                    <strong>{trainer.name}</strong>
                    <br />
                    <small className="text-muted">{trainer.email}</small>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex gap-2">
        <Button 
          variant="primary"
          onClick={handleAssignTrainers}
          disabled={loading || selectedTrainers.length === 0}
        >
          {loading ? 'Assigning...' : `Assign ${selectedTrainers.length} Trainer${selectedTrainers.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
};

export default AddTrainersToDepartment;
