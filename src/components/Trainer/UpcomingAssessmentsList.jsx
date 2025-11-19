import React, { useState, useEffect } from 'react';
import { Table, Badge, Row, Col, Alert } from 'react-bootstrap';
import { CalendarEvent, Clock, Person, Book, Eye, ThreeDotsVertical, JournalText } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, SearchBar } from '../Common';
import TrainerFilterPanel from './TrainerFilterPanel';
import useTableSort from '../../hooks/useTableSort';
import assessmentAPI from '../../api/assessment';
import { toast } from 'react-toastify';
import '../../styles/scrollable-table.css';

const UpcomingAssessmentsList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [entityFilter, setEntityFilter] = useState('course'); // 'course' or 'subject'

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await assessmentAPI.getUserEvents();
        
        if (response?.success && response?.data?.events) {
          const allowedStatuses = new Set(['NOT_STARTED', 'ON_GOING']);

          // Map API data to component format
          const mappedAssessments = response.data.events
            .filter((event) => allowedStatuses.has(event.status))
            .map((event) => {
            const occurrenceDate = new Date(event.occuranceDate);
            const dateStr = occurrenceDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit' 
            });
            const timeStr = occurrenceDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });

            const entityType = event.entityInfo?.type || (event.subjectId ? 'subject' : 'course');
            
            return {
              id: event.id || `${event.courseId}-${event.subjectId}-${event.occuranceDate}`,
              title: event.name,
              entityInfo: event.entityInfo,
              entityType: entityType,
              entityId: entityType === 'course' ? (event.entityInfo?.id || event.courseId) : (event.entityInfo?.id || event.subjectId),
              entityName: event.entityInfo?.name || 'N/A',
              entityCode: event.entityInfo?.code || '',
              courseName: entityType === 'course' ? event.entityInfo?.name : null,
              courseCode: entityType === 'course' ? event.entityInfo?.code : null,
              subjectName: entityType === 'subject' ? event.entityInfo?.name : null,
              subjectCode: entityType === 'subject' ? event.entityInfo?.code : null,
              traineeCount: event.totalTrainees || 0,
              scheduledDate: dateStr,
              scheduledTime: timeStr,
              occurrenceDate: event.occuranceDate,
              status: event.status || 'NOT_STARTED',
              templateInfo: event.templateInfo
            };
          });
          
          setAssessments(mappedAssessments);
        } else {
          setAssessments([]);
        }
      } catch (err) {
        console.error('Error fetching assessments:', err);
        setError('Failed to load upcoming assessments');
        toast.error('Failed to load upcoming assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const statusDisplayMap = {
    NOT_STARTED: { variant: 'secondary', text: 'Not Started' },
    ON_GOING: { variant: 'info', text: 'On Going' },
    APPROVED: { variant: 'success', text: 'Approved' },
    COMPLETED: { variant: 'success', text: 'Completed' },
    PENDING: { variant: 'warning', text: 'Pending' }
  };

  const getStatusBadge = (status) => {
    const config = statusDisplayMap[status] || { variant: 'secondary', text: status || 'Unknown' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleViewAssignments = (assessment) => {
    const targetType = entityFilter;
    const identifier = assessment.entityId;

    if (!identifier) {
      toast.error(`Missing ${targetType} identifier`);
      return;
    }

    navigate(`/trainer/assess/${targetType}/${identifier}`, {
      state: {
        name: assessment.entityName,
        code: assessment.entityCode,
        template: assessment.templateInfo?.name
      }
    });
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(assessments.map(assessment => assessment.status))];

  const filteredAssessments = assessments.filter(assessment => {
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(assessment.status);
    const matchesEntityFilter = assessment.entityType === entityFilter;
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (assessment.entityCode && assessment.entityCode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesEntityFilter && matchesSearch;
  });

  const handleStatusToggle = (status) => {
    if (status === 'clear') {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(prev => 
        prev.includes(status) 
          ? prev.filter(s => s !== status)
          : [...prev, status]
      );
    }
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSearchTerm('');
    // Keep entityFilter as is (don't reset)
  };

  const { sortedData, sortConfig, handleSort } = useTableSort(filteredAssessments);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={6} />;
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Alert>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`fw-semibold ${className}`}
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
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{ 
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '600' : '500',
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

  return (
    <div>

      {/* Search and Filters */}
      <Row className="mb-3 mt-4 form-mobile-stack search-filter-section">
        <Col xs={12} lg={5} md={4} className="mb-2 mb-lg-0 ps-2 ps-lg-3">
          <SearchBar
            placeholder="Search assessments, courses, or trainees..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="search-bar-mobile"
          />
        </Col>
        <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0">
          <div className="d-flex gap-2 align-items-center">
            <label className="text-muted small mb-0 me-2">View:</label>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <input
                type="radio"
                className="btn-check"
                name="entityFilter"
                id="filter-course"
                checked={entityFilter === 'course'}
                onChange={() => setEntityFilter('course')}
              />
              <label
                className={`btn btn-sm ${entityFilter === 'course' ? 'btn-primary-custom text-white' : 'btn-outline-primary'}`}
                htmlFor="filter-course"
                style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.9rem' }}
              >
                <Book size={14} />
                Course
              </label>

              <input
                type="radio"
                className="btn-check"
                name="entityFilter"
                id="filter-subject"
                checked={entityFilter === 'subject'}
                onChange={() => setEntityFilter('subject')}
              />
              <label
                className={`btn btn-sm ${entityFilter === 'subject' ? 'btn-secondary-custom text-white' : 'btn-outline-secondary'}`}
                htmlFor="filter-subject"
                style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.9rem' }}
              >
                <JournalText size={14} />
                Subject
              </label>
            </div>
          </div>
        </Col>
        <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
          <TrainerFilterPanel
            uniqueStatuses={uniqueStatuses}
            selectedStatuses={selectedStatuses}
            onStatusToggle={handleStatusToggle}
            onClearFilters={handleClearFilters}
            className="filter-panel-mobile"
          />
        </Col>
      </Row>
        <div className="scrollable-table-container admin-table">
          <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
            <thead className="sticky-header">
              <tr>
                <SortableHeader columnKey="title" className="show-mobile">
                  Assessment
                </SortableHeader>
                <SortableHeader columnKey={entityFilter === 'course' ? 'courseName' : 'subjectName'} className="show-mobile">
                  {entityFilter === 'course' ? 'Course' : 'Subject'}
                </SortableHeader>
                <SortableHeader columnKey="traineeCount" className="show-mobile">
                  Trainees
                </SortableHeader>
                <SortableHeader columnKey="scheduledDate" className="show-mobile">
                  Date & Time
                </SortableHeader>
                <SortableHeader columnKey="status" className="show-mobile">
                  Status
                </SortableHeader>
                <th className="border-neutral-200 text-primary-custom fw-semibold text-center show-mobile">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    <div>
                      <h6 className="mb-1">No upcoming assessments found</h6>
                      <small>Try adjusting your search criteria or schedule a new assessment.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((assessment) => (
                  <tr key={assessment.id}>
                    <td className="border-neutral-200 align-middle">
                      <div>
                        <h6 className="mb-1 fw-medium">{assessment.title}</h6>
                        {assessment.templateInfo && (
                          <small className="text-muted">
                            <JournalText size={12} className="me-1" />
                            {assessment.templateInfo.name}
                          </small>
                        )}
                      </div>
                    </td>
                    <td className="border-neutral-200 align-middle">
                      {entityFilter === 'course' ? (
                        assessment.courseName ? (
                          <div className="d-flex align-items-center">
                            <Book size={16} className="me-2 text-primary" />
                            <div className="d-flex flex-column">
                              <span className="fw-medium">{assessment.courseName}</span>
                              {assessment.courseCode && (
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {assessment.courseCode}
                                </small>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )
                      ) : (
                        assessment.subjectName ? (
                          <div className="d-flex align-items-center">
                            <JournalText size={16} className="me-2 text-success" />
                            <div className="d-flex flex-column">
                              <span className="fw-medium">{assessment.subjectName}</span>
                              {assessment.subjectCode && (
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {assessment.subjectCode}
                                </small>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )
                      )}
                    </td>
                    <td className="border-neutral-200 align-middle">
                      <div className="d-flex align-items-center">
                        <Person size={16} className="me-2 text-muted" />
                        <span>{assessment.traineeCount} {assessment.traineeCount === 1 ? 'trainee' : 'trainees'}</span>
                      </div>
                    </td>
                    <td className="border-neutral-200 align-middle">
                      <div>
                        <div className="fw-medium">{assessment.scheduledDate}</div>
                        <small className="text-muted">{assessment.scheduledTime}</small>
                      </div>
                    </td>
                    <td className="border-neutral-200 align-middle">
                      {getStatusBadge(assessment.status)}
                    </td>
                    <td className="border-neutral-200 align-middle text-center">
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
                            label: 'Assess',
                            icon: <Eye />,
                            onClick: () => handleViewAssignments(assessment)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
    </div>
  );
};

export default UpcomingAssessmentsList;
