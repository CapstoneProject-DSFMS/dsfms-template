import React, { useState, useEffect, useMemo } from 'react';
import { Table, Badge, Spinner, Row, Col, Nav, Tab } from 'react-bootstrap';
import { Eye, Book, ThreeDotsVertical, Clock, PlayCircle, CheckCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';
import { LoadingSkeleton, SortIcon, SearchBar } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
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
          return course.status === 'PLANNED';
        case 'ongoing':
          return course.status === 'ON-GOING';
        case 'completed':
          return course.status === 'COMPLETED';
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
      
      // Hardcoded courses data
      const mockCourses = [
        {
          id: '1',
          code: 'SAF001',
          name: 'Safety Procedures Training',
          description: 'Basic safety procedures and emergency protocols',
          level: 'BEGINNER',
          status: 'ON-GOING',
          startDate: '2024-01-15T09:00:00.000Z',
          endDate: '2024-03-15T17:00:00.000Z',
          progress: 75,
          department: {
            id: 1,
            name: 'Safety Department',
            code: 'SAF'
          }
        },
        {
          id: '2',
          code: 'FLT002',
          name: 'Flight Operations',
          description: 'Advanced flight operations and navigation',
          level: 'INTERMEDIATE',
          status: 'ON-GOING',
          startDate: '2024-02-01T08:00:00.000Z',
          endDate: '2024-04-01T16:00:00.000Z',
          progress: 45,
          department: {
            id: 2,
            name: 'Flight Operations',
            code: 'FO'
          }
        },
        {
          id: '3',
          code: 'EMG003',
          name: 'Emergency Response',
          description: 'Emergency response and crisis management',
          level: 'ADVANCED',
          status: 'COMPLETED',
          startDate: '2023-11-01T09:00:00.000Z',
          endDate: '2023-12-15T17:00:00.000Z',
          progress: 100,
          department: {
            id: 3,
            name: 'Emergency Services',
            code: 'EMG'
          }
        },
        {
          id: '4',
          code: 'TECH004',
          name: 'Technical Systems',
          description: 'Aircraft technical systems and maintenance',
          level: 'INTERMEDIATE',
          status: 'PLANNED',
          startDate: '2024-03-01T09:00:00.000Z',
          endDate: '2024-05-01T17:00:00.000Z',
          progress: 0,
          department: {
            id: 4,
            name: 'Technical Department',
            code: 'TECH'
          }
        },
        {
          id: '5',
          code: 'NAV005',
          name: 'Navigation Systems',
          description: 'Advanced navigation and GPS systems',
          level: 'ADVANCED',
          status: 'COMPLETED',
          startDate: '2023-09-01T09:00:00.000Z',
          endDate: '2023-10-15T17:00:00.000Z',
          progress: 100,
          department: {
            id: 5,
            name: 'Navigation Department',
            code: 'NAV'
          }
        },
        {
          id: '6',
          code: 'COMM006',
          name: 'Communication Protocols',
          description: 'Radio communication and protocols',
          level: 'BEGINNER',
          status: 'PLANNED',
          startDate: '2024-04-01T09:00:00.000Z',
          endDate: '2024-06-01T17:00:00.000Z',
          progress: 0,
          department: {
            id: 6,
            name: 'Communication Department',
            code: 'COMM'
          }
        },
        {
          id: '7',
          code: 'MAINT007',
          name: 'Aircraft Maintenance',
          description: 'Routine maintenance procedures',
          level: 'INTERMEDIATE',
          status: 'ON-GOING',
          startDate: '2024-01-20T08:00:00.000Z',
          endDate: '2024-03-20T16:00:00.000Z',
          progress: 60,
          department: {
            id: 7,
            name: 'Maintenance Department',
            code: 'MAINT'
          }
        },
        {
          id: '8',
          code: 'ARCH008',
          name: 'Archived Course',
          description: 'This course has been archived',
          level: 'BEGINNER',
          status: 'ARCHIVED',
          startDate: '2023-06-01T09:00:00.000Z',
          endDate: '2023-08-01T17:00:00.000Z',
          progress: 100,
          department: {
            id: 8,
            name: 'Archived Department',
            code: 'ARCH'
          }
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error loading trainee courses:', error);
      toast.error('Failed to load enrolled courses');
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
        className={`border-neutral-200 text-primary-custom fw-semibold ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.08)';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{ 
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '600' : '500'
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
              background: 'linear-gradient(90deg, var(--bs-primary), var(--bs-info))',
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
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="upcoming" className="d-flex align-items-center">
                <Clock className="me-2" size={16} />
                Upcoming ({getCoursesByTab('upcoming').length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="ongoing" className="d-flex align-items-center">
                <PlayCircle className="me-2" size={16} />
                On-going ({getCoursesByTab('ongoing').length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="completed" className="d-flex align-items-center">
                <CheckCircle className="me-2" size={16} />
                Completed ({getCoursesByTab('completed').length})
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey={activeTab}>
              {/* Search and Filters */}
              <Row className="mb-3 form-mobile-stack search-filter-section">
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
        </Tab.Container>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="upcoming" className="d-flex align-items-center">
              <Clock className="me-2" size={16} />
              Upcoming ({getCoursesByTab('upcoming').length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="ongoing" className="d-flex align-items-center">
              <PlayCircle className="me-2" size={16} />
              On-going ({getCoursesByTab('ongoing').length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="completed" className="d-flex align-items-center">
              <CheckCircle className="me-2" size={16} />
              Completed ({getCoursesByTab('completed').length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey={activeTab}>
            {/* Search and Filters */}
            <Row className="mb-3 form-mobile-stack search-filter-section">
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

      <div className="scrollable-table-container admin-table course-list-table-no-borders">
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
          {sortedData.map((course, index) => (
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
                <div className="d-flex align-items-center">
                  <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">{course.progress || 0}%</small>
                </div>
              </td>
              <td className="border-neutral-200 align-middle text-center show-mobile">
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
                      onClick: () => handleViewCourse(course)
                    }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default TraineeCourseList;
