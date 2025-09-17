import React from 'react';

const SortIcon = ({ direction, size = 16 }) => {
  const baseStyle = {
    fontSize: `${size}px`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-block',
    lineHeight: 1,
    fontWeight: 'bold'
  };

  if (direction === 'asc') {
    return (
      <span 
        style={{
          ...baseStyle,
          color: 'var(--bs-primary)',
          textShadow: '0 0 8px rgba(0, 123, 255, 0.3)',
          transform: 'scale(1.1)'
        }}
        className="sort-icon"
      >
        ▲
      </span>
    );
  } else if (direction === 'desc') {
    return (
      <span 
        style={{
          ...baseStyle,
          color: 'var(--bs-primary)',
          textShadow: '0 0 8px rgba(0, 123, 255, 0.3)',
          transform: 'scale(1.1)'
        }}
        className="sort-icon"
      >
        ▼
      </span>
    );
  } else {
    return (
      <span style={baseStyle} className="text-muted sort-icon">
        <span style={{ 
          display: 'inline-block',
          transform: 'translateY(-1px)',
          opacity: 0.5,
          marginRight: '1px'
        }}>
          ▲
        </span>
        <span style={{ 
          display: 'inline-block',
          transform: 'translateY(1px)',
          opacity: 0.5
        }}>
          ▼
        </span>
      </span>
    );
  }
};

export default SortIcon;
