import React, { useRef, useState, useEffect } from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { Eye, Pencil, Trash, CheckCircle, ThreeDots, PersonPlus, Book } from 'react-bootstrap-icons';

const DepartmentRow = ({ department, index, onView, onEdit, onDelete, onToggleStatus, onAssignInstructors, onViewCourses }) => {
  const buttonRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Debug: Log props to ensure they're passed correctly
  console.log('DepartmentRow props:', {
    department: department.name,
    onView: typeof onView,
    onEdit: typeof onEdit,
    onDelete: typeof onDelete,
    onToggleStatus: typeof onToggleStatus,
    onAssignInstructors: typeof onAssignInstructors,
    onViewCourses: typeof onViewCourses
  });

  const getStatusVariant = (status) => {
    return status === 'ACTIVE' ? 'success' : 'secondary';
  };

  const getStatusIcon = (status) => {
    return status === 'ACTIVE' ? '●' : '○';
  };

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

  return (
    <tr 
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
      style={{
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
      }}
    >
      <td className="border-neutral-200 align-middle show-mobile">
        <div className="fw-medium text-dark">
          {department.name}
        </div>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <Badge 
          bg="secondary" 
          className="px-2 py-1"
          style={{ 
            backgroundColor: 'var(--bs-secondary)',
            fontSize: '0.75rem'
          }}
        >
          {department.code}
        </Badge>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <Badge 
          bg="secondary" 
          className="px-2 py-1"
          style={{ 
            backgroundColor: 'var(--bs-secondary)',
            fontSize: '0.75rem'
          }}
        >
          {department.type}
        </Badge>
      </td>
      
      <td className="border-neutral-200 align-middle hide-mobile">
        <span className="text-dark">
          {department.departmentHead?.name || 'Not assigned'}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle hide-mobile">
        <span className="text-dark">
          {department.coursesCount}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle hide-mobile">
        <span className="text-dark">
          {department.traineesCount}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle hide-mobile">
        <span className="text-dark">
          {department.trainersCount}
        </span>
      </td>
      
      <td className="border-neutral-200 align-middle show-mobile">
        <Badge 
          bg={getStatusVariant(department.status)}
          className="px-2 py-1 d-flex align-items-center"
          style={{ 
            fontSize: '0.75rem',
            width: 'fit-content'
          }}
        >
          <span className="me-1" style={{ fontSize: '0.8rem' }}>
            {getStatusIcon(department.status)}
          </span>
          {department.status}
        </Badge>
      </td>
      
      <td className="border-neutral-200 align-middle text-center show-mobile">
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
                console.log('View clicked:', department.name);
                onView(department);
                handleClose();
              }}
              className="dropdown-item text-primary-custom d-flex align-items-center"
            >
              <Eye className="me-2" size={16} />
              View Details
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Edit clicked:', department.name);
                onEdit(department);
                handleClose();
              }}
              className="dropdown-item text-primary-custom d-flex align-items-center"
            >
              <Pencil className="me-2" size={16} />
              Edit Department
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Assign Instructors clicked:', department.name);
                if (onAssignInstructors) {
                  onAssignInstructors(department);
                }
                handleClose();
              }}
              className="dropdown-item text-primary-custom d-flex align-items-center"
            >
              <PersonPlus className="me-2" size={16} />
              Assign Instructors
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('View Courses clicked:', department.name);
                if (onViewCourses) {
                  onViewCourses(department);
                }
                handleClose();
              }}
              className="dropdown-item text-primary-custom d-flex align-items-center"
            >
              <Book className="me-2" size={16} />
              View Courses
            </button>
            <div className="dropdown-divider"></div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Toggle Status clicked:', department.name);
                onToggleStatus(department);
                handleClose();
              }}
              className={`dropdown-item d-flex align-items-center ${
                department.status === 'ACTIVE' ? 'text-warning' : 'text-success'
              }`}
            >
              {department.status === 'ACTIVE' ? (
                <>
                  <Trash className="me-2" size={16} />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="me-2" size={16} />
                  Activate
                </>
              )}
            </button>
          </div>,
          document.body
        )}
      </td>
    </tr>
  );
};

export default DepartmentRow;
