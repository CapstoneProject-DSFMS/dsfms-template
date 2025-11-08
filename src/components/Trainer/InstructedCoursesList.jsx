import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Row, Col, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { Book, People, Calendar, Clock, Eye, PencilSquare, Funnel, Search, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, SearchBar } from '../Common';
import TrainerFilterPanel from './TrainerFilterPanel';
import useTableSort from '../../hooks/useTableSort';
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

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockCourses = [
          {
            id: 1,
            title: 'Aviation Safety Management',
            code: 'ASM-101',
            department: 'Safety & Security',
            status: 'active',
            startDate: '2024-01-15',
            endDate: '2024-03-15',
            enrolledTrainees: 25,
            maxTrainees: 30,
            totalSubjects: 8,
            completedSubjects: 3,
            instructor: 'Dr. John Smith',
            location: 'Training Center A',
            schedule: 'Mon, Wed, Fri 9:00-12:00'
          },
          {
            id: 2,
            title: 'Aircraft Maintenance Fundamentals',
            code: 'AMF-201',
            department: 'Maintenance',
            status: 'active',
            startDate: '2024-01-20',
            endDate: '2024-04-20',
            enrolledTrainees: 18,
            maxTrainees: 20,
            totalSubjects: 12,
            completedSubjects: 5,
            instructor: 'Jane Doe',
            location: 'Lab B',
            schedule: 'Tue, Thu 14:00-17:00'
          },
          {
            id: 3,
            title: 'Flight Operations Management',
            code: 'FOM-301',
            department: 'Operations',
            status: 'scheduled',
            startDate: '2024-02-01',
            endDate: '2024-05-01',
            enrolledTrainees: 0,
            maxTrainees: 15,
            totalSubjects: 10,
            completedSubjects: 0,
            instructor: 'Mike Johnson',
            location: 'Simulator Room',
            schedule: 'Mon-Fri 8:00-16:00'
          },
          {
            id: 4,
            title: 'Aviation Regulations & Compliance',
            code: 'ARC-401',
            department: 'Compliance',
            status: 'completed',
            startDate: '2023-10-01',
            endDate: '2023-12-15',
            enrolledTrainees: 22,
            maxTrainees: 25,
            totalSubjects: 6,
            completedSubjects: 6,
            instructor: 'Sarah Wilson',
            location: 'Conference Room C',
            schedule: 'Sat 9:00-17:00'
          },
          {
            id: 5,
            title: 'Emergency Response Procedures',
            code: 'ERP-501',
            department: 'Safety & Security',
            status: 'paused',
            startDate: '2024-01-10',
            endDate: '2024-02-28',
            enrolledTrainees: 12,
            maxTrainees: 20,
            totalSubjects: 4,
            completedSubjects: 1,
            instructor: 'David Brown',
            location: 'Training Center B',
            schedule: 'Wed, Fri 10:00-14:00'
          }
        ];
        
        setCourses(mockCourses);
      } catch (err) {
        setError('Failed to load instructed courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      scheduled: { variant: 'primary', text: 'Scheduled' },
      completed: { variant: 'secondary', text: 'Completed' },
      paused: { variant: 'warning', text: 'Paused' },
      cancelled: { variant: 'danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getProgressPercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getEnrollmentPercentage = (enrolled, max) => {
    return max > 0 ? Math.round((enrolled / max) * 100) : 0;
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(courses.map(course => course.status))];

  const filteredCourses = courses.filter(course => {
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(course.status);
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.department.toLowerCase().includes(searchTerm.toLowerCase());
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
    navigate(`/trainer/courses/${courseId}`);
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
            <Book size={64} className="text-muted mb-3" />
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
                <SortableHeader columnKey="department" className="show-mobile">
                  Department
                </SortableHeader>
                <SortableHeader columnKey="schedule" className="hide-mobile">
                  Schedule
                </SortableHeader>
                <SortableHeader columnKey="enrollment" className="show-mobile">
                  Enrollment
                </SortableHeader>
                <SortableHeader columnKey="progress" className="hide-mobile">
                  Progress
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
                        {course.code} • {course.location}
                      </small>
                      <br />
                      <small className="text-muted">
                        <Calendar size={12} className="me-1" />
                        {course.startDate} - {course.endDate}
                      </small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <span className="text-muted">{course.department}</span>
                  </td>
                  <td className="border-neutral-200 align-middle hide-mobile">
                    <div>
                      <div className="fw-medium">{course.schedule}</div>
                      <small className="text-muted">{course.instructor}</small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <div className="d-flex align-items-center">
                        <People size={16} className="me-2 text-muted" />
                        <span className="fw-medium">{course.enrolledTrainees}/{course.maxTrainees}</span>
                      </div>
                      <div className="progress mt-1" style={{ height: '4px' }}>
                        <div 
                          className="progress-bar bg-info" 
                          style={{ width: `${getEnrollmentPercentage(course.enrolledTrainees, course.maxTrainees)}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {getEnrollmentPercentage(course.enrolledTrainees, course.maxTrainees)}% full
                      </small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle hide-mobile">
                    <div>
                      <div className="d-flex align-items-center">
                        <Book size={16} className="me-2 text-muted" />
                        <span className="fw-medium">{course.completedSubjects}/{course.totalSubjects}</span>
                      </div>
                      <div className="progress mt-1" style={{ height: '4px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${getProgressPercentage(course.completedSubjects, course.totalSubjects)}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {getProgressPercentage(course.completedSubjects, course.totalSubjects)}% complete
                      </small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    {getStatusBadge(course.status)}
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
                          label: 'View Course Detail',
                          icon: <Eye />,
                          onClick: () => handleViewCourse(course.id)
                        }
                      ]}
                    />
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
