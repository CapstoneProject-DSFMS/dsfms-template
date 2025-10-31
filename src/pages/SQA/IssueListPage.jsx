import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { 
  ExclamationTriangle, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  ThreeDotsVertical
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SearchBar, PermissionWrapper, AdminTable } from '../../components/Common';
import PortalUnifiedDropdown from '../../components/Common/PortalUnifiedDropdown';
import useTableSort from '../../hooks/useTableSort';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import '../../styles/scrollable-table.css';

const IssueListPage = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { sortConfig, handleSort } = useTableSort();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockIssues = [
      {
        id: 1,
        title: 'Safety Procedure Issue',
        description: 'Reported safety concern in training module',
        reporter: 'John Smith',
        reporterEmail: 'john.smith@company.com',
        status: 'open',
        priority: 'high',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T14:20:00Z'
      },
      {
        id: 2,
        title: 'Training Material Error',
        description: 'Incorrect information in assessment template',
        reporter: 'Sarah Johnson',
        reporterEmail: 'sarah.johnson@company.com',
        status: 'in_progress',
        priority: 'medium',
        createdAt: '2024-01-14T09:15:00Z',
        updatedAt: '2024-01-15T11:45:00Z'
      },
      {
        id: 3,
        title: 'System Performance Issue',
        description: 'Slow loading times during assessment',
        reporter: 'Mike Wilson',
        reporterEmail: 'mike.wilson@company.com',
        status: 'resolved',
        priority: 'low',
        createdAt: '2024-01-13T16:20:00Z',
        updatedAt: '2024-01-14T09:30:00Z'
      }
    ];
    
    setTimeout(() => {
      setIssues(mockIssues);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { variant: 'danger', icon: ExclamationTriangle },
      in_progress: { variant: 'warning', icon: Clock },
      resolved: { variant: 'success', icon: CheckCircle },
      closed: { variant: 'secondary', icon: XCircle }
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

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: 'danger',
      medium: 'warning',
      low: 'info'
    };
    
    return (
      <Badge bg={priorityConfig[priority] || 'secondary'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.reporter.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || issue.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewIssue = (issueId) => {
    navigate(`/sqa/issues/${issueId}`);
  };


  const getActionItems = (issue) => [
    {
      label: 'View Details',
      icon: <Eye />,
      onClick: () => handleViewIssue(issue.id),
      permission: API_PERMISSIONS.SQA.VIEW_TEMPLATES
    }
  ];

  if (loading) {
    return (
      <Container className="py-4">
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 issue-list-page">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
            <Col xs={12} className="mt-2 mt-md-0 mb-3">
              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-primary" size="sm">
                  Export Issues
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Search and Filters */}
          <Row className="mb-3 form-mobile-stack search-filter-section">
            <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
              <SearchBar
                placeholder="Search issues by title, description, or reporter..."
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
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </Col>
            <Col xs={12} lg={3} md={3}>
              <div className="text-end text-mobile-center">
                <small className="text-muted">
                  {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''}
                </small>
              </div>
            </Col>
          </Row>

          {/* Issues Table */}
          <AdminTable
            data={filteredIssues}
            loading={loading}
            columns={[
              { key: 'title', title: 'Issue Title', className: 'show-mobile', sortable: true },
              { key: 'reporter', title: 'Reporter', className: 'hide-mobile', sortable: true },
              { key: 'status', title: 'Status', className: 'show-mobile', sortable: true },
              { key: 'priority', title: 'Priority', className: 'hide-mobile', sortable: true },
              { key: 'createdAt', title: 'Created Date', className: 'hide-mobile', sortable: true },
              { title: 'Actions', className: 'text-center show-mobile', sortable: false }
            ]}
            renderRow={(issue, index) => (
              <tr 
                key={issue.id}
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
                    <h6 className="mb-1 fw-medium">{issue.title}</h6>
                    <small className="text-muted">
                      {issue.description}
                    </small>
                  </div>
                </td>
                <td className="align-middle hide-mobile">
                  <div>
                    <div className="fw-medium">{issue.reporter}</div>
                    <small className="text-muted">{issue.reporterEmail}</small>
                  </div>
                </td>
                <td className="align-middle show-mobile">
                  {getStatusBadge(issue.status)}
                </td>
                <td className="align-middle hide-mobile">
                  {getPriorityBadge(issue.priority)}
                </td>
                <td className="align-middle hide-mobile">
                  <div className="text-muted small">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="align-middle text-center show-mobile">
                  <PermissionWrapper 
                    permissions={[API_PERMISSIONS.SQA.VIEW_TEMPLATES]}
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
                      items={getActionItems(issue)}
                    />
                  </PermissionWrapper>
                </td>
              </tr>
            )}
            emptyMessage="No issues found"
            emptyDescription="Try adjusting your search criteria."
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default IssueListPage;
