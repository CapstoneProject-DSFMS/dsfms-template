import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav, Tab } from 'react-bootstrap';
import {
  ExclamationTriangle,
  ChatDots,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ExclamationCircle,
  ThreeDotsVertical,
  FileText,
} from 'react-bootstrap-icons';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '../../constants/routes';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { LoadingSkeleton, SearchBar, PermissionWrapper } from '../../components/Common';
import AdminTable from '../../components/Common/AdminTable';
import PortalUnifiedDropdown from '../../components/Common/PortalUnifiedDropdown';
import reportAPI from '../../api/reports';
import { Plus } from 'react-bootstrap-icons';
import '../../styles/reports-page.css';

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

const SUBTABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'acknowledge', label: 'Acknowledged' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'cancel', label: 'Cancelled' },
];

const SUBTABS_WITHOUT_CANCEL = [
  { id: 'pending', label: 'Pending' },
  { id: 'acknowledge', label: 'Acknowledge' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'cancel', label: 'Cancelled' },
];

const incidentStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const feedbackStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const UnifiedReportsPage = ({ defaultTab, source = '/reports', onShowForm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const derivedTabFromPath = useMemo(() => {
    if (location.pathname.includes('/feedback')) return 'feedback';
    if (location.pathname.includes('/issues')) return 'incidents';
    return 'incidents';
  }, [location.pathname]);

  // Get tab from URL query parameter first, then from defaultTab/path
  const tabFromURL = searchParams.get('tab');
  const resolvedDefaultTab = tabFromURL || defaultTab || derivedTabFromPath;

  const [activeTab, setActiveTab] = useState(resolvedDefaultTab);
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(resolvedDefaultTab);
    setSearchTerm('');
    setActiveSubTab('pending');
  }, [resolvedDefaultTab]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Use my-reports API if source is /reports/create, otherwise use regular reports API
        const useMyReports = source === '/reports/create';
        
        const [incidentsResponse, feedbackResponse] = await Promise.all([
          useMyReports ? reportAPI.getMyIncidents() : reportAPI.getIncidents(),
          useMyReports ? reportAPI.getMyFeedback() : reportAPI.getFeedback(),
        ]);

        setIncidents(incidentsResponse.reports || []);
        setFeedback(feedbackResponse.reports || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to load reports. Please try again.');
        setIncidents([]);
        setFeedback([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [source]);

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
      SUBMITTED: { variant: 'warning', icon: Clock, display: 'Pending' },
      ACKNOWLEDGED: { variant: 'primary', icon: CheckCircle, display: 'Acknowledged' },
      RESOLVED: { variant: 'success', icon: CheckCircle, display: 'Resolved' },
      CANCELLED: { variant: 'secondary', icon: XCircle, display: 'Cancelled' },
      // Keep old mapping for compatibility
      open: { variant: 'danger', icon: ExclamationTriangle, display: 'Open' },
      in_progress: { variant: 'warning', icon: Clock, display: 'In Progress' },
      resolved: { variant: 'success', icon: CheckCircle, display: 'Resolved' },
      closed: { variant: 'secondary', icon: XCircle, display: 'Closed' },
    };

    const config = statusConfig[status] || statusConfig['in_progress'];
    const IconComponent = config.icon;

    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {config.display}
      </Badge>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      LOW: 'info',
      MEDIUM: 'secondary',
      HIGH: 'danger',
      CRITICAL: 'dark',
    };
    return <Badge bg={severityConfig[severity] || 'secondary'}>{severity}</Badge>;
  };

  // Map subtab to status filter
  const getStatusFromSubTab = (subTab) => {
    const statusMap = {
      pending: 'SUBMITTED',
      acknowledge: 'ACKNOWLEDGED',
      resolved: 'RESOLVED',
      cancel: 'CANCELLED',
    };
    return statusMap[subTab] || 'all';
  };

  const getActiveDataset = () => {
    if (activeTab === 'feedback') {
      return {
        data: feedback,
        statusOptions: feedbackStatusOptions,
        columns: [
          { key: 'title', title: 'FEEDBACK TITLE', className: 'show-mobile', sortable: true },
          { key: 'createdBy', title: 'SUBMITTER', className: 'hide-mobile', sortable: true },
          { key: 'status', title: 'STATUS', className: 'show-mobile', sortable: true },
          { key: 'createdAt', title: 'SUBMITTED DATE', className: 'hide-mobile', sortable: true },
          { title: 'ACTIONS', className: 'text-center show-mobile', sortable: false },
        ],
      };
    }

    return {
      data: incidents,
      statusOptions: incidentStatusOptions,
      columns: [
        { key: 'title', title: 'INCIDENT TITLE', className: 'show-mobile', sortable: true },
        { key: 'createdBy', title: 'REPORTER', className: 'hide-mobile', sortable: true },
        { key: 'status', title: 'STATUS', className: 'show-mobile', sortable: true },
        { key: 'severity', title: 'SEVERITY', className: 'hide-mobile', sortable: true },
        { key: 'createdAt', title: 'CREATED DATE', className: 'hide-mobile', sortable: true },
        { title: 'ACTIONS', className: 'text-center show-mobile', sortable: false },
      ],
    };
  };

  const activeDataset = getActiveDataset();

  const filteredData = useMemo(() => {
    let filtered = activeDataset.data.filter((item) => {
      const baseFields = [
        item.title,
        item.description,
        item.createdBy?.firstName,
        item.createdBy?.lastName,
        item.createdBy?.email,
      ];

      // Construct full name for search (lastName + middleName + firstName)
      const fullName = [
        item.createdBy?.lastName,
        item.createdBy?.middleName,
        item.createdBy?.firstName
      ]
        .filter(Boolean)
        .join(' ');

      // Include full name in search fields
      const searchFields = baseFields.concat(fullName);

      const matchesSearch = searchFields
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()));

      // Apply subtab filter
      const subtabStatus = getStatusFromSubTab(activeSubTab);
      const matchesSubTab = subtabStatus === 'all' || item.status === subtabStatus;

      return matchesSearch && matchesSubTab;
    });

    return filtered;
  }, [activeDataset, searchTerm, activeSubTab]);

  const handleViewReport = (reportId) => {
    navigate(ROUTES.REPORTS_DETAIL(reportId), { 
      state: { from: source, tab: activeTab }
    });
  };

  const handleAcknowledgeFeedback = (reportId) => {
    // TODO: Implement acknowledge API call
    console.log('Acknowledging feedback:', reportId);
    toast.success('Feedback acknowledged successfully');
    // Refresh data or update local state
  };

  if (loading) {
    return (
      <Container fluid className="py-2">
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container fluid className="py-2 reports-page">
      <Card className="border-0 shadow-sm">
        <Card.Header className="border-bottom py-2 bg-primary">
          <Row className="align-items-center mb-2">
            <Col>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <div>
                    <h4 className="mb-0 text-white">Incident / Feedback Reports</h4>
                  </div>
                </div>
                {source === '/reports/create' && onShowForm && (
                  <PermissionWrapper 
                    permission={PERMISSION_IDS.SUBMIT_INCIDENT_FEEDBACK_REPORT}
                    fallback={null}
                  >
                    <Button 
                      variant="light" 
                      size="sm"
                      onClick={onShowForm}
                      className="d-flex align-items-center"
                    >
                      <Plus className="me-2" size={16} />
                      Create Incident/Feedback Report
                    </Button>
                  </PermissionWrapper>
                )}
              </div>
            </Col>
          </Row>

          {/* Main Tabs - Incidents/Feedback */}
          <Nav variant="tabs" className="border-0">
            {TABS.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Nav.Item key={tab.id}>
                  <Nav.Link
                    as="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setActiveSubTab('pending');
                      // Update URL with tab parameter
                      setSearchParams({ tab: tab.id });
                    }}
                    active={activeTab === tab.id}
                    className="d-flex align-items-center"
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === tab.id ? '600' : '400',
                      opacity: activeTab === tab.id ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0',
                      cursor: 'pointer'
                    }}
                  >
                    <IconComponent className="me-2" size={16} />
                    {tab.label}
                    <Badge bg="light" text="dark" className="ms-2">
                      {tab.id === 'feedback' ? feedback.length : incidents.length}
                    </Badge>
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>

          {/* Sub-tabs - Pending/Acknowledge/etc */}
          <Nav
            className="border-0 mt-3 sub-tabs-nav"
            style={{ display: 'flex', gap: '0' }}
          >
            {SUBTABS.map((subTab) => (
              <Nav.Item key={subTab.id} style={{ marginBottom: '0' }}>
                <Nav.Link
                  as="button"
                  onClick={() => setActiveSubTab(subTab.id)}
                  className={`d-flex align-items-center sub-tab-link ${activeSubTab === subTab.id ? 'active-sub-tab' : ''}`}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeSubTab === subTab.id ? '600' : '400',
                    opacity: activeSubTab === subTab.id ? '1' : '0.7',
                    cursor: 'pointer',
                    borderBottom: activeSubTab === subTab.id ? '3px solid #ffffff' : 'none',
                    padding: '12px',
                    paddingBottom: '9px',
                    margin: '0',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {subTab.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>

        <Card.Body className="p-3">
          <Row className="mb-3 form-mobile-stack search-filter-section">
            <Col xs={12} lg={9} md={9} className="mb-2 mb-lg-0">
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
                  <Col xs={12} lg={3} md={3}>
                    <div className="text-end text-mobile-center">
                      <small className="text-muted">
                        {filteredData.length}{' '}
                        {activeTab === 'feedback'
                          ? `feedback`
                          : `incident${filteredData.length !== 1 ? 's' : ''}`}
                      </small>
                    </div>
                  </Col>
                </Row>

                {filteredData.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-0">No {activeTab === 'feedback' ? 'feedback' : 'incidents'} found</p>
                  </div>
                ) : (
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
                        {/* TITLE - Show Mobile */}
                        <td className="align-middle show-mobile">
                          <div>
                            <h6 className="mb-1 fw-medium">{item.title}</h6>
                            <small className="text-muted">{item.description}</small>
                          </div>
                        </td>

                        {/* SUBMITTER/REPORTER - Hide Mobile */}
                        <td className="align-middle hide-mobile">
                          <div>
                            <div className="fw-medium">
                              {item.createdBy?.lastName}{item.createdBy?.middleName ? ' ' + item.createdBy?.middleName : ''} {item.createdBy?.firstName}
                            </div>
                            <small className="text-muted">{item.createdBy?.email}</small>
                          </div>
                        </td>

                        {/* STATUS - Show Mobile */}
                        <td className="align-middle show-mobile">
                          {getIncidentStatusBadge(item.status)}
                        </td>

                        {/* SEVERITY - Hide Mobile (Incidents only) */}
                        {activeTab === 'incidents' && (
                          <td className="align-middle hide-mobile">
                            {item.severity ? getSeverityBadge(item.severity) : 'N/A'}
                          </td>
                        )}

                        {/* CREATED/SUBMITTED DATE - Hide Mobile */}
                        <td className="align-middle hide-mobile">
                          <div className="text-muted small">{formatDate(item.createdAt)}</div>
                        </td>

                        {/* ACTIONS */}
                        <td className="align-middle text-center show-mobile">
                          <PermissionWrapper permission={PERMISSION_IDS.VIEW_INCIDENT_FEEDBACK_REPORT_DETAILS} fallback={null}>
                            <Button
                              style={{
                                backgroundColor: '#2c3e50',
                                borderColor: '#2c3e50',
                                color: '#fff',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontWeight: '500',
                                fontSize: '14px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                              onClick={() => handleViewReport(item.id)}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#1a252f';
                                e.currentTarget.style.borderColor = '#1a252f';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#2c3e50';
                                e.currentTarget.style.borderColor = '#2c3e50';
                              }}
                            >
                              View details
                            </Button>
                          </PermissionWrapper>
                        </td>
                      </tr>
                    )}
                  />
                )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UnifiedReportsPage;
