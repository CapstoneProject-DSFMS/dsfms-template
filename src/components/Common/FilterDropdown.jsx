import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { Funnel } from 'react-bootstrap-icons';

const FilterDropdown = ({ 
  title = "Filter", 
  options = [], 
  selectedValue, 
  onSelect, 
  className = "",
  variant = "outline-secondary"
}) => {
  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <Dropdown className={className}>
      <Dropdown.Toggle
        variant={variant}
        className="d-flex align-items-center"
        style={{
          borderColor: 'var(--bs-neutral)',
          color: selectedValue ? 'var(--bs-primary)' : 'var(--bs-secondary)'
        }}
      >
        <Funnel className="me-2" size={16} />
        {selectedOption ? selectedOption.label : title}
      </Dropdown.Toggle>

      <Dropdown.Menu className="border-0 shadow">
        <Dropdown.Item
          onClick={() => onSelect('')}
          className={!selectedValue ? 'text-primary-custom bg-light' : ''}
        >
          All {title}s
        </Dropdown.Item>
        <Dropdown.Divider />
        {options.map((option) => (
          <Dropdown.Item
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={selectedValue === option.value ? 'text-primary-custom bg-light' : ''}
          >
            {option.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterDropdown;
