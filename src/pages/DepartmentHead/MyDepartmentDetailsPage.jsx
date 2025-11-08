import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { 
  ArrowLeft, 
  Book, 
  People, 
  CalendarEvent,
  CheckCircle,
  Clock,
  ThreeDotsVertical,
  Eye,
  Pencil
} from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSkeleton, SearchBar, PermissionWrapper, AdminTable, SortIcon } from '../../components/Common';
import PortalUnifiedDropdown from '../../components/Common/PortalUnifiedDropdown';
import useTableSort from '../../hooks/useTableSort';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import '../../styles/scrollable-table.css';
import '../../styles/department-head.css';

// Course Table Component
const CourseTable = ({ courses, loading, onView, onEdit }) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(courses);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={6} />;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No courses found</h5>
          <p>No courses are available in your department.</p>
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
        onClick={() => handleSort(columnKey)}
        style={{ 
          cursor: 'pointer',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)'
        }}
      >
        <div className="d-flex align-items-center">
          <span style={{ color: 'white' }}>{children}</span>
          <SortIcon 
            direction={direction}
            className="ms-1"
            color="white"
          />
        </div>
      </th>
    );
  };

  return (
    <div className="scrollable-table-container admin-table">
      <table className="table table-hover mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            <SortableHeader columnKey="title" className="show-mobile">
              Course Title
            </SortableHeader>
            <SortableHeader columnKey="code" className="show-mobile">
              Course Code
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <SortableHeader columnKey="enrolledCount" className="hide-mobile">
              Enrolled
            </SortableHeader>
            <SortableHeader columnKey="startDate" className="hide-mobile">
              Start Date
            </SortableHeader>
            <th 
              className="fw-semibold text-center show-mobile"
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
          {sortedData.map((course, index) => (
            <CourseRow
              key={course.id}
              course={course}
              index={index}
              onView={onView}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Course Row Component
const CourseRow = ({ course, index, onView, onEdit }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', icon: CheckCircle },
      inactive: { variant: 'secondary', icon: Clock },
      pending: { variant: 'warning', icon: Clock }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getActionItems = (course) => [
    {
      label: 'View Details',
      icon: <Eye />,
      onClick: () => onView(course),
      permission: API_PERMISSIONS.COURSES.VIEW_DETAIL
    },
    {
      label: 'Edit Course',
      icon: <Pencil />,
      onClick: () => onEdit(course),
      permission: API_PERMISSIONS.COURSES.UPDATE
    }
  ];

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
      <td className="align-middle show-mobile">
        <div>
          <h6 className="mb-1 fw-medium">{course.title}</h6>
          <small className="text-muted">{course.description}</small>
        </div>
      </td>
      <td className="align-middle show-mobile">
        <span className="text-dark fw-medium">{course.code}</span>
      </td>
      <td className="align-middle show-mobile">
        {getStatusBadge(course.status)}
      </td>
      <td className="align-middle hide-mobile">
        <div className="d-flex align-items-center">
          <People size={16} className="me-1 text-muted" />
          <span>{course.enrolledCount}</span>
        </div>
      </td>
      <td className="align-middle hide-mobile">
        <div className="text-muted small">
          {new Date(course.startDate).toLocaleDateString()}
        </div>
      </td>
      <td className="align-middle text-center show-mobile">
        <PermissionWrapper 
          permissions={[API_PERMISSIONS.COURSES.VIEW_DETAIL, API_PERMISSIONS.COURSES.UPDATE]}
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
            items={getActionItems(course)}
          />
        </PermissionWrapper>
      </td>
    </tr>
  );
};

// Main Component
const MyDepartmentDetailsPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('subjects');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockCourses = [
      {
        id: 1,
        title: 'Software Development Fundamentals',
        code: 'SDF-001',
        description: 'Introduction to software development principles and practices',
        status: 'active',
        enrolledCount: 25,
        startDate: '2024-01-15T09:00:00Z',
        department: 'IT Department'
      },
      {
        id: 2,
        title: 'Database Management Systems',
        code: 'DMS-002',
        description: 'Comprehensive course on database design and management',
        status: 'active',
        enrolledCount: 18,
        startDate: '2024-01-20T10:00:00Z',
        department: 'IT Department'
      },
      {
        id: 3,
        title: 'Web Development Advanced',
        code: 'WDA-003',
        description: 'Advanced web development techniques and frameworks',
        status: 'pending',
        enrolledCount: 12,
        startDate: '2024-02-01T09:00:00Z',
        department: 'IT Department'
      }
    ];
    
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    navigate(`/department-head/my-department-details/${course.id}`);
  };

  const handleEditCourse = (course) => {
    // Handle edit course logic
    console.log('Edit course:', course);
  };

  const tabs = [
    {
      id: 'subjects',
      title: 'Subject List',
      icon: Book,
      component: <div>Subject List Component</div>
    },
    {
      id: 'trainees',
      title: 'Trainee List',
      icon: People,
      component: <div>Trainee List Component</div>
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading department details...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 my-department-details-page">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
            <Col xs={12} className="mt-2 mt-md-0 mb-3">
              <div className="d-flex align-items-center mb-3">
                <button 
                  className="btn btn-link p-0 me-3"
                  onClick={() => navigate('/department-head/dashboard')}
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="mb-1">My Department Details</h2>
                  <p className="text-muted mb-0">Manage courses, subjects, and trainees in your department</p>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Courses Section */}
          <Card className="border-0 shadow-sm mb-0">
            <Card.Header className="department-head-section-header bg-primary text-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-white">
                  <Book className="me-2" />
                  Courses ({filteredCourses.length})
                </h5>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Search and Filters */}
              <Row className="mb-3 form-mobile-stack search-filter-section">
                <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
                  <SearchBar
                    placeholder="Search courses by title, code, or description..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="search-bar-mobile"
                  />
                </Col>
                <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
                  <select 
                    className="form-select filter-panel-mobile"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </Col>
                <Col xs={12} lg={3} md={3}>
                  <div className="text-end text-mobile-center">
                    <small className="text-muted">
                      {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                    </small>
                  </div>
                </Col>
              </Row>

              {/* Courses Table */}
              <AdminTable
            data={filteredCourses}
            loading={loading}
            columns={[
              { key: 'title', title: 'Course Title', className: 'show-mobile', sortable: true },
              { key: 'code', title: 'Course Code', className: 'show-mobile', sortable: true },
              { key: 'status', title: 'Status', className: 'show-mobile', sortable: true },
              { key: 'enrolledCount', title: 'Enrolled', className: 'hide-mobile', sortable: true },
              { key: 'startDate', title: 'Start Date', className: 'hide-mobile', sortable: true },
              { title: 'Actions', className: 'text-center show-mobile', sortable: false }
            ]}
            renderRow={(course, index) => (
              <CourseRow
                key={course.id}
                course={course}
                index={index}
                onView={handleViewCourse}
                onEdit={handleEditCourse}
              />
            )}
            emptyMessage="No courses found"
            emptyDescription="Try adjusting your search criteria."
          />
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MyDepartmentDetailsPage;
