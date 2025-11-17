import React from 'react';

const SortIcon = ({ direction, size = 16, color }) => {
  const iconColor = color || 'var(--bs-primary)';
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
          color: iconColor,
          textShadow: color === 'white' ? 'none' : '0 0 8px rgba(0, 123, 255, 0.3)',
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
          color: iconColor,
          textShadow: color === 'white' ? 'none' : '0 0 8px rgba(0, 123, 255, 0.3)',
          transform: 'scale(1.1)'
        }}
        className="sort-icon"
      >
        ▼
      </span>
    );
  } else {
    return (
      <span 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1px',
          lineHeight: 1,
          verticalAlign: 'middle'
        }}
        className={color ? '' : 'text-muted sort-icon'}
      >
        <span style={{ 
          display: 'inline-block',
          fontSize: `${size}px`,
          color: color || undefined,
          opacity: color ? 0.8 : 0.5,
          lineHeight: 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontWeight: 'bold'
        }}>
          ▲
        </span>
        <span style={{ 
          display: 'inline-block',
          fontSize: `${size}px`,
          color: color || undefined,
          opacity: color ? 0.8 : 0.5,
          lineHeight: 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontWeight: 'bold'
        }}>
          ▼
        </span>
      </span>
    );
  }
};

export default SortIcon;
