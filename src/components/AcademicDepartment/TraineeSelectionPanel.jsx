import React, { useState } from 'react';
import { Card, Form, Button, Badge, Dropdown } from 'react-bootstrap';
import { Search, Plus, X, ChevronDown, People } from 'react-bootstrap-icons';

const mockAllTrainees = [
  { id: 't1', eid: 'EMP001', name: 'John Doe' },
  { id: 't2', eid: 'EMP002', name: 'Jane Smith' },
  { id: 't3', eid: 'EMP003', name: 'Bob Johnson' },
  { id: 't4', eid: 'EMP004', name: 'Alice Brown' },
  { id: 't5', eid: 'EMP005', name: 'Charlie Wilson' },
  { id: 't6', eid: 'EMP006', name: 'Diana Lee' },
  { id: 't7', eid: 'EMP007', name: 'Eve Davis' },
  { id: 't8', eid: 'EMP008', name: 'Frank Miller' }
];

const TraineeSelectionPanel = ({ selectedTrainees, onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableDropdown, setShowAvailableDropdown] = useState(false);
  

  const filteredTrainees = mockAllTrainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainee.eid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTrainee = (trainee) => {
    if (!selectedTrainees.find(t => t.id === trainee.id)) {
      onSelectionChange([...selectedTrainees, trainee]);
    }
  };

  const handleRemoveTrainee = (traineeId) => {
    onSelectionChange(selectedTrainees.filter(t => t.id !== traineeId));
  };

  

  return (
    <Card className="d-flex flex-column">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Add Trainees</h6>
        </div>
      </Card.Header>
      <Card.Body className="p-0 d-flex flex-column" style={{ height: '500px' }}>

        {/* Available Trainees - Top Section */}
        <div>
          {/* Search Bar */}
          <div className="p-2 border-bottom">
            <Form.Control
              type="text"
              placeholder="Search by EID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
            />
          </div>

          {/* Show All Button */}
          <div className="p-2">
            <Button 
              variant="outline-primary" 
              className="w-100 d-flex align-items-center justify-content-between"
              size="sm"
              onClick={() => setShowAvailableDropdown(!showAvailableDropdown)}
            >
              <span>
                <People className="me-2" size={16} />
                Show All Available Trainees ({mockAllTrainees.length})
              </span>
              <ChevronDown size={16} />
            </Button>
          </div>

          {/* Dropdown List */}
          {showAvailableDropdown && (
            <div className="border-top" style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {filteredTrainees.length === 0 ? (
                <div className="p-3 text-center text-muted">
                  <p className="mb-0">No trainees found</p>
                </div>
              ) : (
                filteredTrainees.map(trainee => (
                  <div 
                    key={trainee.id}
                    className="p-2 border-bottom d-flex align-items-center justify-content-between hover-bg-light"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleAddTrainee(trainee)}
                  >
                    <div>
                      <div className="fw-semibold">{trainee.name}</div>
                      <small className="text-muted">{trainee.eid}</small>
                    </div>
                    <Plus size={14} className="text-primary" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Trainees - Main Focus at Bottom */}
        <div className="border-top flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
          <div className="p-2 bg-light border-bottom">
            <small className="text-muted fw-semibold">Selected Trainees ({selectedTrainees.length})</small>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {selectedTrainees.length === 0 ? (
              <div className="p-3 text-center text-muted">
                <p className="mb-0">No trainees selected</p>
              </div>
            ) : (
              selectedTrainees.map(trainee => (
                <div 
                  key={trainee.id}
                  className="p-2 border-bottom d-flex align-items-center justify-content-between"
                >
                  <div>
                    <div className="fw-semibold">{trainee.name}</div>
                    <small className="text-muted">{trainee.eid}</small>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline-danger"
                    onClick={() => handleRemoveTrainee(trainee.id)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TraineeSelectionPanel;
