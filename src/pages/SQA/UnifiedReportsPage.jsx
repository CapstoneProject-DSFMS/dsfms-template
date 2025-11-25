import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav } from 'react-bootstrap';
import {
  ExclamationTriangle,
  ChatDots,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ExclamationCircle,
  PlusLg,
} from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { LoadingSkeleton, SearchBar, PermissionWrapper } from '../../components/Common';
import AdminTable from '../../components/Common/AdminTable';

const TABS = [
  {
    id: 'incidents',
    label: 'Incidents',
    icon: ExclamationTriangle,
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: ChatDots,
  },
];

const incidentStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const feedbackStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'reviewed', label: 'Reviewed' },
];

const UnifiedReportsPage = ({ defaultTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const derivedTabFromPath = useMemo(() => {
    if (location.pathname.includes('/feedback')) return 'feedback';
    if (location.pathname.includes('/issues')) return 'incidents';
    return 'incidents';
  }, [location.pathname]);

  const resolvedDefaultTab = defaultTab || derivedTabFromPath;

  const [activeTab, setActiveTab] = useState(resolvedDefaultTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [incidents, setIncidents] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(resolvedDefaultTab);
    setStatusFilter('all');
    setSearchTerm('');
  }, [resolvedDefaultTab]);

  useEffect(() => {
    const mockIncidents = [
      {
        id: 'INC-001',
        title: 'Safety Procedure Issue',
        description: 'Reported safety concern in training module',
        reporter: 'John Smith',
        reporterEmail: 'john.smith@company.com',
        status: 'open',
        priority: 'high',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T14:20:00Z',
      },
      {
        id: 'INC-002',
        title: 'Training Material Error',
        description: 'Incorrect information in assessment template',
        reporter: 'Sarah Johnson',
        reporterEmail: 'sarah.johnson@company.com',
        status: 'in_progress',
        priority: 'medium',
        createdAt: '2024-01-14T09:15:00Z',
        updatedAt: '2024-01-15T11:45:00Z',
      },
      {
        id: 'INC-003',
        title: 'System Performance Issue',
        description: 'Slow loading times during assessment',
        reporter: 'Mike Wilson',
        reporterEmail: 'mike.wilson@company.com',
        status: 'resolved',
        priority: 'low',
        createdAt: '2024-01-13T16:20:00Z',
        updatedAt: '2024-01-14T09:30:00Z',
      },
    ];

    const mockFeedback = [
      {
        id: 'FB-001',
        title: 'Training Course Feedback',
        description: 'Positive feedback about the safety training course',
        submitter: 'Sarah Johnson',
        submitterEmail: 'sarah.johnson@company.com',
        status: 'acknowledged',
        category: 'training',
        rating: 5,
        createdAt: '2024-01-15T10:30:00Z',
        acknowledgedAt: '2024-01-15T14:20:00Z',
      },
      {
        id: 'FB-002',
        title: 'System Usability Feedback',
        description: 'Suggestions for improving the assessment interface',
        submitter: 'Mike Wilson',
        submitterEmail: 'mike.wilson@company.com',
        status: 'pending',
        category: 'system',
        rating: 4,
        createdAt: '2024-01-14T09:15:00Z',
        acknowledgedAt: null,
      },
      {
        id: 'FB-003',
        title: 'Content Quality Feedback',
        description: 'Feedback about the quality of training materials',
        submitter: 'John Smith',
        submitterEmail: 'john.smith@company.com',
        status: 'acknowledged',
        category: 'content',
        rating: 3,
        createdAt: '2024-01-13T16:20:00Z',
        acknowledgedAt: '2024-01-14T09:30:00Z',
      },
    ];

    const timer = setTimeout(() => {
      setIncidents(mockIncidents);
      setFeedback(mockFeedback);
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getIncidentStatusBadge = (status) => {
    const statusConfig = {
      open: { variant: 'danger', icon: ExclamationTriangle },
      in_progress: { variant: 'warning', icon: Clock },
      resolved: { variant: 'success', icon: CheckCircle },
      closed: { variant: 'secondary', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.open;
    const IconComponent = config.icon;

    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getIncidentPriorityBadge = (priority) => {
    const priorityConfig = {
      high: 'danger',
      medium: 'warning',
      low: 'info',
    };

    return <Badge bg={priorityConfig[priority] || 'secondary'}>{priority?.toUpperCase()}</Badge>;
  };

  const getFeedbackStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: Clock },
      acknowledged: { variant: 'success', icon: CheckCircle },
      reviewed: { variant: 'info', icon: ExclamationCircle },
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

  const getFeedbackCategoryBadge = (category) => {
    const categoryConfig = {
      training: 'primary',
      system: 'info',
      content: 'success',
      general: 'secondary',
    };

    return <Badge bg={categoryConfig[category] || 'secondary'}>{category?.toUpperCase()}</Badge>;
  };

  const getActiveDataset = () => {
    if (activeTab === 'feedback') {
      return {
        data: feedback,
        statusOptions: feedbackStatusOptions,
        columns: [
          { key: 'title', title: 'Feedback Title', className: 'show-mobile', sortable: true },
          { key: 'submitter', title: 'Submitter', className: 'hide-mobile', sortable: true },
          { key: 'category', title: 'Category', className: 'hide-mobile', sortable: true },
          { key: 'status', title: 'Status', className: 'show-mobile', sortable: true },
          { key: 'createdAt', title: 'Submitted Date', className: 'hide-mobile', sortable: true },
          { title: 'Actions', className: 'text-center show-mobile', sortable: false },
        ],
      };
    }

    return {
      data: incidents,
      statusOptions: incidentStatusOptions,
      columns: [
        { key: 'title', title: 'Incident Title', className: 'show-mobile', sortable: true },
        { key: 'reporter', title: 'Reporter', className: 'hide-mobile', sortable: true },
        { key: 'status', title: 'Status', className: 'show-mobile', sortable: true },
        { key: 'priority', title: 'Priority', className: 'hide-mobile', sortable: true },
        { key: 'createdAt', title: 'Created Date', className: 'hide-mobile', sortable: true },
        { title: 'Actions', className: 'text-center show-mobile', sortable: false },
      ],
    };
  };

  const activeDataset = getActiveDataset();

  const filteredData = useMemo(() => {
    return activeDataset.data.filter((item) => {
      const baseFields =
        activeTab === 'feedback'
          ? [item.title, item.description, item.submitter, item.submitterEmail]
          : [item.title, item.description, item.reporter, item.reporterEmail];

      const matchesSearch = baseFields
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeDataset.data, activeTab, searchTerm, statusFilter]);

  const handleViewReport = (reportId) => {
    navigate(ROUTES.REPORTS_DETAIL(reportId));
  };

  const handleAcknowledgeFeedback = (reportId) => {
    navigate(`/sqa/feedback/${reportId}/acknowledge`);
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 reports-page">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center gap-2">
                <ExclamationTriangle className="text-primary-custom" size={22} />
                <div>
                  <h4 className="mb-0 text-primary-custom">Incidents / Feedback Report</h4>
                  <small className="text-muted">
                    Monitor incident investigations and feedback acknowledgements
                  </small>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <PermissionWrapper permission={PERMISSION_IDS.SUBMIT_REPORT_REQUEST} fallback={null}>
                <Button
                  variant="primary-custom"
                  size="sm"
                  className="d-flex align-items-center"
                  onClick={() => navigate(ROUTES.REPORTS_CREATE)}
                >
                  <PlusLg className="me-2" size={16} />
                  Create Report
                </Button>
              </PermissionWrapper>
            </Col>
          </Row>
          <Nav
            variant="tabs"
            className="mt-4"
            activeKey={activeTab}
            onSelect={(tab) => setActiveTab(tab)}
          >
            {TABS.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Nav.Item key={tab.id}>
                  <Nav.Link
                    eventKey={tab.id}
                    className="d-flex align-items-center gap-2"
                    style={{ cursor: 'pointer' }}
                  >
                    <IconComponent size={16} />
                    {tab.label}
                    <Badge bg="light" text="dark">
                      {tab.id === 'feedback' ? feedback.length : incidents.length}
                    </Badge>
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
        </Card.Header>

        <Card.Body>
          <Row className="mb-3 form-mobile-stack search-filter-section">
            <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
              <SearchBar
                placeholder={
                  activeTab === 'feedback'
                    ? 'Search feedback by title, description, or submitter...'
                    : 'Search incidents by title, description, or reporter...'
                }
                value={searchTerm}
                onChange={setSearchTerm}
                className="search-bar-mobile"
              />
            </Col>
            <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
              <select
                className="form-select filter-panel-mobile"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {(activeTab === 'feedback' ? feedbackStatusOptions : incidentStatusOptions).map(
                  (option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </Col>
            <Col xs={12} lg={3} md={3}>
              <div className="text-end text-mobile-center">
                <small className="text-muted">
                  {filteredData.length}{' '}
                  {activeTab === 'feedback'
                    ? `feedback item${filteredData.length !== 1 ? 's' : ''}`
                    : `incident${filteredData.length !== 1 ? 's' : ''}`}
                </small>
              </div>
            </Col>
          </Row>

          <AdminTable
            data={filteredData}
            loading={loading}
            columns={activeDataset.columns}
            renderRow={(item, index) => (
              <tr
                key={item.id}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} transition-all`}
                style={{ transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bs-neutral-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? 'white' : 'var(--bs-neutral-50)';
                }}
              >
                <td className="align-middle show-mobile">
                  <div>
                    <h6 className="mb-1 fw-medium">{item.title}</h6>
                    <small className="text-muted">{item.description}</small>
                  </div>
                </td>
                <td className="align-middle hide-mobile">
                  <div>
                    <div className="fw-medium">
                      {activeTab === 'feedback' ? item.submitter : item.reporter}
                    </div>
                    <small className="text-muted">
                      {activeTab === 'feedback' ? item.submitterEmail : item.reporterEmail}
                    </small>
                  </div>
                </td>
                {activeTab === 'feedback' ? (
                  <td className="align-middle hide-mobile">{getFeedbackCategoryBadge(item.category)}</td>
                ) : (
                  <td className="align-middle hide-mobile">{getIncidentPriorityBadge(item.priority)}</td>
                )}
                <td className="align-middle show-mobile">
                  {activeTab === 'feedback'
                    ? getFeedbackStatusBadge(item.status)
                    : getIncidentStatusBadge(item.status)}
                </td>
                <td className="align-middle hide-mobile">
                  <div className="text-muted small">{formatDate(item.createdAt)}</div>
                </td>
                <td className="align-middle text-center show-mobile">
                  <PermissionWrapper permission={PERMISSION_IDS.LIST_ALL_REPORTS} fallback={null}>
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center"
                        onClick={() => handleViewReport(item.id)}
                      >
                        <Eye className="me-1" size={14} />
                        View
                      </Button>
                      {activeTab === 'feedback' && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="d-flex align-items-center"
                          disabled={item.status === 'acknowledged' || item.status === 'reviewed'}
                          onClick={() => handleAcknowledgeFeedback(item.id)}
                        >
                          <CheckCircle className="me-1" size={14} />
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </PermissionWrapper>
                </td>
              </tr>
            )}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UnifiedReportsPage;

