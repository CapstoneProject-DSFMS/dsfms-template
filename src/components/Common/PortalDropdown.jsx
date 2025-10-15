import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PortalDropdown = ({ 
  children, 
  trigger, 
  className = '', 
  menuClassName = '',
  placement = 'bottom-end',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 200; // Default dropdown width
    const menuHeight = 150; // Estimated dropdown height
    const gap = 4; // Gap between trigger and menu

    let top, left;

    switch (placement) {
      case 'bottom-start':
        top = triggerRect.bottom + gap;
        left = triggerRect.left;
        break;
      case 'bottom-end':
        top = triggerRect.bottom + gap;
        left = triggerRect.right - menuWidth;
        break;
      case 'top-start':
        top = triggerRect.top - menuHeight - gap;
        left = triggerRect.left;
        break;
      case 'top-end':
        top = triggerRect.top - menuHeight - gap;
        left = triggerRect.right - menuWidth;
        break;
      default:
        top = triggerRect.bottom + gap;
        left = triggerRect.right - menuWidth;
    }

    // Check if menu goes off screen and adjust
    if (top + menuHeight > window.innerHeight) {
      top = triggerRect.top - menuHeight - gap;
    }
    if (top < 0) {
      top = gap;
    }
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - gap;
    }
    if (left < 0) {
      left = gap;
    }

    setPosition({ top, left });
  };

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          triggerRef.current && 
          !triggerRef.current.contains(event.target) &&
          menuRef.current &&
          !menuRef.current.contains(event.target)) {
        handleClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Recalculate position on scroll or resize
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => calculatePosition();
      const handleResize = () => calculatePosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, placement]);

  const dropdownMenu = isOpen && createPortal(
    <div
      ref={menuRef}
      className={`dropdown-menu show portal-dropdown ${menuClassName}`}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1070,
        minWidth: '200px',
        background: '#fff',
        border: 'none',
        borderRadius: '0.25rem',
        boxShadow: 'none',
        padding: '0.5rem 0',
        transform: 'none',
        maxHeight: 'none',
        overflowY: 'visible'
      }}
    >
      {children}
    </div>,
    document.body
  );

  return (
    <div className={`dropdown ${className}`}>
      <button
        ref={triggerRef}
        className="btn btn-link dropdown-toggle"
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </button>
      {dropdownMenu}
    </div>
  );
};

export default PortalDropdown;
