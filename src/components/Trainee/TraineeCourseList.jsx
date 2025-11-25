import React, { useState, useEffect, useMemo } from 'react';
import { Table, Badge, Spinner, Row, Col, Nav, Tab, Card } from 'react-bootstrap';
import { Eye, Book, ThreeDotsVertical, Clock, PlayCircle, CheckCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';
import courseAPI from '../../api/course';
import { LoadingSkeleton, SortIcon, SearchBar, PermissionWrapper } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import CourseFilterPanel from './CourseFilterPanel';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

// Add custom CSS to remove table borders
const courseTableStyles = `
  .course-list-table-no-borders .table,
  .course-list-table-no-borders .table td,
  .course-list-table-no-borders .table th,
  .course-list-table-no-borders .table tbody tr,
  .course-list-table-no-borders .table thead tr {
    border: none !important;
    border-top: none !important;
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
  }
  .course-list-table-no-borders .table tbody tr {
    border-bottom: 1px solid #f0f0f0 !important;
  }
  .course-list-table-no-borders .table tbody tr:last-child {
    border-bottom: none !important;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = courseTableStyles;
  document.head.appendChild(styleSheet);
}

const TraineeCourseList = ({ traineeId }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Get unique values from courses
  const uniqueLevels = [...new Set(courses.map(course => course.level).filter(Boolean))];
  const uniqueStatuses = [...new Set(courses.map(course => course.status).filter(Boolean))];

  // Filter courses by tab based on status
  const getCoursesByTab = (tab) => {
    return courses.filter(course => {
      switch (tab) {
        case 'upcoming':
          return course.status === 'PLANNED' || course.status === 'PLAN';
        case 'ongoing':
          return course.status === 'ON-GOING' || course.status === 'ONGOING' || course.status === 'ON_GOING';
        case 'completed':
          return course.status === 'COMPLETED' || course.status === 'COMPLETE';
        default:
          return true;
      }
    });
  };

  const tabCourses = getCoursesByTab(activeTab);
  
  // Filter and search logic
  const filteredCourses = useMemo(() => {
    return tabCourses.filter(course => {
      const matchesSearch = !searchTerm || 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevels = selectedLevels.length === 0 || selectedLevels.includes(course.level);
      const matchesStatuses = selectedStatuses.length === 0 || selectedStatuses.includes(course.status);
      
      return matchesSearch && matchesLevels && matchesStatuses;
    });
  }, [tabCourses, searchTerm, selectedLevels, selectedStatuses]);
  
  const { sortedData, sortConfig, handleSort } = useTableSort(filteredCourses);

  useEffect(() => {
    if (traineeId) {
      loadTraineeCourses();
    }
  }, [traineeId]);

  const loadTraineeCourses = async () => {
    try {
      setLoading(true);
      
      // Call API to get trainee enrollments with status=ENROLLED
      const response = await courseAPI.getTraineeEnrollmentsByStatus(traineeId, 'ENROLLED');
      
      // API response structure: { enrollments: [...], totalCount: number }
      const enrollments = response?.enrollments || response?.data?.enrollments || response?.data || [];
      
      if (!Array.isArray(enrollments) || enrollments.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }
      
      // Group enrollments by course (since multiple subjects can belong to same course)
      const coursesMap = new Map();
      
      enrollments.forEach((item) => {
        const course = item.subject?.course;
        const subject = item.subject;
        
        if (!course || !course.id || !subject) return;
        
        const courseId = course.id;
        
        if (!coursesMap.has(courseId)) {
          // Initialize course with first subject's data
          coursesMap.set(courseId, {
            id: courseId,
            code: course.code || `COURSE-${courseId.substring(0, 8).toUpperCase()}`,
            name: course.name || 'Unnamed Course',
            description: '', // Course description not in API
            level: 'BEGINNER', // Default level, not in API
            status: 'PLANNED', // Will be calculated
            startDate: null,
            endDate: null,
            subjects: []
          });
        }
        
        const courseData = coursesMap.get(courseId);
        
        // Add subject to course
        courseData.subjects.push({
          id: subject.id,
          code: subject.code,
          name: subject.name,
          status: subject.status,
          startDate: subject.startDate,
          endDate: subject.endDate
        });
        
        // Update course dates (earliest start, latest end)
        if (subject.startDate) {
          const subjectStart = new Date(subject.startDate);
          if (!courseData.startDate || subjectStart < new Date(courseData.startDate)) {
            courseData.startDate = subject.startDate;
          }
        }
        
        if (subject.endDate) {
          const subjectEnd = new Date(subject.endDate);
          if (!courseData.endDate || subjectEnd > new Date(courseData.endDate)) {
            courseData.endDate = subject.endDate;
          }
        }
      });
      
      // Convert map to array and calculate progress
      const mappedCourses = Array.from(coursesMap.values()).map((course) => {
        // Calculate progress based on completed subjects
        const totalSubjects = course.subjects.length;
        const completedSubjects = course.subjects.filter(s => 
          s.status === 'COMPLETED' || s.status === 'COMPLETE'
        ).length;
        const progress = totalSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : 0;
        
        // Determine course status based on subjects
        let courseStatus = 'PLANNED';
        const hasOngoing = course.subjects.some(s => 
          s.status === 'ON-GOING' || s.status === 'ONGOING' || s.status === 'ON_GOING'
        );
        const allCompleted = course.subjects.every(s => 
          s.status === 'COMPLETED' || s.status === 'COMPLETE'
        );
        
        if (allCompleted && totalSubjects > 0) {
          courseStatus = 'COMPLETED';
        } else if (hasOngoing) {
          courseStatus = 'ON-GOING';
        } else {
          courseStatus = 'PLANNED';
        }
        
        return {
          id: course.id,
          code: course.code,
          name: course.name,
          description: course.description || '',
          level: course.level || 'BEGINNER',
          status: courseStatus,
          startDate: course.startDate,
          endDate: course.endDate,
          progress: progress,
          department: null // Not available in API response
        };
      });
      
      setCourses(mappedCourses);
    } catch (error) {
      console.error('Error loading trainee courses:', error);
      toast.error(error.response?.data?.message || 'Failed to load enrolled courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ON-GOING': { variant: 'success', text: 'On-going' },
      'ARCHIVED': { variant: 'secondary', text: 'Archived' },
      'PLANNED': { variant: 'info', text: 'Planned' },
      'COMPLETED': { variant: 'primary', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getLevelBadge = (level) => {
    const levelConfig = {
      'BEGINNER': { variant: 'success', text: 'Beginner' },
      'INTERMEDIATE': { variant: 'warning', text: 'Intermediate' },
      'ADVANCED': { variant: 'danger', text: 'Advanced' }
    };
    
    const config = levelConfig[level] || { variant: 'secondary', text: level };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleViewCourse = (course) => {
    navigate(`/trainee/${traineeId}/course/${course.id}`);
  };

  const handleEditCourse = (course) => {
    // For trainee, this might be to view course details or enroll in subjects
    navigate(`/trainee/${traineeId}/course/${course.id}`);
  };

  // Filter handlers
  const handleLevelToggle = (level) => {
    if (level === 'clear') {
      setSelectedLevels([]);
    } else {
      setSelectedLevels(prev => 
        prev.includes(level) 
          ? prev.filter(l => l !== level)
          : [...prev, level]
      );
    }
  };
  
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
    setSelectedLevels([]);
    setSelectedStatuses([]);
    setSearchTerm('');
  };

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

  if (loading) {
    return <LoadingSkeleton rows={5} columns={8} />;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No enrolled courses</h5>
          <p>You are not enrolled in any courses yet.</p>
        </div>
      </div>
    );
  }

  if (filteredCourses.length === 0 && (searchTerm || selectedLevels.length > 0 || selectedStatuses.length > 0)) {
    return (
      <div>
        {/* Tabs */}
        <Card className="border-0 shadow-sm mb-2">
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Card.Header className="border-bottom py-2 bg-primary">
              <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link 
                    eventKey="upcoming" 
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'upcoming' ? '600' : '400',
                      opacity: activeTab === 'upcoming' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <Clock className="me-2" size={16} />
                    Upcoming ({getCoursesByTab('upcoming').length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="ongoing" 
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'ongoing' ? '600' : '400',
                      opacity: activeTab === 'ongoing' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <PlayCircle className="me-2" size={16} />
                    On-going ({getCoursesByTab('ongoing').length})
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
                      fontWeight: activeTab === 'completed' ? '600' : '400',
                      opacity: activeTab === 'completed' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <CheckCircle className="me-2" size={16} />
                    Completed ({getCoursesByTab('completed').length})
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <Card.Body className="p-0">
              <Tab.Content>
                <Tab.Pane eventKey={activeTab}>
                  {/* Search and Filters */}
                  <Row className="mb-3 form-mobile-stack search-filter-section p-3">
                    <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
                      <SearchBar
                        placeholder="Search courses by name, code, or description..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="search-bar-mobile"
                      />
                    </Col>
                    <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
                      <CourseFilterPanel
                        uniqueLevels={uniqueLevels}
                        uniqueStatuses={uniqueStatuses}
                        selectedLevels={selectedLevels}
                        selectedStatuses={selectedStatuses}
                        onLevelToggle={handleLevelToggle}
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
                  
                  <div className="text-center py-5">
                    <div className="text-muted">
                      <h5>No courses found</h5>
                      <p>Try adjusting your search criteria or filters.</p>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleClearFilters}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Tab.Container>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <Card className="border-0 shadow-sm mb-2">
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Card.Header className="border-bottom py-2 bg-primary">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link 
                  eventKey="upcoming" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'upcoming' ? '600' : '400',
                    opacity: activeTab === 'upcoming' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <Clock className="me-2" size={16} />
                  Upcoming ({getCoursesByTab('upcoming').length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="ongoing" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'ongoing' ? '600' : '400',
                    opacity: activeTab === 'ongoing' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <PlayCircle className="me-2" size={16} />
                  On-going ({getCoursesByTab('ongoing').length})
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
                    fontWeight: activeTab === 'completed' ? '600' : '400',
                    opacity: activeTab === 'completed' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <CheckCircle className="me-2" size={16} />
                  Completed ({getCoursesByTab('completed').length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-0">
            <Tab.Content>
              <Tab.Pane eventKey={activeTab}>
                {/* Search and Filters */}
                <Row className="mb-3 form-mobile-stack search-filter-section p-3">
              <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
                <SearchBar
                  placeholder="Search courses by name, code, or description..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="search-bar-mobile"
                />
              </Col>
              <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
                <CourseFilterPanel
                  uniqueLevels={uniqueLevels}
                  uniqueStatuses={uniqueStatuses}
                  selectedLevels={selectedLevels}
                  selectedStatuses={selectedStatuses}
                  onLevelToggle={handleLevelToggle}
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

      <div className="scrollable-table-container admin-table course-list-table-no-borders" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            <SortableHeader columnKey="code" className="show-mobile">
              Course Code
            </SortableHeader>
            <SortableHeader columnKey="name" className="show-mobile">
              Course Name
            </SortableHeader>
            <SortableHeader columnKey="level" className="show-mobile">
              Level
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <SortableHeader columnKey="startDate" className="hide-mobile">
              Start Date
            </SortableHeader>
            <SortableHeader columnKey="endDate" className="hide-mobile">
              End Date
            </SortableHeader>
            <SortableHeader columnKey="progress" className="show-mobile">
              Progress
            </SortableHeader>
            <th className="border-neutral-200 text-primary-custom fw-semibold text-center show-mobile">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-5" style={{ border: 'none' }}>
                <div className="text-muted">
                  <Book size={48} className="mb-3" style={{ opacity: 0.5 }} />
                  <h5 className="mb-2">No courses found</h5>
                  <p className="mb-0">
                    {searchTerm || selectedLevels.length > 0 || selectedStatuses.length > 0
                      ? 'Try adjusting your search criteria or filters.'
                      : activeTab === 'upcoming'
                      ? 'You have no upcoming courses.'
                      : activeTab === 'ongoing'
                      ? 'You have no on-going courses.'
                      : 'You have no completed courses.'}
                  </p>
                  {(searchTerm || selectedLevels.length > 0 || selectedStatuses.length > 0) && (
                    <button 
                      className="btn btn-outline-primary btn-sm mt-3"
                      onClick={handleClearFilters}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((course, index) => (
              <tr 
                key={course.id}
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
                  <Badge 
                    bg="primary" 
                    className="px-2 py-1"
                    style={{ 
                      fontSize: '0.75rem'
                    }}
                  >
                    {course.code}
                  </Badge>
                </td>
                <td className="border-neutral-200 align-middle show-mobile">
                  <div className="fw-medium text-dark">
                    {course.name}
                  </div>
                  <small className="text-muted">{course.description}</small>
                </td>
                <td className="border-neutral-200 align-middle show-mobile">
                  {getLevelBadge(course.level)}
                </td>
                <td className="border-neutral-200 align-middle show-mobile">
                  {getStatusBadge(course.status)}
                </td>
                <td className="border-neutral-200 align-middle hide-mobile">
                  <span className="text-dark">
                    {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A'}
                  </span>
                </td>
                <td className="border-neutral-200 align-middle hide-mobile">
                  <span className="text-dark">
                    {course.endDate ? new Date(course.endDate).toLocaleDateString() : 'N/A'}
                  </span>
                </td>
                <td className="border-neutral-200 align-middle show-mobile">
                  <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                    <small className="text-muted" style={{ 
                      position: 'absolute',
                      left: 0,
                      width: '50px',
                      textAlign: 'left',
                      zIndex: 1
                    }}>{course.progress || 0}%</small>
                    <div className="progress" style={{ height: '6px', flex: '1 1 auto', marginLeft: '55px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="border-neutral-200 align-middle text-center show-mobile">
                  <PermissionWrapper 
                    permission={PERMISSION_IDS.VIEW_COURSE_DETAILS}
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
                          label: 'View Course Details',
                          icon: <Eye />,
                          onClick: () => handleViewCourse(course),
                          permission: PERMISSION_IDS.VIEW_COURSE_DETAILS
                        }
                      ]}
                    />
                  </PermissionWrapper>
                </td>
              </tr>
            ))
          )}
        </tbody>
        </Table>
      </div>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>
    </div>
  );
};

export default TraineeCourseList;
