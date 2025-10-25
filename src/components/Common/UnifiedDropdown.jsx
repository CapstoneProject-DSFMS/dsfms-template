import React, { useState, useRef, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';

const UnifiedDropdown = ({
  trigger,
  items = [],
  align = 'end',
  className = '',
  onItemClick,
  ...props
}) => {
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  const handleToggle = (nextShow) => {
    setShow(nextShow);
  };

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
    setShow(false);
  };

  return (
    <div ref={dropdownRef} className={className}>
      <Dropdown 
        align={align} 
        show={show}
        onToggle={handleToggle}
        {...props}
      >
        <Dropdown.Toggle
          as="button"
          variant={trigger?.variant || 'link'}
          className={trigger?.className || ''}
          style={trigger?.style || {}}
        >
          {trigger?.children}
        </Dropdown.Toggle>

        <Dropdown.Menu className="border-0 shadow">
          {items.map((item, index) => {
            if (item.type === 'header') {
              return (
                <Dropdown.Header key={index} className={item.className || ''}>
                  {item.content}
                </Dropdown.Header>
              );
            }
            
            if (item.type === 'divider') {
              return <Dropdown.Divider key={index} />;
            }

            return (
              <Dropdown.Item
                key={index}
                onClick={() => handleItemClick(item)}
                className={item.className || ''}
                disabled={item.disabled}
              >
                {item.icon && <span className="me-2">{item.icon}</span>}
                {item.label}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default UnifiedDropdown;
