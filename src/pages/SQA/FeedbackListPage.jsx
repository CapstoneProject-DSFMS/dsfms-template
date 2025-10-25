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
import { LoadingSkeleton, SearchBar, SortIcon, PermissionWrapper } from '../../components/Common';
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
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Feedback List</h2>
              <p className="text-muted mb-0">Review and acknowledge user feedback</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm">
                Export Feedback
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={8}>
          <SearchBar
            placeholder="Search feedback by title, description, or submitter..."
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
            <option value="pending">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </Col>
      </Row>

      {/* Feedback Table */}
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
                          title="Feedback Title" 
                          sortKey="title" 
                          sortConfig={sortConfig} 
                          onSort={handleSort} 
                        />
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">
                        Submitter
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">
                        Category
                      </th>
                      <th className="border-neutral-200 text-primary-custom fw-semibold show-mobile">
                        Rating
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
                    {filteredFeedback.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <ChatDots size={48} className="text-muted mb-3" />
                          <h5 className="text-muted">No feedback found</h5>
                          <p className="text-muted">No feedback matches your current filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredFeedback.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div>
                              <h6 className="mb-1">{item.title}</h6>
                              <p className="text-muted small mb-0" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {item.description}
                              </p>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">{item.submitter}</div>
                              <div className="text-muted small">{item.submitterEmail}</div>
                            </div>
                          </td>
                          <td>
                            {getCategoryBadge(item.category)}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{getRatingStars(item.rating)}</span>
                              <span className="text-muted small">({item.rating}/5)</span>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(item.status)}
                          </td>
                          <td>
                            <div className="text-muted small">
                              {new Date(item.createdAt).toLocaleDateString()}
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
                                items={getActionItems(item)}
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

export default FeedbackListPage;
