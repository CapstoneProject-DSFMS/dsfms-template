import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { 
  ChatDots, 
  Eye, 
  CheckCircle, 
  Clock,
  ExclamationCircle,
  ThreeDotsVertical
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SearchBar, PermissionWrapper, AdminTable } from '../../components/Common';
import PortalUnifiedDropdown from '../../components/Common/PortalUnifiedDropdown';
import useTableSort from '../../hooks/useTableSort';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import '../../styles/scrollable-table.css';

const FeedbackListPage = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { sortConfig, handleSort } = useTableSort();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockFeedback = [
      {
        id: 1,
        title: 'Training Course Feedback',
        description: 'Positive feedback about the safety training course',
        submitter: 'Sarah Johnson',
        submitterEmail: 'sarah.johnson@company.com',
        status: 'acknowledged',
        category: 'training',
        rating: 5,
        createdAt: '2024-01-15T10:30:00Z',
        acknowledgedAt: '2024-01-15T14:20:00Z'
      },
      {
        id: 2,
        title: 'System Usability Feedback',
        description: 'Suggestions for improving the assessment interface',
        submitter: 'Mike Wilson',
        submitterEmail: 'mike.wilson@company.com',
        status: 'pending',
        category: 'system',
        rating: 4,
        createdAt: '2024-01-14T09:15:00Z',
        acknowledgedAt: null
      },
      {
        id: 3,
        title: 'Content Quality Feedback',
        description: 'Feedback about the quality of training materials',
        submitter: 'John Smith',
        submitterEmail: 'john.smith@company.com',
        status: 'acknowledged',
        category: 'content',
        rating: 3,
        createdAt: '2024-01-13T16:20:00Z',
        acknowledgedAt: '2024-01-14T09:30:00Z'
      }
    ];
    
    setTimeout(() => {
      setFeedback(mockFeedback);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: Clock },
      acknowledged: { variant: 'success', icon: CheckCircle },
      reviewed: { variant: 'info', icon: ExclamationCircle }
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

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      training: 'primary',
      system: 'info',
      content: 'success',
      general: 'secondary'
    };
    
    return (
      <Badge bg={categoryConfig[category] || 'secondary'}>
        {category.toUpperCase()}
      </Badge>
    );
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'text-warning' : 'text-muted'}>
        ★
      </span>
    ));
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.submitter.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewFeedback = (feedbackId) => {
    navigate(`/sqa/feedback/${feedbackId}`);
  };

  const handleAcknowledgeFeedback = (feedbackId) => {
    navigate(`/sqa/feedback/${feedbackId}/acknowledge`);
  };

  const getActionItems = (item) => [
    {
      label: 'View Details',
      icon: <Eye />,
      onClick: () => handleViewFeedback(item.id),
      permission: API_PERMISSIONS.SQA.VIEW_TEMPLATES
    },
    {
      label: 'Acknowledge',
      icon: <CheckCircle />,
      onClick: () => handleAcknowledgeFeedback(item.id),
      disabled: item.status === 'acknowledged' || item.status === 'reviewed',
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
    <Container fluid className="py-4 feedback-list-page">
      <Card className="border-neutral-200 shadow-sm">
        <Card.Header className="bg-light-custom border-neutral-200">
          <Row className="align-items-center">
            <Col xs={12} className="mt-2 mt-md-0 mb-3">
              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-primary" size="sm">
                  Export Feedback
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
                placeholder="Search feedback by title, description, or submitter..."
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
                <option value="acknowledged">Acknowledged</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </Col>
            <Col xs={12} lg={3} md={3}>
              <div className="text-end text-mobile-center">
                <small className="text-muted">
                  {filteredFeedback.length} feedback{filteredFeedback.length !== 1 ? '' : ''}
                </small>
              </div>
            </Col>
          </Row>

          {/* Feedback Table */}
          <AdminTable
            data={filteredFeedback}
            loading={loading}
            columns={[
              { key: 'title', title: 'Feedback Title', className: 'show-mobile', sortable: true },
              { key: 'submitter', title: 'Submitter', className: 'hide-mobile', sortable: true },
              { key: 'status', title: 'Status', className: 'show-mobile', sortable: true },
              { key: 'category', title: 'Category', className: 'hide-mobile', sortable: true },
              { key: 'createdAt', title: 'Created Date', className: 'hide-mobile', sortable: true },
              { title: 'Actions', className: 'text-center show-mobile', sortable: false }
            ]}
            renderRow={(item, index) => (
              <tr 
                key={item.id}
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
                    <h6 className="mb-1 fw-medium">{item.title}</h6>
                    <small className="text-muted">
                      {item.description}
                    </small>
                  </div>
                </td>
                <td className="align-middle hide-mobile">
                  <div>
                    <div className="fw-medium">{item.submitter}</div>
                    <small className="text-muted">{item.submitterEmail}</small>
                  </div>
                </td>
                <td className="align-middle show-mobile">
                  {getStatusBadge(item.status)}
                </td>
                <td className="align-middle hide-mobile">
                  {getCategoryBadge(item.category)}
                </td>
                <td className="align-middle hide-mobile">
                  <div className="text-muted small">
                    {new Date(item.createdAt).toLocaleDateString()}
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
                      items={getActionItems(item)}
                    />
                  </PermissionWrapper>
                </td>
              </tr>
            )}
            emptyMessage="No feedback found"
            emptyDescription="Try adjusting your search criteria."
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FeedbackListPage;
