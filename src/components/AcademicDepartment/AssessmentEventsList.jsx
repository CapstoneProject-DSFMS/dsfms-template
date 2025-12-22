import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Eye, ThreeDotsVertical, CalendarEvent } from 'react-bootstrap-icons';
import { LoadingSkeleton, PortalUnifiedDropdown } from '../Common';
import { assessmentAPI } from '../../api';
import { toast } from 'react-toastify';

const AssessmentEventsList = ({ courseId, subjectId, onView }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssessmentEvents = async () => {
      if (!courseId && !subjectId) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Call API to get all assessment events
        const response = await assessmentAPI.getAssessmentEvents();
        const allEvents = response?.data?.events || [];
        
        // Filter events based on courseId or subjectId
        const filteredEvents = allEvents.filter(event => {
          if (subjectId) {
            // For subject detail page, show events that belong to this subject
            return event.subjectId === subjectId;
          } else if (courseId) {
            // For course detail page, show events that belong to this course
            // (either directly to course or to subjects within this course)
            return event.courseId === courseId;
          }
          return false;
        });
        
        // Map events to match table format
        const mappedEvents = filteredEvents.map((event, index) => {
          let subjectName = '';
          let courseName = '';
          
          if (event.entityInfo) {
            if (event.entityInfo.type === 'subject') {
              subjectName = event.entityInfo.name || '';
            } else if (event.entityInfo.type === 'course') {
              courseName = event.entityInfo.name || '';
            }
          }
          
          return {
            id: event.id || `event-${index}`,
            name: event.name || 'N/A',
            subject: subjectName,
            course: courseName,
            occurrenceDate: event.occuranceDate || event.occurrenceDate,
            status: event.status || 'N/A',
            totalTrainees: event.totalTrainees || 0,
            templateInfo: event.templateInfo,
            originalEvent: event
          };
        });
        
        setEvents(mappedEvents);
      } catch (err) {
        console.error('Error loading assessment events:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load assessment events');
        toast.error('Failed to load assessment events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssessmentEvents();
  }, [courseId, subjectId]);

  const getStatusBadgeColor = (status) => {
    const statusUpper = String(status || '').toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE':
      case 'SCHEDULED':
      case 'UPCOMING':
      case 'NOT_STARTED':
        return 'primary';
      case 'COMPLETED':
      case 'FINISHED':
        return 'info';
      case 'CANCELLED':
      case 'CANCELED':
        return 'danger';
      case 'ONGOING':
      case 'ON_GOING':
        return 'success';
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

  if (loading) {
    return (
      <div>
        <LoadingSkeleton rows={4} columns={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <CalendarEvent size={48} className="mb-3" style={{ opacity: 0.5 }} />
          <h5>No assessment events found</h5>
          <p>There are no assessment events available for this {subjectId ? 'subject' : 'course'}.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="table-responsive">
        <Table hover striped bordered className="mb-0">
          <thead>
            <tr>
              <th 
                className="fw-semibold text-start"
                style={{ 
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Name
              </th>
              <th 
                className="fw-semibold text-start"
                style={{ 
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Template Name
              </th>
              <th 
                className="fw-semibold text-start"
                style={{ 
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Occurrence Date
              </th>
              <th 
                className="fw-semibold text-start"
                style={{ 
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Total Trainees
              </th>
              <th 
                className="fw-semibold text-start"
                style={{ 
                  backgroundColor: 'var(--bs-primary)',
                  color: 'white',
                  borderColor: 'var(--bs-primary)'
                }}
              >
                Status
              </th>
              <th 
                className="fw-semibold text-center"
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
            {events.map((event, index) => (
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
                  <span>{event.templateInfo?.name || '-'}</span>
                </td>
                <td className="align-middle">
                  <span>{formatDate(event.occurrenceDate)}</span>
                </td>
                <td className="align-middle">
                  <Badge bg="info" className="px-2 py-1">
                    {event.totalTrainees || 0}
                  </Badge>
                </td>
                <td className="align-middle">
                  <Badge bg={getStatusBadgeColor(event.status)} className="px-3 py-2">
                    {event.status?.replace(/_/g, ' ') || '-'}
                  </Badge>
                </td>
                <td className="align-middle text-center">
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
                        onClick: () => onView && onView(event.originalEvent || event)
                      }
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AssessmentEventsList;

