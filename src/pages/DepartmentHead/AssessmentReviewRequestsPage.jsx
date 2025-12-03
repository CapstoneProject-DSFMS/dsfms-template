import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Nav, Tab, Badge, Spinner, Button } from 'react-bootstrap';
import { 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SearchBar } from '../../components/Common';
import useTableSort from '../../hooks/useTableSort';
import { ROUTES } from '../../constants/routes';
import assessmentAPI from '../../api/assessment';
import '../../styles/scrollable-table.css';
import '../../styles/department-head.css';

// Assessment Row Component
const AssessmentRow = ({ assessment, index, onView }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      SUBMITTED: { variant: 'warning', icon: Clock, label: 'SUBMITTED' },
      APPROVED: { variant: 'success', icon: CheckCircle, label: 'APPROVED' },
      REJECTED: { variant: 'danger', icon: XCircle, label: 'REJECTED' },
      CANCELLED: { variant: 'secondary', icon: X, label: 'CANCELLED' }
    };
    
    const config = statusConfig[status] || statusConfig.SUBMITTED;
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultText = (resultText) => {
    if (!resultText) return 'N/A';
    return resultText.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
          <div className="fw-medium">{assessment.name}</div>
          <small className="text-muted">{assessment.template?.name || 'N/A'}</small>
        </div>
      </td>
      <td className="align-middle show-mobile">
        <div>
          <div className="fw-medium">{assessment.trainee?.fullName || 'N/A'}</div>
          <small className="text-muted">{assessment.trainee?.email || 'N/A'}</small>
        </div>
      </td>
      <td className="align-middle show-mobile">
        <div className="text-muted small">
          {formatDate(assessment.submittedAt || assessment.createdAt)}
        </div>
      </td>
      <td className="align-middle show-mobile">
        {getStatusBadge(assessment.status)}
      </td>
      <td className="align-middle hide-mobile">
        <div className="fw-medium">
          {assessment.resultScore !== null && assessment.resultScore !== undefined 
            ? `${assessment.resultScore}%` 
            : 'N/A'}
        </div>
      </td>
      <td className="align-middle hide-mobile">
        <div className="text-muted small">
          {getResultText(assessment.resultText)}
        </div>
      </td>
      <td className="align-middle text-center show-mobile">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => onView(assessment)}
          className="d-flex align-items-center"
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
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('SUBMITTED');

  // Fetch assessments from API
  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getDepartmentAssessments();
      setAssessments(response.assessments || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter assessments by status
  const getAssessmentsByStatus = (status) => {
    return assessments.filter(assessment => assessment.status === status);
  };

  // Get filtered and searched assessments for current tab
  const getFilteredAssessments = () => {
    let filtered = getAssessmentsByStatus(activeTab);
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(assessment => {
        return (
          assessment.name?.toLowerCase().includes(searchLower) ||
          assessment.trainee?.fullName?.toLowerCase().includes(searchLower) ||
          assessment.trainee?.email?.toLowerCase().includes(searchLower) ||
          assessment.course?.name?.toLowerCase().includes(searchLower) ||
          assessment.course?.code?.toLowerCase().includes(searchLower) ||
          assessment.template?.name?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filtered;
  };

  const filteredAssessments = getFilteredAssessments();
  
  // Use table sort hook with filtered assessments
  const { sortedData, sortConfig, handleSort } = useTableSort(filteredAssessments);

  const handleView = (assessment) => {
    navigate(ROUTES.ASSESSMENTS_SECTIONS(assessment.id));
  };

  const getStatusCounts = () => {
    return {
      SUBMITTED: getAssessmentsByStatus('SUBMITTED').length,
      APPROVED: getAssessmentsByStatus('APPROVED').length,
      REJECTED: getAssessmentsByStatus('REJECTED').length,
      CANCELLED: getAssessmentsByStatus('CANCELLED').length
    };
  };

  const statusCounts = getStatusCounts();

  const SortableHeader = ({ columnKey, children, className = "", nestedKey = null }) => {
    const sortKey = nestedKey ? `${columnKey}.${nestedKey}` : columnKey;
    const isActive = sortConfig.key === sortKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`fw-semibold ${className}`}
        onClick={() => handleSort(sortKey)}
        style={{ 
          cursor: 'pointer',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)'
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
          <div className="d-flex align-items-center mb-3">
            <button 
              className="btn btn-link p-0 me-3"
              onClick={() => navigate(ROUTES.DASHBOARD)}
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

      {/* Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <div className="bg-primary rounded-top">
          <div className="border-bottom py-2 px-3">
            <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link 
                    eventKey="SUBMITTED" 
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'SUBMITTED' ? '600' : '400',
                      opacity: activeTab === 'SUBMITTED' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <Clock className="me-2" size={16} />
                    Submitted ({statusCounts.SUBMITTED})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="APPROVED" 
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'APPROVED' ? '600' : '400',
                      opacity: activeTab === 'APPROVED' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <CheckCircle className="me-2" size={16} />
                    Approved ({statusCounts.APPROVED})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="REJECTED" 
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'REJECTED' ? '600' : '400',
                      opacity: activeTab === 'REJECTED' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <XCircle className="me-2" size={16} />
                    Rejected ({statusCounts.REJECTED})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="CANCELLED" 
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'CANCELLED' ? '600' : '400',
                      opacity: activeTab === 'CANCELLED' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <X className="me-2" size={16} />
                    Cancelled ({statusCounts.CANCELLED})
                  </Nav.Link>
                </Nav.Item>
            </Nav>
          </div>
        </div>

        <div>
          <Tab.Content>
              <Tab.Pane eventKey={activeTab}>
                {/* Search and Filters */}
                <Row className="mb-3 form-mobile-stack search-filter-section p-3">
                  <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
                    <SearchBar
                      placeholder="Search by assessment name, trainee name, course, or email..."
                      value={searchTerm}
                      onChange={setSearchTerm}
                      className="search-bar-mobile"
                    />
                  </Col>
                  <Col xs={12} lg={6} md={7}>
                    <div className="text-end text-mobile-center">
                      <small className="text-muted">
                        {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? 's' : ''}
                      </small>
                    </div>
                  </Col>
                </Row>

                {/* Table */}
                {loading ? (
                  <div className="p-3">
                    <LoadingSkeleton rows={5} columns={8} />
                  </div>
                ) : filteredAssessments.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="text-muted">
                      <h5>No assessments found</h5>
                      <p>No assessments with status "{activeTab}" found.</p>
                    </div>
                  </div>
                ) : (
                  <div className="scrollable-table-container admin-table" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
                      <thead className="sticky-header">
                        <tr>
                          <SortableHeader columnKey="name" className="show-mobile">
                            Assessment
                          </SortableHeader>
                          <SortableHeader columnKey="trainee" nestedKey="fullName" className="show-mobile">
                            Trainee
                          </SortableHeader>
                          <SortableHeader columnKey="submittedAt" className="show-mobile">
                            Date & Time
                          </SortableHeader>
                          <SortableHeader columnKey="status" className="show-mobile">
                            Status
                          </SortableHeader>
                          <SortableHeader columnKey="resultScore" className="hide-mobile">
                            Score
                          </SortableHeader>
                          <SortableHeader columnKey="resultText" className="hide-mobile">
                            Result
                          </SortableHeader>
                          <th 
                            className="fw-semibold text-center show-mobile"
                            style={{
                              backgroundColor: 'var(--bs-primary)',
                              color: 'white',
                              borderColor: 'var(--bs-primary)'
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.map((assessment, index) => (
                          <AssessmentRow
                            key={assessment.id}
                            assessment={assessment}
                            index={index}
                            onView={handleView}
                          />
                        ))}
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
