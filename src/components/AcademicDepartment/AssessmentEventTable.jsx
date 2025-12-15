import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { Eye, Pencil, ThreeDotsVertical } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

const AssessmentEventTable = ({
  assessmentEvents = [],
  loading = false,
  onView,
  onUpdate,
}) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(assessmentEvents);

  if (loading) {
    return <LoadingSkeleton rows={4} columns={6} />;
  }

  if (assessmentEvents.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No assessment events found</h5>
          <p>There are no assessment events available.</p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`fw-semibold text-start ${className}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#214760';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bs-primary)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative w-100">
          <span style={{ 
            transition: 'all 0.3s ease',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            flex: '1',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'white'
          }}>
            {children}
          </span>
          <div 
            className="ms-2 d-flex align-items-center"
            style={{ 
              minWidth: '20px',
              justifyContent: 'center'
            }}
          >
            <SortIcon 
              direction={direction} 
              size={14}
              color="white"
            />
          </div>
        </div>
        {isActive && (
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'rgba(255, 255, 255, 0.5)',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </th>
    );
  };

  const getStatusBadgeColor = (status) => {
    const statusUpper = String(status || '').toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE':
      case 'SCHEDULED':
      case 'UPCOMING':
      case 'NOT_STARTED':
        return 'success';
      case 'COMPLETED':
      case 'FINISHED':
        return 'info';
      case 'CANCELLED':
      case 'CANCELED':
        return 'danger';
      case 'ONGOING':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  };

  return (
    <div className="scrollable-table-container">
      <Table hover striped bordered className="mb-0">
        <thead className="sticky-header">
          <tr>
            <SortableHeader columnKey="name">Name</SortableHeader>
            <SortableHeader columnKey="subject">Subject</SortableHeader>
            <SortableHeader columnKey="course">Course</SortableHeader>
            <SortableHeader columnKey="occurrenceDate">Occurrence Date</SortableHeader>
            <SortableHeader columnKey="status">Status</SortableHeader>
            <th 
              className="fw-semibold text-center sticky-header"
              style={{ 
                backgroundColor: 'var(--bs-primary)',
                color: 'white',
                borderColor: 'var(--bs-primary)'
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((event, index) => (
            <tr 
              key={event.id || index}
              style={{ 
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
              }}
            >
              <td className="align-middle">
                <span className="fw-medium">{event.name || '-'}</span>
              </td>
              <td className="align-middle">
                <span>{event.subject || '-'}</span>
              </td>
              <td className="align-middle">
                <span>{event.course || '-'}</span>
              </td>
              <td className="align-middle">
                <span>{formatDate(event.occurrenceDate)}</span>
              </td>
              <td className="align-middle">
                <Badge bg={getStatusBadgeColor(event.status)} className="px-3 py-2">
                  {event.status || '-'}
                </Badge>
              </td>
              <td className="align-middle text-center">
                <PermissionWrapper 
                  permissions={[PERMISSION_IDS.VIEW_ASSESSMENT_DETAILS, PERMISSION_IDS.UPDATE_ASSESSMENT_EVENT]}
                  fallback={null}
                >
                  <PortalUnifiedDropdown
                    align="end"
                    className="table-dropdown"
                    placement="bottom-end"
                    trigger={{
                      variant: 'link',
                      className: 'btn btn-link p-0 text-primary-custom',
                      style: { border: 'none', background: 'transparent' },
                      children: <ThreeDotsVertical size={16} />
                    }}
                    items={[
                      {
                        label: 'View Details',
                        icon: <Eye />,
                        onClick: () => onView && onView(event.originalEvent || event),
                        permission: PERMISSION_IDS.VIEW_ASSESSMENT_DETAILS
                      },
                      {
                        label: 'Update',
                        icon: <Pencil />,
                        onClick: () => onUpdate && onUpdate(event.originalEvent || event),
                        permission: PERMISSION_IDS.UPDATE_ASSESSMENT_EVENT
                      }
                    ]}
                  />
                </PermissionWrapper>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AssessmentEventTable;

