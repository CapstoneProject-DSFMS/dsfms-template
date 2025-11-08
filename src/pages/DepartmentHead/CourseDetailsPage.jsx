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

// Subject Table Component
const SubjectTable = ({ subjects, loading, onView, onEdit }) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(subjects);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={6} />;
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No subjects found</h5>
          <p>No subjects are available in this course.</p>
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
              Subject Title
            </SortableHeader>
            <SortableHeader columnKey="code" className="show-mobile">
              Subject Code
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <SortableHeader columnKey="enrolledCount" className="hide-mobile">
              Enrolled
            </SortableHeader>
            <SortableHeader columnKey="duration" className="hide-mobile">
              Duration
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
          {sortedData.map((subject, index) => (
            <SubjectRow
              key={subject.id}
              subject={subject}
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

// Subject Row Component
const SubjectRow = ({ subject, index, onView, onEdit }) => {
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

  const getActionItems = (subject) => [
    {
      label: 'View Details',
      icon: <Eye />,
      onClick: () => onView(subject),
      permission: API_PERMISSIONS.SUBJECTS.VIEW_DETAIL
    },
    {
      label: 'Edit Subject',
      icon: <Pencil />,
      onClick: () => onEdit(subject),
      permission: API_PERMISSIONS.SUBJECTS.UPDATE
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
          <h6 className="mb-1 fw-medium">{subject.title}</h6>
          <small className="text-muted">{subject.description}</small>
        </div>
      </td>
      <td className="align-middle show-mobile">
        <span className="text-dark fw-medium">{subject.code}</span>
      </td>
      <td className="align-middle show-mobile">
        {getStatusBadge(subject.status)}
      </td>
      <td className="align-middle hide-mobile">
        <div className="d-flex align-items-center">
          <People size={16} className="me-1 text-muted" />
          <span>{subject.enrolledCount}</span>
        </div>
      </td>
      <td className="align-middle hide-mobile">
        <div className="text-muted small">
          {subject.duration} hours
        </div>
      </td>
      <td className="align-middle text-center show-mobile">
        <PermissionWrapper 
          permissions={[API_PERMISSIONS.SUBJECTS.VIEW_DETAIL, API_PERMISSIONS.SUBJECTS.UPDATE]}
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
            items={getActionItems(subject)}
          />
        </PermissionWrapper>
      </td>
    </tr>
  );
};

// Trainee Table Component
const TraineeTable = ({ trainees, loading, onView, onEdit }) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(trainees);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={6} />;
  }

  if (trainees.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No trainees found</h5>
          <p>No trainees are enrolled in this course.</p>
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
            <SortableHeader columnKey="name" className="show-mobile">
              Trainee Name
            </SortableHeader>
            <SortableHeader columnKey="email" className="show-mobile">
              Email
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <SortableHeader columnKey="enrollmentDate" className="hide-mobile">
              Enrollment Date
            </SortableHeader>
            <SortableHeader columnKey="progress" className="hide-mobile">
              Progress
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
          {sortedData.map((trainee, index) => (
            <TraineeRow
              key={trainee.id}
              trainee={trainee}
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

// Trainee Row Component
const TraineeRow = ({ trainee, index, onView, onEdit }) => {
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

  const getActionItems = (trainee) => [
    {
      label: 'View Details',
      icon: <Eye />,
      onClick: () => onView(trainee),
      permission: API_PERMISSIONS.TRAINEES.VIEW_DETAIL
    },
    {
      label: 'Edit Trainee',
      icon: <Pencil />,
      onClick: () => onEdit(trainee),
      permission: API_PERMISSIONS.TRAINEES.UPDATE
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
          <h6 className="mb-1 fw-medium">{trainee.name}</h6>
          <small className="text-muted">{trainee.department}</small>
        </div>
      </td>
      <td className="align-middle show-mobile">
        <span className="text-dark">{trainee.email}</span>
      </td>
      <td className="align-middle show-mobile">
        {getStatusBadge(trainee.status)}
      </td>
      <td className="align-middle hide-mobile">
        <div className="text-muted small">
          {new Date(trainee.enrollmentDate).toLocaleDateString()}
        </div>
      </td>
      <td className="align-middle hide-mobile">
        <div className="fw-medium">
          {trainee.progress}%
        </div>
      </td>
      <td className="align-middle text-center show-mobile">
        <PermissionWrapper 
          permissions={[API_PERMISSIONS.TRAINEES.VIEW_DETAIL, API_PERMISSIONS.TRAINEES.UPDATE]}
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
            items={getActionItems(trainee)}
          />
        </PermissionWrapper>
      </td>
    </tr>
  );
};

// Main Component
const CourseDetailsPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subjects');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockCourse = {
      id: courseId,
      title: 'Software Development Fundamentals',
      code: 'SDF-001',
      description: 'Introduction to software development principles and practices',
      status: 'active',
      enrolledCount: 25,
      startDate: '2024-01-15T09:00:00Z',
      department: 'IT Department'
    };

    const mockSubjects = [
      {
        id: 1,
        title: 'Programming Basics',
        code: 'PB-001',
        description: 'Introduction to programming concepts',
        status: 'active',
        enrolledCount: 25,
        duration: 40
      },
      {
        id: 2,
        title: 'Data Structures',
        code: 'DS-002',
        description: 'Understanding data structures and algorithms',
        status: 'active',
        enrolledCount: 25,
        duration: 60
      },
      {
        id: 3,
        title: 'Database Design',
        code: 'DD-003',
        description: 'Database design principles and SQL',
        status: 'pending',
        enrolledCount: 25,
        duration: 50
      }
    ];

    const mockTrainees = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@company.com',
        department: 'IT Department',
        status: 'active',
        enrollmentDate: '2024-01-15T09:00:00Z',
        progress: 75
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        department: 'IT Department',
        status: 'active',
        enrollmentDate: '2024-01-15T09:00:00Z',
        progress: 60
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike.wilson@company.com',
        department: 'IT Department',
        status: 'active',
        enrollmentDate: '2024-01-16T10:00:00Z',
        progress: 45
      }
    ];
    
    setTimeout(() => {
      setCourse(mockCourse);
      setSubjects(mockSubjects);
      setTrainees(mockTrainees);
      setLoading(false);
    }, 1000);
  }, [courseId]);

  const handleViewSubject = (subject) => {
    navigate(`/department-head/courses/${courseId}/subjects/${subject.id}`);
  };

  const handleEditSubject = (subject) => {
    console.log('Edit subject:', subject);
    // TODO: Implement edit subject functionality
  };

  const handleViewTrainee = (trainee) => {
    navigate(`/department-head/trainees/${trainee.id}`);
  };

  const handleEditTrainee = (trainee) => {
    console.log('Edit trainee:', trainee);
    // TODO: Implement edit trainee functionality
  };

  const tabs = [
    {
      id: 'subjects',
      title: 'Subject List',
      icon: Book,
      component: <SubjectTable subjects={subjects} loading={loading} onView={handleViewSubject} onEdit={handleEditSubject} />
    },
    {
      id: 'trainees',
      title: 'Trainee List',
      icon: People,
      component: <TraineeTable trainees={trainees} loading={loading} onView={handleViewTrainee} onEdit={handleEditTrainee} />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading course details...</p>
        </div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Course Not Found</Alert.Heading>
          <p>The requested course could not be found.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 course-details-page">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <button 
              className="btn btn-link p-0 me-3"
              onClick={() => navigate('/department-head/my-department-details')}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="mb-1">{course.title}</h2>
              <p className="text-muted mb-0">{course.code} • {course.department}</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tabs */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0">
            <Card.Header className="department-head-section-header bg-primary text-white border-0 p-0">
              <div className="custom-tabs-container">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      className={`custom-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <IconComponent size={16} className="me-2" />
                      {tab.title}
                    </button>
                  );
                })}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {activeTabData && activeTabData.component}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetailsPage;
