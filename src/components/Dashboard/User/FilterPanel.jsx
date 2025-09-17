import React from 'react';
import { Dropdown, Form, Button } from 'react-bootstrap';
import { Funnel, X } from 'react-bootstrap-icons';

const FilterPanel = ({ 
  uniqueRoles, 
  uniqueDepartments, 
  selectedRoles, 
  selectedDepartments, 
  onRoleToggle, 
  onDepartmentToggle, 
  onClearFilters 
}) => {
  const hasActiveFilters = selectedRoles.length > 0 || selectedDepartments.length > 0;

  return (
    <Dropdown className="filter-panel-dropdown">
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
        className="p-3" 
        style={{ 
          width: '320px',
          maxWidth: '90vw',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
        align="end"
        flip={true}
        popperConfig={{
          modifiers: [
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
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-semibold mb-0">Roles</label>
            {selectedRoles.length > 0 && (
              <Button
                variant="link"
                size="sm"
                className="p-0 text-danger"
                onClick={() => onRoleToggle('clear')}
              >
                <X size={12} />
              </Button>
            )}
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
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-semibold mb-0">Departments</label>
            {selectedDepartments.length > 0 && (
              <Button
                variant="link"
                size="sm"
                className="p-0 text-danger"
                onClick={() => onDepartmentToggle('clear')}
              >
                <X size={12} />
              </Button>
            )}
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

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <div className="border-top pt-3">
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

export default FilterPanel;
