import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { Search, Plus, X, ChevronDown, People } from 'react-bootstrap-icons';
import traineeAPI from '../../api/trainee';

const TraineeSelectionPanel = ({ selectedTrainees, onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableDropdown, setShowAvailableDropdown] = useState(false);
  const [allTrainees, setAllTrainees] = useState([]);
  const [loadingTrainees, setLoadingTrainees] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Load trainees from API
  useEffect(() => {
    loadTrainees();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAvailableDropdown(false);
      }
    };

    if (showAvailableDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAvailableDropdown]);

  const loadTrainees = async () => {
    setLoadingTrainees(true);
    setError(null);
    try {
      
      const response = await traineeAPI.getTraineesForEnrollment();
      
      
      if (response && response.data) {
        // Transform API data to match component format
        const transformedTrainees = response.data.map(trainee => ({
          id: trainee.id,
          eid: trainee.eid,
          name: `${trainee.firstName} ${trainee.lastName}`.trim(),
          firstName: trainee.firstName,
          lastName: trainee.lastName,
          email: trainee.email,
          status: trainee.status
        }));
        
        setAllTrainees(transformedTrainees);
      } else {
        setAllTrainees([]);
      }
    } catch {
      setError('Failed to load trainees');
      setAllTrainees([]);
    } finally {
      setLoadingTrainees(false);
    }
  };

  const filteredTrainees = allTrainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainee.eid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-open dropdown when search term is entered
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setShowAvailableDropdown(true);
    }
  }, [searchTerm]);

  const handleAddTrainee = (trainee) => {
    if (!selectedTrainees.find(t => t.id === trainee.id)) {
      onSelectionChange([...selectedTrainees, trainee]);
      // Optionally close dropdown after adding
      // setShowAvailableDropdown(false);
    }
  };

  const handleRemoveTrainee = (traineeId) => {
    onSelectionChange(selectedTrainees.filter(t => t.id !== traineeId));
  };

  

  return (
    <Card className="d-flex flex-column h-100" style={{ border: '1px solid #e9ecef', boxShadow: '0 4px 8px rgba(0,0,0,0.15)', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <Card.Header className="bg-gradient-primary-custom text-white border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 text-white">Add Trainees</h6>
        </div>
      </Card.Header>
      <Card.Body className="p-0 d-flex flex-column" style={{ height: '500px' }}>

        {/* Available Trainees - Top Section */}
        <div className="flex-shrink-0" style={{ position: 'relative', paddingBottom: '1rem' }} ref={dropdownRef}>
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
              disabled={loadingTrainees}
            >
              <span>
                <People className="me-2" size={16} />
                {loadingTrainees ? 'Loading...' : searchTerm.trim().length > 0 
                  ? `Available Trainees (${filteredTrainees.length})`
                  : `Show All Available Trainees (${allTrainees.length})`
                }
              </span>
              <ChevronDown size={16} />
            </Button>
          </div>

          {/* Dropdown List */}
          {showAvailableDropdown && (
            <div 
              className="border bg-white" 
              style={{ 
                position: 'absolute',
                top: 'calc(100% + 8px)', // Add gap between input and dropdown
                left: 0,
                right: 0,
                zIndex: 1050,
                maxHeight: '350px', // Increased height
                overflowY: 'auto',
                borderRadius: '8px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)' // Enhanced shadow for floating effect
              }}
            >
              {loadingTrainees ? (
                <div className="p-3 text-center">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span className="text-muted">Loading trainees...</span>
                </div>
              ) : error ? (
                <div className="p-3 text-center text-danger">
                  <p className="mb-0">{error}</p>
                  <Button size="sm" variant="outline-danger" onClick={loadTrainees} className="mt-2">
                    Retry
                  </Button>
                </div>
              ) : filteredTrainees.length === 0 ? (
                <div className="p-3 text-center text-muted">
                  <p className="mb-0">No trainees found</p>
                </div>
              ) : (
                filteredTrainees.map(trainee => (
                  <div 
                    key={trainee.id}
                    className="p-2 border-bottom d-flex align-items-center justify-content-between hover-bg-light"
                    style={{ cursor: 'pointer', minWidth: 0 }}
                    onClick={() => handleAddTrainee(trainee)}
                  >
                    <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                      <div className="fw-semibold text-truncate" title={trainee.name}>{trainee.name}</div>
                      <small className="text-muted text-truncate d-block" title={trainee.eid}>{trainee.eid}</small>
                    </div>
                    <Plus size={14} className="text-primary flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Trainees - Main Focus at Bottom */}
        <div className="border-top flex-grow-1 d-flex flex-column" style={{ minHeight: 0, marginTop: '1rem' }}>
          <div className="p-2 bg-gradient-primary-custom text-white border-bottom">
            <small className="text-white fw-semibold">Selected Trainees ({selectedTrainees.length})</small>
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
                  style={{ minWidth: 0 }}
                >
                  <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                    <div className="fw-semibold text-truncate" title={trainee.name}>{trainee.name}</div>
                    <small className="text-muted text-truncate d-block" title={trainee.eid}>{trainee.eid}</small>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline-danger"
                    className="flex-shrink-0"
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
