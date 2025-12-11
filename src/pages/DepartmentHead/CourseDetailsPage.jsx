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
  Eye
} from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSkeleton, SearchBar, PermissionWrapper, AdminTable, SortIcon } from '../../components/Common';
import PortalUnifiedDropdown from '../../components/Common/PortalUnifiedDropdown';
import useTableSort from '../../hooks/useTableSort';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { ROUTES } from '../../constants/routes';
import courseAPI from '../../api/course';
import '../../styles/scrollable-table.css';
import '../../styles/department-head.css';

// Subject Table Component
const SubjectTable = ({ subjects, loading, onView }) => {
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
            <SortableHeader columnKey="duration" className="hide-mobile">
              Duration
            </SortableHeader>
            <SortableHeader columnKey="method" className="hide-mobile">
              Method
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
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Subject Row Component
const SubjectRow = ({ subject, index, onView }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      ON_GOING: { variant: 'primary', icon: CheckCircle },
      PLANNED: { variant: 'info', icon: Clock },
      COMPLETED: { variant: 'success', icon: CheckCircle },
      CANCELLED: { variant: 'secondary', icon: Clock },
      active: { variant: 'success', icon: CheckCircle },
      inactive: { variant: 'secondary', icon: Clock },
      pending: { variant: 'warning', icon: Clock }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const getActionItems = (subject) => [
    {
      label: 'View Details',
      icon: <Eye />,
      onClick: () => onView(subject),
      permission: PERMISSION_IDS.VIEW_SUBJECT_DETAILS
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
          <h6 className="mb-1 fw-medium">{subject.name}</h6>
          <small className="text-muted">{subject.description || ''}</small>
        </div>
      </td>
      <td className="align-middle show-mobile">
        <span className="text-dark fw-medium">{subject.code}</span>
      </td>
      <td className="align-middle show-mobile">
        {getStatusBadge(subject.status)}
      </td>
      <td className="align-middle hide-mobile">
        <div className="text-muted small">
          {subject.duration || 0} hours
        </div>
      </td>
      <td className="align-middle hide-mobile">
        <div className="text-muted small">
          {subject.method || 'N/A'}
        </div>
      </td>
      <td className="align-middle text-center show-mobile">
        <PermissionWrapper 
          permissions={[PERMISSION_IDS.VIEW_SUBJECT_DETAILS]}
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
const TraineeTable = ({ trainees, loading, onView }) => {
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
            <SortableHeader columnKey="eid" className="hide-mobile">
              Employee ID
            </SortableHeader>
            <SortableHeader columnKey="email" className="show-mobile">
              Email
            </SortableHeader>
            <SortableHeader columnKey="enrollmentCount" className="hide-mobile">
              Enrollments
            </SortableHeader>
            <SortableHeader columnKey="batches" className="hide-mobile">
              Batches
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
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Trainee Row Component
const TraineeRow = ({ trainee, index, onView }) => {
  const getActionItems = (trainee) => [
    {
      label: 'View Details',
      icon: <Eye />,
      onClick: () => onView(trainee),
      permission: PERMISSION_IDS.VIEW_USER_IN_DETAIL
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
          <small className="text-muted">{trainee.email}</small>
        </div>
      </td>
      <td className="align-middle hide-mobile">
        <span className="text-dark fw-medium">{trainee.eid || 'N/A'}</span>
      </td>
      <td className="align-middle show-mobile">
        <span className="text-dark">{trainee.email}</span>
      </td>
      <td className="align-middle hide-mobile">
        <div className="text-muted small">
          {trainee.enrollmentCount || 0}
        </div>
      </td>
      <td className="align-middle hide-mobile">
        <div className="text-muted small">
          {trainee.batches && trainee.batches.length > 0 
            ? trainee.batches.join(', ') 
            : 'N/A'}
        </div>
      </td>
      <td className="align-middle text-center show-mobile">
        <PermissionWrapper 
          permissions={[PERMISSION_IDS.VIEW_USER_IN_DETAIL]}
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
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('subjects');

  // Fetch course details from API
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Call API GET /courses/{courseId}
        const courseData = await courseAPI.getCourseById(courseId);

        // Map course data
        const mappedCourse = {
          id: courseData.id,
          title: courseData.name,
          code: courseData.code,
          description: courseData.description || '',
          status: courseData.status || 'PLANNED',
          enrolledCount: courseData.traineeCount || 0,
          startDate: courseData.startDate,
          endDate: courseData.endDate,
          department: courseData.department?.name || 'N/A',
          departmentCode: courseData.department?.code || ''
        };

        // Map subjects from API response
        const mappedSubjects = (courseData.subjects || []).map(subject => ({
          id: subject.id,
          name: subject.name,
          code: subject.code,
          description: subject.description || '',
          status: subject.status || 'PLANNED',
          duration: subject.duration || 0,
          method: subject.method || 'N/A',
          roomName: subject.roomName,
          timeSlot: subject.timeSlot,
          startDate: subject.startDate,
          endDate: subject.endDate,
          passScore: subject.passScore
        }));

        setCourse(mappedCourse);
        setSubjects(mappedSubjects);

        // Fetch trainees for this course
        try {
          const traineesResponse = await courseAPI.getCourseTrainees(courseId);
          const traineesList = traineesResponse.trainees || [];

          // Map trainees to match expected format
          const mappedTrainees = traineesList.map(trainee => ({
            id: trainee.id,
            eid: trainee.eid,
            firstName: trainee.firstName || '',
            lastName: trainee.lastName || '',
            name: `${trainee.firstName || ''} ${trainee.lastName || ''}`.trim(),
            email: trainee.email || '',
            enrollmentCount: trainee.enrollmentCount || 0,
            batches: trainee.batches || []
          }));

          setTrainees(mappedTrainees);
        } catch (traineeErr) {
          console.error('Error fetching trainees:', traineeErr);
          // Don't fail the whole page if trainees fail, just set empty array
          setTrainees([]);
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleViewSubject = (subject) => {
    navigate(ROUTES.SUBJECTS_IN_COURSE(courseId, subject.id));
  };

  const handleViewTrainee = (trainee) => {
    navigate(ROUTES.USERS_DETAIL(trainee.id));
  };

  const tabs = [
    {
      id: 'subjects',
      title: 'Subject List',
      icon: Book,
      component: <SubjectTable subjects={subjects} loading={loading} onView={handleViewSubject} />
    },
    {
      id: 'trainees',
      title: 'Trainee List',
      icon: People,
      component: <TraineeTable trainees={trainees} loading={loading} onView={handleViewTrainee} />
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

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
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
              onClick={() => navigate(ROUTES.DEPARTMENT_MY_DETAILS)}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="mb-1">{course.title}</h2>
              <p className="text-muted mb-0">{course.code} • {course.department} ({course.departmentCode})</p>
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
