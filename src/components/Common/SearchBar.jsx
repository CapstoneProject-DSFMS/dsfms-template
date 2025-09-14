import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';

const SearchBar = ({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  className = "",
  size = "md"
}) => {
  return (
    <InputGroup className={className} size={size}>
      <InputGroup.Text className="bg-white border-end-0">
        <Search className="text-primary-custom" />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-start-0"
        style={{
          borderColor: 'var(--bs-neutral)',
          boxShadow: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--bs-primary)';
          e.target.style.boxShadow = '0 0 0 0.25rem rgba(27, 60, 83, 0.25)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--bs-neutral)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </InputGroup>
  );
};

export default SearchBar;
