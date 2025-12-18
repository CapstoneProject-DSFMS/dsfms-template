import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import TrainerActions from './TrainerActions';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import '../../styles/scrollable-table.css';

/**
 * Reusable component for displaying trainers in assessment table
 * Supports both Subject and Course variants
 * 
 * @param {Array} trainers - Array of trainer objects
 * @param {string} variant - 'subject' | 'course' - Determines which columns to show
 * @param {Function} onEdit - Handler for edit action (receives trainer object)
 * @param {Function} onDelete - Handler for delete action (receives trainer object or trainer.id)
 * @param {boolean} hasActionPermission - Whether to show Actions column
 * @param {string} editPermission - Permission ID for edit action
 * @param {Function} formatRole - Optional function to format role display (for subject variant)
 * @param {string} emptyMessage - Message to show when no trainers
 */
const TrainersInAssessmentTable = ({
  trainers = [],
  variant = 'course', // 'subject' | 'course'
  onEdit,
  onDelete,
  hasActionPermission = true,
  editPermission = PERMISSION_IDS.ASSIGN_TRAINERS,
  formatRole,
  emptyMessage = 'No trainers assigned yet.'
}) => {
  // Function to format role display for subject variant
  const defaultFormatRoleDisplay = (role) => {
    const roleMap = {
      'PRIMARY_INSTRUCTOR': { text: 'Primary Instructor', variant: 'primary' },
      'EXAMINER': { text: 'Examiner', variant: 'warning' },
      'ASSESSMENT_REVIEWER': { text: 'Assessment Reviewer', variant: 'info' },
      'ASSISTANT_INSTRUCTOR': { text: 'Assistant Instructor', variant: 'secondary' }
    };
    
    const roleInfo = roleMap[role] || { text: role, variant: 'light' };
    return roleInfo;
  };

  const formatRoleFn = formatRole || defaultFormatRoleDisplay;

  // Handle edit - support both function signatures
  const handleEdit = (trainer) => {
    if (onEdit) {
      if (variant === 'subject') {
        onEdit(trainer); // Subject passes full trainer object
      } else {
        onEdit(trainer.id); // Course passes trainer.id
      }
    }
  };

  // Handle delete - support both function signatures
  const handleDelete = (trainer) => {
    if (onDelete) {
      // Both variants pass trainer.id to onDelete
      onDelete(trainer.id);
    }
  };

  // Get trainer name based on variant
  const getTrainerName = (trainer) => {
    if (variant === 'subject') {
      return trainer.name || '';
    } else {
      // Course variant - can use pre-combined name or construct from parts
      if (trainer.name) {
        return trainer.name; // Already combined (from transformed data)
      }
      const parts = [trainer.firstName, trainer.middleName, trainer.lastName].filter(Boolean);
      return parts.join(' ') || '';
    }
  };

  // Get trainer role based on variant
  const getTrainerRole = (trainer) => {
    if (variant === 'subject') {
      return trainer.role;
    } else {
      // Course variant - role might be string (from transformed data) or array (from API)
      return trainer.role || trainer.roleInCourse;
    }
  };

  // Function to format role text (convert ASSESSMENT_REVIEWER to Assessment Reviewer)
  const formatRoleText = (role) => {
    if (!role) return '-';
    return role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Render role cell based on variant
  const renderRoleCell = (trainer) => {
    if (variant === 'subject') {
      const role = getTrainerRole(trainer);
      const roleInfo = formatRoleFn(role);
      return (
        <Badge bg={roleInfo.variant || 'success'}>
          {roleInfo.text}
        </Badge>
      );
    } else {
      // Course variant - role might be string (from transformed data) or array (from API)
      const roles = getTrainerRole(trainer);
      
      // Handle both string and array formats
      if (typeof roles === 'string') {
        return (
          <Badge bg="success">
            {formatRoleText(roles)}
          </Badge>
        );
      } else if (Array.isArray(roles) && roles.length > 0) {
        return roles.map((role, idx) => (
          <Badge key={idx} bg="success" className="me-1">
            {formatRoleText(role)}
          </Badge>
        ));
      } else {
        return <span className="text-muted">-</span>;
      }
    }
  };

  if (!trainers || trainers.length === 0) {
    return (
      <div className="alert alert-info">
        {emptyMessage}
      </div>
    );
  }

  const isSubjectVariant = variant === 'subject';
  const showIndex = !isSubjectVariant; // Only show index for course variant
  const showEmail = !isSubjectVariant; // Only show email for course variant
  const showPhone = !isSubjectVariant; // Only show phone for course variant

  return (
    <div className="scrollable-table-container admin-table trainer-table-scroll">
      <Table hover className="mb-0" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            {showIndex && (
              <th 
                className="fw-semibold"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)',
                  borderLeft: 'none',
                  borderRight: 'none'
                }}
              >
                #
              </th>
            )}
            <th 
              className="fw-semibold"
              style={{
                backgroundColor: 'var(--bs-primary)',
                color: 'white',
                borderColor: 'var(--bs-primary)',
                borderLeft: 'none',
                borderRight: 'none'
              }}
            >
              EID
            </th>
            <th 
              className="fw-semibold"
              style={{
                backgroundColor: 'var(--bs-primary)',
                color: 'white',
                borderColor: 'var(--bs-primary)',
                borderLeft: 'none',
                borderRight: 'none'
              }}
            >
              Name
            </th>
            {showEmail && (
              <th 
                className="fw-semibold"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)',
                  borderLeft: 'none',
                  borderRight: 'none'
                }}
              >
                Email
              </th>
            )}
            {showPhone && (
              <th 
                className="fw-semibold"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)',
                  borderLeft: 'none',
                  borderRight: 'none'
                }}
              >
                Phone
              </th>
            )}
            <th 
              className="fw-semibold"
              style={{
                backgroundColor: 'var(--bs-primary)',
                color: 'white',
                borderColor: 'var(--bs-primary)',
                borderLeft: 'none',
                borderRight: 'none'
              }}
            >
              Role
            </th>
            {hasActionPermission && (
              <th 
                className="fw-semibold text-center"
                style={{
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)',
                  borderLeft: 'none',
                  borderRight: 'none'
                }}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {trainers.map((trainer, index) => (
            <tr 
              key={trainer.id}
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
              {showIndex && (
                <td 
                  className="align-middle"
                  style={{ borderLeft: 'none', borderRight: 'none' }}
                >
                  {index + 1}
                </td>
              )}
              <td 
                className="align-middle"
                style={{ borderLeft: 'none', borderRight: 'none' }}
              >
                <Badge bg="secondary" className="text-white">
                  {trainer.eid}
                </Badge>
              </td>
              <td 
                className="align-middle"
                style={{ borderLeft: 'none', borderRight: 'none' }}
              >
                <span className="fw-medium text-dark">
                  {getTrainerName(trainer)}
                </span>
              </td>
              {showEmail && (
                <td 
                  className="align-middle"
                  style={{ borderLeft: 'none', borderRight: 'none' }}
                >
                  <span className="text-dark">{trainer.email || '-'}</span>
                </td>
              )}
              {showPhone && (
                <td 
                  className="align-middle"
                  style={{ borderLeft: 'none', borderRight: 'none' }}
                >
                  <span className="text-dark">{trainer.phoneNumber || '-'}</span>
                </td>
              )}
              <td 
                className="align-middle"
                style={{ borderLeft: 'none', borderRight: 'none' }}
              >
                {renderRoleCell(trainer)}
              </td>
              {hasActionPermission && (
                <td 
                  className="align-middle text-center"
                  style={{ borderLeft: 'none', borderRight: 'none' }}
                >
                  <TrainerActions
                    trainer={trainer}
                    onEdit={onEdit ? () => handleEdit(trainer) : undefined}
                    onDelete={onDelete ? () => handleDelete(trainer) : undefined}
                    editPermission={editPermission}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TrainersInAssessmentTable;

