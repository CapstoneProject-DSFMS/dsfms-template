import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { 
  ArrowLeft, 
  ClipboardCheck, 
  CheckCircle,
  XCircle,
  Clock,
  ThreeDotsVertical,
  Eye,
  Check,
  X
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SearchBar, PermissionWrapper, AdminTable, SortIcon } from '../../components/Common';
import PortalUnifiedDropdown from '../../components/Common/PortalUnifiedDropdown';
import useTableSort from '../../hooks/useTableSort';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import '../../styles/scrollable-table.css';
import '../../styles/department-head.css';

// Assessment Request Table Component
const AssessmentRequestTable = ({ requests, loading, onView, onApprove, onDeny }) => {
  const { sortedData, sortConfig, handleSort } = useTableSort(requests);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={6} />;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No assessment requests found</h5>
          <p>No assessment review requests are currently pending.</p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`text-primary-custom fw-semibold ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        onClick={() => handleSort(columnKey)}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center">
          {children}
          <SortIcon 
            direction={direction}
            className="ms-1"
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
            <SortableHeader columnKey="traineeName" className="show-mobile">
              Trainee Name
            </SortableHeader>
            <SortableHeader columnKey="courseTitle" className="show-mobile">
              Course
            </SortableHeader>
            <SortableHeader columnKey="assessmentTitle" className="show-mobile">
              Assessment
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <SortableHeader columnKey="submittedDate" className="hide-mobile">
              Submitted Date
            </SortableHeader>
            <SortableHeader columnKey="score" className="hide-mobile">
              Score
            </SortableHeader>
            <th className="text-primary-custom fw-semibold text-center show-mobile">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((request, index) => (
            <AssessmentRequestRow
              key={request.id}
              request={request}
              index={index}
              onView={onView}
              onApprove={onApprove}
              onDeny={onDeny}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Assessment Request Row Component
const AssessmentRequestRow = ({ request, index, onView, onApprove, onDeny }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: Clock },
      approved: { variant: 'success', icon: CheckCircle },
      denied: { variant: 'danger', icon: XCircle }
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

  const getActionItems = (request) => {
    const items = [
      {
        label: 'View Details',
        icon: <Eye />,
        onClick: () => onView(request),
        permission: API_PERMISSIONS.ASSESSMENTS.VIEW_DETAIL
      }
    ];

    if (request.status === 'pending') {
      items.push(
        { type: 'divider' },
        {
          label: 'Approve Results',
          icon: <Check />,
          className: 'text-success',
          onClick: () => onApprove(request),
          permission: API_PERMISSIONS.ASSESSMENTS.APPROVE
        },
        {
          label: 'Deny Results',
          icon: <X />,
          className: 'text-danger',
          onClick: () => onDeny(request),
          permission: API_PERMISSIONS.ASSESSMENTS.APPROVE
        }
      );
    }

    return items;
  };

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
          <h6 className="mb-1 fw-medium">{request.traineeName}</h6>
          <small className="text-muted">{request.traineeEmail}</small>
        </div>
      </td>
      <td className="align-middle show-mobile">
        <div>
          <div className="fw-medium">{request.courseTitle}</div>
          <small className="text-muted">{request.courseCode}</small>
        </div>
      </td>
      <td className="align-middle show-mobile">
        <div>
          <div className="fw-medium">{request.assessmentTitle}</div>
          <small className="text-muted">{request.assessmentType}</small>
        </div>
      </td>
      <td className="align-middle show-mobile">
        {getStatusBadge(request.status)}
      </td>
      <td className="align-middle hide-mobile">
        <div className="text-muted small">
          {new Date(request.submittedDate).toLocaleDateString()}
        </div>
      </td>
      <td className="align-middle hide-mobile">
        <div className="fw-medium">
          {request.score ? `${request.score}%` : 'N/A'}
        </div>
      </td>
      <td className="align-middle text-center show-mobile">
        <PermissionWrapper 
          permissions={[API_PERMISSIONS.ASSESSMENTS.VIEW_DETAIL, API_PERMISSIONS.ASSESSMENTS.APPROVE]}
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
            items={getActionItems(request)}
          />
        </PermissionWrapper>
      </td>
    </tr>
  );
};

// Main Component
const AssessmentReviewRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockRequests = [
      {
        id: 1,
        traineeName: 'John Smith',
        traineeEmail: 'john.smith@company.com',
        courseTitle: 'Software Development Fundamentals',
        courseCode: 'SDF-001',
        assessmentTitle: 'Final Assessment',
        assessmentType: 'Practical Exam',
        status: 'pending',
        submittedDate: '2024-01-15T14:30:00Z',
        score: 85,
        department: 'IT Department'
      },
      {
        id: 2,
        traineeName: 'Sarah Johnson',
        traineeEmail: 'sarah.johnson@company.com',
        courseTitle: 'Database Management Systems',
        courseCode: 'DMS-002',
        assessmentTitle: 'Database Design Project',
        assessmentType: 'Project',
        status: 'pending',
        submittedDate: '2024-01-14T16:45:00Z',
        score: 92,
        department: 'IT Department'
      },
      {
        id: 3,
        traineeName: 'Mike Wilson',
        traineeEmail: 'mike.wilson@company.com',
        courseTitle: 'Web Development Advanced',
        courseCode: 'WDA-003',
        assessmentTitle: 'Frontend Development Test',
        assessmentType: 'Written Exam',
        status: 'approved',
        submittedDate: '2024-01-13T10:20:00Z',
        score: 78,
        department: 'IT Department'
      },
      {
        id: 4,
        traineeName: 'Emily Davis',
        traineeEmail: 'emily.davis@company.com',
        courseTitle: 'Software Development Fundamentals',
        courseCode: 'SDF-001',
        assessmentTitle: 'Midterm Assessment',
        assessmentType: 'Practical Exam',
        status: 'denied',
        submittedDate: '2024-01-12T09:15:00Z',
        score: 45,
        department: 'IT Department'
      }
    ];
    
    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.traineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewRequest = (request) => {
    navigate(`/department-head/assessment-review-requests/${request.id}`);
  };

  const handleApproveRequest = (request) => {
    // Handle approve request logic
    console.log('Approve request:', request);
    // Update request status to approved
    setRequests(prev => prev.map(req => 
      req.id === request.id ? { ...req, status: 'approved' } : req
    ));
  };

  const handleDenyRequest = (request) => {
    // Handle deny request logic
    console.log('Deny request:', request);
    // Update request status to denied
    setRequests(prev => prev.map(req => 
      req.id === request.id ? { ...req, status: 'denied' } : req
    ));
  };

  const getStatusCounts = () => {
    const counts = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      pending: counts.pending || 0,
      approved: counts.approved || 0,
      denied: counts.denied || 0,
      total: requests.length
    };
  };

  const statusCounts = getStatusCounts();

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
    <Container fluid className="py-4 assessment-review-requests-page">
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
                  <h2 className="mb-1">Assessment Review Requests</h2>
                  <p className="text-muted mb-0">Review and approve/deny assessment requests from your department</p>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <Clock size={24} className="text-warning" />
                  </div>
                  <h5 className="mb-1">{statusCounts.pending}</h5>
                  <p className="text-muted mb-0">Pending Reviews</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <CheckCircle size={24} className="text-success" />
                  </div>
                  <h5 className="mb-1">{statusCounts.approved}</h5>
                  <p className="text-muted mb-0">Approved</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <XCircle size={24} className="text-danger" />
                  </div>
                  <h5 className="mb-1">{statusCounts.denied}</h5>
                  <p className="text-muted mb-0">Denied</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <ClipboardCheck size={24} className="text-primary" />
                  </div>
                  <h5 className="mb-1">{statusCounts.total}</h5>
                  <p className="text-muted mb-0">Total Requests</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Search and Filters */}
          <Row className="mb-3 form-mobile-stack search-filter-section">
            <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
              <SearchBar
                placeholder="Search requests by trainee name, course, or assessment..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </Col>
            <Col xs={12} lg={3} md={3}>
              <div className="text-end text-mobile-center">
                <small className="text-muted">
                  {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
                </small>
              </div>
            </Col>
          </Row>

          {/* Requests Table */}
          <AdminTable
            data={filteredRequests}
            loading={loading}
            columns={[
              { key: 'traineeName', title: 'Trainee Name', className: 'show-mobile', sortable: true },
              { key: 'courseTitle', title: 'Course', className: 'show-mobile', sortable: true },
              { key: 'assessmentTitle', title: 'Assessment', className: 'show-mobile', sortable: true },
              { key: 'status', title: 'Status', className: 'show-mobile', sortable: true },
              { key: 'submittedDate', title: 'Submitted Date', className: 'hide-mobile', sortable: true },
              { key: 'score', title: 'Score', className: 'hide-mobile', sortable: true },
              { title: 'Actions', className: 'text-center show-mobile', sortable: false }
            ]}
            renderRow={(request, index) => (
              <AssessmentRequestRow
                key={request.id}
                request={request}
                index={index}
                onView={handleViewRequest}
                onApprove={handleApproveRequest}
                onDeny={handleDenyRequest}
              />
            )}
            emptyMessage="No assessment requests found"
            emptyDescription="Try adjusting your search criteria."
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AssessmentReviewRequestsPage;
