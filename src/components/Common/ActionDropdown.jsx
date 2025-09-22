import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Pencil, PersonX, CheckCircle, ThreeDots, Trash } from 'react-bootstrap-icons';

const ActionDropdown = ({ 
  item, 
  onView, 
  onEdit, 
  onToggleStatus,
  onDelete,
  viewLabel = "View Details",
  editLabel = "Edit",
  toggleLabel = "Toggle Status",
  deleteLabel = "Delete",
  statusField = "status",
  activeValue = "ACTIVE",
  inactiveValue = "INACTIVE",
  showDelete = false
}) => {
  const buttonRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const handleToggle = () => {
    if (!showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 200 + window.scrollX // 200px is dropdown width
      });
    }
    setShowDropdown(!showDropdown);
  };

  const handleClose = () => {
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown) {
        // Check if click is outside both button and dropdown
        const isClickInsideButton = buttonRef.current && buttonRef.current.contains(event.target);
        const isClickInsideDropdown = event.target.closest('.dropdown-menu.show');
        
        if (!isClickInsideButton && !isClickInsideDropdown) {
          handleClose();
        }
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const isActive = item[statusField] === activeValue;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="btn btn-link text-primary-custom p-1"
        style={{
          border: 'none',
          background: 'transparent',
          boxShadow: 'none'
        }}
      >
        <ThreeDots size={16} />
      </button>

      {showDropdown && createPortal(
        <div
          className="dropdown-menu show border-0 shadow"
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            zIndex: 1050,
            minWidth: '200px'
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onView(item);
              handleClose();
            }}
            className="dropdown-item text-white d-flex align-items-center"
          >
            <Eye className="me-2" size={16} />
            {viewLabel}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(item);
              handleClose();
            }}
            className="dropdown-item text-white d-flex align-items-center"
          >
            <Pencil className="me-2" size={16} />
            {editLabel}
          </button>
          <div className="dropdown-divider"></div>
          {showDelete && onDelete ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(item);
                handleClose();
              }}
              className="dropdown-item text-danger d-flex align-items-center"
            >
              <Trash className="me-2" size={16} />
              {deleteLabel}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleStatus(item);
                handleClose();
              }}
              className={`dropdown-item d-flex align-items-center ${
                isActive ? 'text-warning' : 'text-success'
              }`}
            >
              {isActive ? (
                <>
                  <PersonX className="me-2" size={16} />
                  {toggleLabel}
                </>
              ) : (
                <>
                  <CheckCircle className="me-2" size={16} />
                  {toggleLabel}
                </>
              )}
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default ActionDropdown;
