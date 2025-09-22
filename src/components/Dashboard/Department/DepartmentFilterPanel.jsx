import React from 'react';
import { Dropdown, Form, Button } from 'react-bootstrap';
import { Funnel, X } from 'react-bootstrap-icons';

const DepartmentFilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  className = ""
}) => {
  const departmentTypes = [
    { value: '', label: 'All Types' },
    { value: 'CCT', label: 'CCT - Cabin Crew Training' },
    { value: 'FCTD', label: 'FCTD - Flight Crew Training Department' },
    { value: 'GOT', label: 'GOT - Ground Operations Training' },
    { value: 'SQA', label: 'SQA - Safety & Quality Assurance' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  const hasActiveFilters = filters.type !== '' || filters.status !== '';

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
              {(filters.type ? 1 : 0) + (filters.status ? 1 : 0)}
            </span>
          )}
        </div>
        <div className="position-absolute end-0 me-3">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L2 4h8L6 8z"/>
          </svg>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="p-3" style={{ minWidth: '300px', zIndex: 1050 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-semibold">Filters</h6>
          {hasActiveFilters && (
            <Button
              variant="link"
              size="sm"
              onClick={onClearFilters}
              className="p-0 text-decoration-none"
            >
              <X size={14} className="me-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="mb-3">
          <Form.Label className="fw-semibold small mb-2">Department Type</Form.Label>
          <Form.Select
            size="sm"
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
          >
            {departmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className="mb-3">
          <Form.Label className="fw-semibold small mb-2">Status</Form.Label>
          <Form.Select
            size="sm"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Form.Select>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DepartmentFilterPanel;