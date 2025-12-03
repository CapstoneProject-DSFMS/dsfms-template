import React from 'react';
import { Dropdown, Form, Button } from 'react-bootstrap';
import { Funnel, X } from 'react-bootstrap-icons';

const TrainerFilterPanel = ({ 
  uniqueStatuses, 
  selectedStatuses, 
  onStatusToggle, 
  onClearFilters,
  className = ""
}) => {
  const hasActiveFilters = selectedStatuses.length > 0;

  return (
    <Dropdown className={`filter-panel-dropdown ${className}`}>
      <Dropdown.Toggle 
        variant="outline-secondary" 
        className="w-100 d-flex align-items-center justify-content-between position-relative"
      >
        <div className="d-flex align-items-center">
          <Funnel size={14} className="me-2" />
          Filters
          {hasActiveFilters && (
            <span className="badge bg-primary ms-2">
              {selectedStatuses.length}
            </span>
          )}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="course-filter-menu" 
        style={{ 
          width: '100%',
          maxWidth: '90vw',
          maxHeight: window.innerWidth <= 768 ? '50vh' : '70vh',
          overflowY: 'auto',
          marginTop: '-1px',
          top: '100%',
          left: 0,
          transform: 'none',
          position: 'absolute',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0
        }}
        align="start"
        flip={true}
        popperConfig={{
          modifiers: [
            {
              name: 'offset',
              options: { offset: [0, 0] }
            },
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
                padding: 16,
              },
            },
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['top-start', 'bottom-start', 'top-end'],
              },
            },
          ],
        }}
      >
        {/* Status Filters */}
        <div className="mb-3" style={{ paddingLeft: '1.5rem', paddingTop: '1rem', paddingBottom: '1rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-semibold mb-0">Status</label>
            {selectedStatuses.length > 0 && (
              <Button
                variant="link"
                size="sm"
                className="p-0 text-danger"
                onClick={() => onStatusToggle('clear')}
              >
                <X size={12} />
              </Button>
            )}
          </div>
          <div className="max-height-150 overflow-auto">
            {uniqueStatuses.map(status => (
              <Form.Check
                key={status}
                type="checkbox"
                id={`status-${status}`}
                label={status}
                checked={selectedStatuses.includes(status)}
                onChange={() => onStatusToggle(status)}
                className="mb-1"
              />
            ))}
          </div>
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <div className="border-top pt-3" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <Button
              variant="outline-danger"
              size="sm"
              className="w-100"
              onClick={onClearFilters}
            >
              <X className="me-1" size={12} />
              Clear All Filters
            </Button>
          </div>
        )}

      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TrainerFilterPanel;
