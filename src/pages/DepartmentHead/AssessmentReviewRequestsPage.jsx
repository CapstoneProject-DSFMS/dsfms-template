import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Table, Nav, Tab, Badge, Spinner, Button } from 'react-bootstrap';
import { 
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Gear,
  CheckCircleFill
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SearchBar } from '../../components/Common';
import useTableSort from '../../hooks/useTableSort';
import { ROUTES } from '../../constants/routes';
import assessmentAPI from '../../api/assessment';
import '../../styles/scrollable-table.css';
import '../../styles/department-head.css';

// Event Row Component for Processing Tab
const ProcessingEventRow = ({ event, index, onView }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Use pre-calculated counts from enriched event
  const { totalAssessments, submittedCount, reviewedCount } = event;

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
      <td className="align-middle">
        <div>
          <div className="fw-medium">{event.eventName}</div>
          <small className="text-muted">{event.entityDisplay}</small>
        </div>
      </td>
      <td className="align-middle">
        <Badge bg="info" className="fs-6">
          {submittedCount}/{totalAssessments}
        </Badge>
      </td>
      <td className="align-middle">
        <Badge bg="secondary" className="fs-6">
          {reviewedCount}/{totalAssessments}
        </Badge>
      </td>
      <td className="align-middle">
        <div className="text-muted">
          {formatDate(event.occurrenceDate)}
        </div>
      </td>
      <td className="align-middle text-center">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => onView(event)}
          className="d-flex align-items-center mx-auto"
          style={{ width: 'fit-content' }}
        >
          <Eye className="me-1" size={14} />
          View Detail
        </Button>
      </td>
    </tr>
  );
};

// Event Row Component for Completed Tab
const CompletedEventRow = ({ event, index, onView }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Use pre-calculated counts from enriched event
  const { totalAssessments, reviewedCount, cancelledCount } = event;

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
      <td className="align-middle">
        <div>
          <div className="fw-medium">{event.eventName}</div>
          <small className="text-muted">{event.entityDisplay}</small>
        </div>
      </td>
      <td className="align-middle">
        <Badge bg="secondary" className="fs-6">
          {reviewedCount}/{totalAssessments}
        </Badge>
      </td>
      <td className="align-middle">
        <Badge bg="warning" className="fs-6">
          {cancelledCount}/{totalAssessments}
        </Badge>
      </td>
      <td className="align-middle">
        <div className="text-muted">
          {formatDate(event.occurrenceDate)}
        </div>
      </td>
      <td className="align-middle text-center">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => onView(event)}
          className="d-flex align-items-center mx-auto"
          style={{ width: 'fit-content' }}
        >
          <Eye className="me-1" size={14} />
          View Detail
        </Button>
      </td>
    </tr>
  );
};

// Main Component
const AssessmentReviewRequestsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mainTab, setMainTab] = useState('processing'); // 'processing' or 'completed'

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getDepartmentEvents();
      const eventsData = response?.data?.events || response?.events || [];
      
      // Map API response to component format and generate eventId
      const mappedEvents = eventsData
        .filter(event => event.status !== 'NOT_STARTED') // Filter out NOT_STARTED events
        .map((event) => {
          // Generate eventId from templateId + occuranceDate (same format as before for compatibility)
          const eventKey = `${event.templateInfo?.id || ''}|${event.occuranceDate || ''}`;
          const eventId = encodeURIComponent(eventKey);

          return {
            eventId,
            eventKey,
            eventName: event.name,
            entityDisplay: event.entityInfo ? `${event.entityInfo.type.charAt(0).toUpperCase() + event.entityInfo.type.slice(1)}: ${event.entityInfo.name}` : 'Unknown Entity',
            templateId: event.templateInfo?.id,
            occurrenceDate: event.occuranceDate || event.occurrenceDate,
            status: event.status,
            totalAssessments: event.totalAssessments,
            totalTrainees: event.totalTrainees,
            totalTrainers: event.totalTrainers,
            submittedCount: event.totalSubmittedForm || 0,
            reviewedCount: event.totalReviewedForm || 0,
            cancelledCount: event.totalCancelledForm || 0,
            entityInfo: event.entityInfo,
            templateInfo: event.templateInfo,
            courseId: event.courseId,
            subjectId: event.subjectId
          };
        });
      
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Separate events into Processing and Completed
  const { processingEvents, completedEvents } = useMemo(() => {
    const processing = [];
    const completed = [];

    events.forEach(event => {
      // Event is in Processing if status is ON_GOING
      if (event.status === 'ON_GOING') {
        processing.push(event);
      } 
      // Event is in Completed if status is FINISHED
      else if (event.status === 'FINISHED') {
        completed.push(event);
      }
    });

    return {
      processingEvents: processing,
      completedEvents: completed
    };
  }, [events]);

  // Filter events by search term
  const filterEventsBySearch = (eventsList) => {
    if (!searchTerm) return eventsList;
    
    const searchLower = searchTerm.toLowerCase();
    return eventsList.filter(event => {
      return (
        event.eventName?.toLowerCase().includes(searchLower) ||
        event.templateName?.toLowerCase().includes(searchLower)
      );
    });
  };

  // Get filtered events for current tab
  const getFilteredEvents = () => {
    if (mainTab === 'processing') {
      return filterEventsBySearch(processingEvents);
    } else {
      return filterEventsBySearch(completedEvents);
    }
  };

  const filteredEvents = getFilteredEvents();

  const finalFilteredEvents = filteredEvents;

  // Use table sort hook
  const { sortedData: sortedEvents, sortConfig, handleSort, handleSort: resetSort } = useTableSort(finalFilteredEvents);

  // Reset sort when tab changes
  useEffect(() => {
    // Sort will automatically update since finalFilteredEvents changed
  }, [mainTab]);

  const handleViewEvent = (event) => {
    // Determine event type based on whether it has submitted forms
    const hasSubmitted = event.submittedCount > 0;
    const eventType = hasSubmitted ? 'processing' : 'completed';
    
    // Navigate with event type in state
    navigate(ROUTES.DEPARTMENT_REVIEW_EVENT_DETAIL(event.eventId), {
      state: { 
        eventType,
        eventData: event // Pass full event data for detail page
      }
    });
  };


  // No auto-switch logic - let user control tab switching

  const SortableHeader = ({ columnKey, children, className = "", nestedKey = null }) => {
    const sortKey = nestedKey ? `${columnKey}.${nestedKey}` : columnKey;
    const isActive = sortConfig?.key === sortKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`fw-semibold ${className}`}
        onClick={() => handleSort && handleSort(sortKey)}
        style={{ 
          cursor: handleSort ? 'pointer' : 'default',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        <div className="d-flex align-items-center">
          <span style={{ color: 'white' }}>{children}</span>
          {direction && (
            <span className="ms-1" style={{ color: 'white' }}>
              {direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading assessment review requests...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container 
      fluid 
      className="py-4 assessment-review-requests-page"
      style={{ backgroundColor: 'transparent', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <Row className="align-items-center mb-3">
        <Col xs={12}>
          <div className="mb-3">
            <h2 className="mb-1">Assessment Review Requests</h2>
            <p className="text-muted mb-0">Review and approve/deny assessment requests from your department</p>
          </div>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tab.Container activeKey={mainTab} onSelect={setMainTab}>
        <div className="bg-primary rounded-top">
          <div className="border-bottom py-2 px-3">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link 
                  eventKey="processing" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: mainTab === 'processing' ? '600' : '400',
                    opacity: mainTab === 'processing' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <Gear className="me-2" size={16} />
                  Processing ({processingEvents.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="completed" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: mainTab === 'completed' ? '600' : '400',
                    opacity: mainTab === 'completed' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <CheckCircleFill className="me-2" size={16} />
                  Completed ({completedEvents.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Tab.Content style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Tab.Pane 
              eventKey={mainTab}
              key={mainTab}
              style={{ 
                flex: 1, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                padding: 0
              }}
            >
              {/* Search and Filters */}
              <Row className="mb-3 form-mobile-stack search-filter-section p-3" style={{ flexShrink: 0 }}>
                <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
                  <SearchBar
                    placeholder="Search by assessment event name or template name..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="search-bar-mobile"
                  />
                </Col>
                <Col xs={12} lg={6} md={7}>
                  <div className="text-end text-mobile-center">
                    <small className="text-muted">
                      {finalFilteredEvents.length} event{finalFilteredEvents.length !== 1 ? 's' : ''}
                    </small>
                  </div>
                </Col>
              </Row>

              {/* Table */}
              {finalFilteredEvents.length === 0 ? (
                <div className="text-center py-5" style={{ flex: 1 }}>
                  <div className="text-muted">
                    <h5>No events found</h5>
                    <p>
                      No assessment events found in {mainTab} tab.
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className="scrollable-table-container admin-table" 
                  style={{ 
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'auto'
                  }}
                >
                  <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
                    <thead className="sticky-header">
                      <tr>
                        <SortableHeader columnKey="eventName">
                          Assessment Event Name
                        </SortableHeader>
                        {mainTab === 'processing' ? (
                          <>
                            <SortableHeader columnKey="submittedCount">
                              Total Submitted Form
                            </SortableHeader>
                            <SortableHeader columnKey="reviewedCount">
                              Total Reviewed Form
                            </SortableHeader>
                          </>
                        ) : (
                          <>
                            <SortableHeader columnKey="reviewedCount">
                              Total Reviewed Form
                            </SortableHeader>
                            <SortableHeader columnKey="cancelledCount">
                              Total Cancelled Form
                            </SortableHeader>
                          </>
                        )}
                        <SortableHeader columnKey="occurrenceDate" nestedKey="occurrenceDate">
                          Occurrence Date
                        </SortableHeader>
                        <th 
                          className="fw-semibold text-center"
                          style={{
                            backgroundColor: 'var(--bs-primary)',
                            color: 'white',
                            borderColor: 'var(--bs-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEvents.map((event, index) => {
                        if (mainTab === 'processing') {
                          return (
                            <ProcessingEventRow
                              key={`${mainTab}-${index}`}
                              event={event}
                              index={index}
                              onView={handleViewEvent}
                            />
                          );
                        } else {
                          return (
                            <CompletedEventRow
                              key={`${mainTab}-${index}`}
                              event={event}
                              index={index}
                              onView={handleViewEvent}
                            />
                          );
                        }
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Tab.Pane>
          </Tab.Content>
        </div>
      </Tab.Container>
    </Container>
  );
};

export default AssessmentReviewRequestsPage;
