import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { Search, Plus, X, ChevronDown, People, CheckCircle } from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import traineeAPI from '../../api/trainee';
import './TraineeSelectionPanel.css';  // ← ADD CUSTOM CSS

const TraineeSelectionPanel = ({ selectedTrainees, onSelectionChange, subjects = [], availableTrainees = [], loadingTrainees = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableDropdown, setShowAvailableDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [justAddedTraineeId, setJustAddedTraineeId] = useState(null);
  const dropdownRef = useRef(null);

  // Remove the useEffect that loads trainees from API
  // Parent component (EnrollTraineesPage) handles API calls via handleSubjectToggle
  // We only display trainees passed from parent via availableTrainees prop

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

  // Transform availableTrainees from parent into the format we need
  const allTrainees = Array.isArray(availableTrainees) 
    ? availableTrainees.map(trainee => {
        const nameParts = [
          trainee.lastName,
          trainee.middleName,
          trainee.firstName
        ].filter(Boolean);
        
        const name = nameParts.length > 0 
          ? nameParts.join(' ').trim()
          : trainee.eid;
        
        return {
          id: trainee.id,
          eid: trainee.eid,
          name: name,
          firstName: trainee.firstName || '',
          lastName: trainee.lastName || '',
          email: trainee.email,
          status: trainee.status || 'ACTIVE',
          departmentId: trainee.departmentId,
          departmentName: trainee.department?.name || ''
        };
      })
    : [];

  const loadTrainees = async () => {
    // NO LONGER USED - API calls handled by parent component
    // Parent passes availableTrainees via props
    console.warn('loadTrainees called but should not be - parent handles API calls');
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
      
      // Animation feedback: highlight the newly added trainee
      setJustAddedTraineeId(trainee.id);
      setTimeout(() => {
        setJustAddedTraineeId(null);
      }, 2000); // Remove highlight after 2 seconds
    }
  };

  const handleRemoveTrainee = (traineeId) => {
    onSelectionChange(selectedTrainees.filter(t => t.id !== traineeId));
  };

  

  return (
    <Card className="trainee-selection-card">
      <Card.Header className="bg-gradient-primary-custom text-white border-0 trainee-card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 text-white">Add Trainees</h6>
        </div>
      </Card.Header>
      <Card.Body className="trainee-card-body p-0">

        {/* Available Trainees - Top Section */}
        <div className="trainee-available-section" ref={dropdownRef}>
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
                filteredTrainees.map(trainee => {
                  const isSelected = selectedTrainees.find(t => t.id === trainee.id);
                  return (
                    <div 
                      key={trainee.id}
                      className={`p-2 border-bottom d-flex align-items-center justify-content-between ${isSelected ? 'bg-success bg-opacity-10' : 'hover-bg-light'}`}
                      style={{ 
                        cursor: isSelected ? 'not-allowed' : 'pointer', 
                        minWidth: 0,
                        transition: 'all 0.3s ease',
                        opacity: isSelected ? 0.6 : 1
                      }}
                      onClick={() => {
                        if (!isSelected) {
                          // Permission check is handled at parent level
                          handleAddTrainee(trainee);
                        }
                      }}
                    >
                      <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                        <div className="fw-semibold text-truncate" title={trainee.name}>{trainee.name}</div>
                        <small className="text-muted text-truncate d-block" title={trainee.eid}>{trainee.eid}</small>
                      </div>
                      {isSelected ? (
                        <CheckCircle size={16} className="text-success flex-shrink-0" />
                      ) : (
                        <Plus size={14} className="text-primary flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Selected Trainees - Main Focus at Bottom */}
        <div className="trainee-selected-section">
          <div className="trainee-selected-header">
            <small className="text-white fw-semibold">Selected Trainees ({selectedTrainees.length})</small>
          </div>
          <div className="trainee-selected-list">
            {selectedTrainees.length === 0 ? (
              <div className="p-3 text-center text-muted">
                <p className="mb-0">No trainees selected</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {selectedTrainees.map(trainee => {
                const isJustAdded = justAddedTraineeId === trainee.id;
                return (
                  <div 
                    key={trainee.id}
                    className="p-2 border-bottom d-flex align-items-center justify-content-between"
                    style={{ 
                      minWidth: 0,
                      backgroundColor: isJustAdded ? 'rgba(40, 167, 69, 0.1)' : 'transparent',
                      animation: isJustAdded ? 'slideInRight 0.5s ease-out, highlightPulse 0.5s ease-out' : 'none',
                      transition: 'background-color 0.3s ease',
                      flexShrink: 0
                    }}
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
                );
              })}
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TraineeSelectionPanel;
