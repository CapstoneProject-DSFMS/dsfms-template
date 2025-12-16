import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Row, Col, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { LoadingSkeleton, SortIcon, SearchBar } from '../Common';
import TrainerFilterPanel from './TrainerFilterPanel';
import useTableSort from '../../hooks/useTableSort';
import profileAPI from '../../api/profile';
import '../../styles/scrollable-table.css';

const InstructedCoursesList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const { sortedData, sortConfig, handleSort } = useTableSort(courses);

  // Fetch courses from profile API - only use data from API response
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get profile to fetch teachingCourses
        const profileData = await profileAPI.getProfile();
        
        if (!profileData || !profileData.teachingCourses || !Array.isArray(profileData.teachingCourses)) {
          setCourses([]);
          setLoading(false);
          return;
        }
        
        // Map API status to display format
        const mapStatus = (apiStatus) => {
          // Keep original status from API
          return apiStatus;
        };
        
        // Format date from ISO string to YYYY-MM-DD
        const formatDate = (dateString) => {
          if (!dateString) return 'N/A';
          return new Date(dateString).toISOString().split('T')[0];
        };
        
        // Map teachingCourses to table format - only use data from API response
        const mappedCourses = profileData.teachingCourses.map((course) => {
          return {
            id: course.id,
            title: course.name || 'Unnamed Course',
            code: course.code || 'N/A',
            status: mapStatus(course.status),
            startDate: formatDate(course.startDate),
            endDate: formatDate(course.endDate)
          };
        });
        
        setCourses(mappedCourses);
      } catch (err) {
        console.error('Error fetching instructed courses:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load instructed courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ON_GOING': { variant: 'success', text: 'ON GOING' },
      'PLANNED': { variant: 'primary', text: 'PLANNED' },
      'COMPLETED': { variant: 'secondary', text: 'COMPLETED' },
      'PAUSED': { variant: 'warning', text: 'PAUSED' },
      'CANCELLED': { variant: 'danger', text: 'CANCELLED' },
      'ARCHIVED': { variant: 'secondary', text: 'ARCHIVED' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status?.replace(/_/g, ' ') || status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };


  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(courses.map(course => course.status))];

  const filteredCourses = courses.filter(course => {
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(course.status);
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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
  };

  const handleViewCourse = (courseId) => {
    navigate(ROUTES.COURSES_DETAIL(courseId));
  };

  if (loading) {
    return <LoadingSkeleton rows={5} columns={7} />;
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

  if (courses.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No instructed courses found</h5>
          <p>Try adjusting your search criteria or create a new course.</p>
        </div>
      </div>
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
      <Row className="mb-3 form-mobile-stack search-filter-section">
        <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
          <SearchBar
            placeholder="Search courses, codes, or departments..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="search-bar-mobile"
          />
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
        <Col xs={12} lg={3} md={3}>
          <div className="text-end text-mobile-center">
            <small className="text-muted">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </small>
          </div>
        </Col>
      </Row>

      {filteredCourses.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h5 className="text-muted">No Courses Found</h5>
            <p className="text-muted">
              {searchTerm || filterStatus !== 'all' 
                ? 'No courses match your current filters.'
                : 'You haven\'t been assigned to instruct any courses yet.'
              }
            </p>
            {(searchTerm || selectedStatuses.length > 0) ? (
              <Button 
                variant="outline-primary" 
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            ) : null}
          </Card.Body>
        </Card>
      ) : (
        <div className="scrollable-table-container admin-table">
          <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
            <thead className="sticky-header">
              <tr>
                <SortableHeader columnKey="title" className="show-mobile">
                  Course
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
              {sortedData.map((course) => (
                <tr key={course.id}>
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <h6 className="mb-1 fw-medium">{course.title}</h6>
                      <small className="text-muted">
                        {course.code}
                      </small>
                      {course.startDate !== 'N/A' && course.endDate !== 'N/A' && (
                        <>
                          <br />
                          <small className="text-muted">
                            {course.startDate} - {course.endDate}
                          </small>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    {getStatusBadge(course.status)}
                  </td>
                  <td className="border-neutral-200 align-middle text-center">
                    <div className="d-flex justify-content-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewCourse(course.id)}
                      >
                        View Course Detail
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default InstructedCoursesList;
