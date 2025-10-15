import React from 'react';
import { Dropdown, Form, Button } from 'react-bootstrap';
import { Funnel, X } from 'react-bootstrap-icons';

const CourseFilterPanel = ({ 
  uniqueLevels, 
  uniqueStatuses, 
  selectedLevels, 
  selectedStatuses, 
  onLevelToggle, 
  onStatusToggle, 
  onClearFilters,
  className = ""
}) => {
  const hasActiveFilters = selectedLevels.length > 0 || selectedStatuses.length > 0;

  return (
    <Dropdown className={`filter-panel-dropdown course-filter-dropdown ${className}`}>
      <Dropdown.Toggle 
        variant="outline-secondary" 
        className="w-100 d-flex align-items-center justify-content-between position-relative"
      >
        <div className="d-flex align-items-center">
          <Funnel size={14} className="me-2" />
          Filters
          {hasActiveFilters && (
            <span className="badge bg-primary ms-2">
              {selectedLevels.length + selectedStatuses.length}
            </span>
          )}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="course-filter-menu" 
        style={{ 
          width: window.innerWidth <= 768 ? 'calc(100vw - 2rem)' : '320px',
          maxWidth: '90vw',
          maxHeight: window.innerWidth <= 768 ? '50vh' : '70vh',
          overflowY: 'auto',
          marginTop: '0px !important',
          top: '100% !important',
          transform: 'none !important',
          position: 'absolute !important',
          left: 'auto !important',
          right: '0 !important'
        }}
        align="end"
        flip={true}
        popperConfig={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 0]
              }
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
                fallbackPlacements: ['top-end', 'bottom-end', 'top-start'],
              },
            },
          ],
        }}
      >
        {/* Level Filters */}
        <div className="mb-4" style={{ paddingLeft: '1.5rem', paddingTop: '1rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-semibold mb-0">Levels</label>
            {selectedLevels.length > 0 && (
              <Button
                variant="link"
                size="sm"
                className="p-0 text-danger"
                onClick={() => onLevelToggle('clear')}
              >
                <X size={12} />
              </Button>
            )}
          </div>
          <div className="max-height-150 overflow-auto">
            {uniqueLevels.map(level => (
              <Form.Check
                key={level}
                type="checkbox"
                id={`level-${level}`}
                label={level}
                checked={selectedLevels.includes(level)}
                onChange={() => onLevelToggle(level)}
                className="mb-1"
              />
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-3" style={{ paddingLeft: '1.5rem', paddingBottom: '1rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-semibold mb-0">Statuses</label>
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

// Add CSS to override dropdown-unified.css
const style = document.createElement('style');
style.textContent = `
  .course-filter-dropdown .course-filter-menu {
    margin-top: 0px !important;
    top: 100% !important;
    transform: none !important;
    position: absolute !important;
  }
`;
document.head.appendChild(style);

export default CourseFilterPanel;
