import React, { useRef, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

/**
 * Custom Select component that ensures dropdown always opens downward
 * Uses native select element with custom styling and scroll behavior
 */
const DownwardSelect = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  isInvalid = false,
  className = '',
  style = {},
  ...props
}) => {
  const selectRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Handle click to ensure dropdown opens downward
  const handleClick = (e) => {
    if (disabled) return;
    
    // Calculate position to ensure dropdown opens downward
    const element = e.target;
    const elementRect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Place element at 15% from top of viewport to have 85% space below
    const targetTop = viewportHeight * 0.15;
    const currentTop = elementRect.top;
    const scrollOffset = currentTop - targetTop;
    
    // Only scroll if element is too low (below 15% of viewport)
    if (scrollOffset > 0) {
      // Scroll instantly BEFORE dropdown opens
      window.scrollTo({
        top: window.scrollY + scrollOffset,
        behavior: 'instant'
      });
    }
    
    setIsOpen(true);
  };

  // Handle focus to ensure dropdown opens downward
  const handleFocus = (e) => {
    if (disabled) return;
    
    // Small delay to ensure scroll happens before native dropdown opens
    setTimeout(() => {
      const element = e.target;
      const elementRect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const targetTop = viewportHeight * 0.15;
      const currentTop = elementRect.top;
      const scrollOffset = currentTop - targetTop;
      
      if (scrollOffset > 0) {
        window.scrollTo({
          top: window.scrollY + scrollOffset,
          behavior: 'instant'
        });
      }
    }, 10);
  };

  // Handle change
  const handleChange = (e) => {
    setIsOpen(false);
    if (onChange) {
      onChange(e);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsOpen(false);
  };

  return (
    <Form.Select
      ref={selectRef}
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onClick={handleClick}
      onFocus={handleFocus}
      disabled={disabled}
      isInvalid={isInvalid}
      className={className}
      style={{
        position: 'relative',
        zIndex: 1001,
        ...style
      }}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => {
        // Handle both object and string options
        if (typeof option === 'object') {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        }
        return (
          <option key={option} value={option}>
            {option}
          </option>
        );
      })}
    </Form.Select>
  );
};

export default DownwardSelect;

