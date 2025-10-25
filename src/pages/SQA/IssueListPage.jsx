import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { 
  ExclamationTriangle, 
  Eye, 
  Reply, 
  Clock,
  CheckCircle,
  XCircle,
  ThreeDotsVertical
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SearchBar, SortIcon, PermissionWrapper } from '../../components/Common';
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

  const handleRespondToIssue = (issueId) => {
    navigate(`/sqa/issues/${issueId}/respond`);
  };

  const getActionItems = (issue) => [
    {
      label: 'View Details',
      icon: <Eye />,
      onClick: () => handleViewIssue(issue.id),
      permission: API_PERMISSIONS.SQA.VIEW_TEMPLATES
    },
    {
      label: 'Respond',
      icon: <Reply />,
      onClick: () => handleRespondToIssue(issue.id),
      disabled: issue.status === 'resolved' || issue.status === 'closed',
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
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Issue List</h2>
              <p className="text-muted mb-0">Manage and respond to reported issues</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm">
                Export Issues
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={8}>
          <SearchBar
            placeholder="Search issues by title, description, or reporter..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </Col>
        <Col md={4}>
          <select 
            className="form-select"
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
      </Row>

      {/* Issues Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="scrollable-table-container admin-table">
                <table className="table table-hover mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
                  <thead className="sticky-header">
                    <tr>
                      <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">
                        <SortIcon 
                          title="Issue Title" 
                          sortKey="title" 
                          sortConfig={sortConfig} 
                          onSort={handleSort} 
                        />
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">
                        Reporter
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">
                        <SortIcon 
                          title="Status" 
                          sortKey="status" 
                          sortConfig={sortConfig} 
                          onSort={handleSort} 
                        />
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">
                        <SortIcon 
                          title="Priority" 
                          sortKey="priority" 
                          sortConfig={sortConfig} 
                          onSort={handleSort} 
                        />
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">
                        <SortIcon 
                          title="Created Date" 
                          sortKey="createdAt" 
                          sortConfig={sortConfig} 
                          onSort={handleSort} 
                        />
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold text-center show-mobile" width="80">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <ExclamationTriangle size={48} className="text-muted mb-3" />
                          <h5 className="text-muted">No issues found</h5>
                          <p className="text-muted">No issues match your current filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((issue) => (
                        <tr key={issue.id}>
                          <td>
                            <div>
                              <h6 className="mb-1">{issue.title}</h6>
                              <p className="text-muted small mb-0" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {issue.description}
                              </p>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">{issue.reporter}</div>
                              <div className="text-muted small">{issue.reporterEmail}</div>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(issue.status)}
                          </td>
                          <td>
                            {getPriorityBadge(issue.priority)}
                          </td>
                          <td>
                            <div className="text-muted small">
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="border-neutral-200 align-middle text-center show-mobile">
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default IssueListPage;
