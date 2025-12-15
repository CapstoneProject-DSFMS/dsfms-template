import React from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { Funnel } from 'react-bootstrap-icons';

const FilterPanel = ({ 
  uniqueRoles, 
  uniqueDepartments, 
  selectedRoles, 
  selectedDepartments, 
  onRoleToggle, 
  onDepartmentToggle, 
  onClearFilters,
  className = ""
}) => {
  const hasActiveFilters = selectedRoles.length > 0 || selectedDepartments.length > 0;

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
              {selectedRoles.length + selectedDepartments.length}
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
          marginTop: '0px',
          top: '100%',
          transform: 'none',
          position: 'absolute'
        }}
        align="end"
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
                fallbackPlacements: ['top-end', 'bottom-end', 'top-start'],
              },
            },
          ],
        }}
      >
        {/* Role Filters */}
        <div className="mb-4" style={{ paddingLeft: '1.5rem', paddingTop: '1rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-semibold mb-0">Roles</label>
          </div>
          <div className="max-height-150 overflow-auto">
            {uniqueRoles.map(role => (
              <Form.Check
                key={role}
                type="checkbox"
                id={`role-${role}`}
                label={role}
                checked={selectedRoles.includes(role)}
                onChange={() => onRoleToggle(role)}
                className="mb-1"
              />
            ))}
          </div>
        </div>

        {/* Department Filters */}
        <div className="mb-3" style={{ paddingLeft: '1.5rem', paddingBottom: '1rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-semibold mb-0">Departments</label>
          </div>
          <div className="max-height-150 overflow-auto">
            {uniqueDepartments.map(dept => (
              <Form.Check
                key={dept}
                type="checkbox"
                id={`dept-${dept}`}
                label={dept}
                checked={selectedDepartments.includes(dept)}
                onChange={() => onDepartmentToggle(dept)}
                className="mb-1"
              />
            ))}
          </div>
        </div>

      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterPanel;
