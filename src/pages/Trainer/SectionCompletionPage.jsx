import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { ClipboardCheck, Clock, Person, Book, Eye, CheckCircle, XCircle, Funnel, ThreeDotsVertical } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown } from '../../components/Common';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

const SectionCompletionPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { sortedData, sortConfig, handleSort } = useTableSort(sections);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockSections = [
          {
            id: 1,
            title: 'Safety Procedures - Module 1',
            course: 'Aviation Safety Management',
            trainee: 'John Doe',
            dueDate: '2024-01-20',
            status: 'pending',
            priority: 'high',
            progress: 65,
            instructor: 'Dr. Smith',
            lastActivity: '2024-01-15',
            estimatedTime: '2 hours'
          },
          {
            id: 2,
            title: 'Engine Maintenance - Part A',
            course: 'Aircraft Maintenance',
            trainee: 'Jane Smith',
            dueDate: '2024-01-18',
            status: 'in_progress',
            priority: 'medium',
            progress: 30,
            instructor: 'Jane Doe',
            lastActivity: '2024-01-16',
            estimatedTime: '3 hours'
          },
          {
            id: 3,
            title: 'Navigation Systems - Theory',
            course: 'Flight Operations',
            trainee: 'Mike Johnson',
            dueDate: '2024-01-22',
            status: 'completed',
            priority: 'low',
            progress: 100,
            instructor: 'Mike Johnson',
            lastActivity: '2024-01-17',
            estimatedTime: '1.5 hours'
          },
          {
            id: 4,
            title: 'Regulatory Compliance - Section 2',
            course: 'Aviation Regulations',
            trainee: 'Sarah Wilson',
            dueDate: '2024-01-19',
            status: 'overdue',
            priority: 'high',
            progress: 45,
            instructor: 'Sarah Wilson',
            lastActivity: '2024-01-14',
            estimatedTime: '2.5 hours'
          },
          {
            id: 5,
            title: 'Emergency Response - Practical',
            course: 'Crisis Management',
            trainee: 'David Brown',
            dueDate: '2024-01-25',
            status: 'pending',
            priority: 'medium',
            progress: 0,
            instructor: 'David Brown',
            lastActivity: '2024-01-10',
            estimatedTime: '4 hours'
          }
        ];
        
        setSections(mockSections);
      } catch (err) {
        setError('Failed to load section completion data');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending', icon: Clock },
      in_progress: { variant: 'info', text: 'In Progress', icon: ClipboardCheck },
      completed: { variant: 'success', text: 'Completed', icon: CheckCircle },
      overdue: { variant: 'danger', text: 'Overdue', icon: XCircle }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: Clock };
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { variant: 'danger', text: 'High' },
      medium: { variant: 'warning', text: 'Medium' },
      low: { variant: 'success', text: 'Low' }
    };
    
    const config = priorityConfig[priority] || { variant: 'secondary', text: priority };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'danger';
  };

  const filteredSections = sections.filter(section => {
    const matchesStatus = filterStatus === 'all' || section.status === filterStatus;
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.trainee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewSection = (sectionId) => {
    console.log('Viewing section:', sectionId);
  };

  const handleMarkComplete = (sectionId) => {
    console.log('Marking section as complete:', sectionId);
  };

  if (loading) {
    return <LoadingSkeleton rows={5} columns={7} />;
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Alert>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No sections found</h5>
          <p>Try adjusting your search criteria or check back later.</p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`border-neutral-200 text-primary-custom fw-semibold ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.08)';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{ 
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '600' : '500'
          }}>
            {children}
          </span>
          <div 
            className="ms-2 d-flex align-items-center"
            style={{ 
              minWidth: '20px',
              justifyContent: 'center'
            }}
          >
            <SortIcon 
              direction={direction} 
              size={14}
            />
          </div>
        </div>
        {isActive && (
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, var(--bs-primary), var(--bs-info))',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </th>
    );
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-2">Section Required Completion</h2>
          <p className="text-muted">Monitor and manage sections that require completion by trainees</p>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Funnel size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search sections, trainees, or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm">
                  More Filters
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredSections.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <ClipboardCheck size={64} className="text-muted mb-3" />
            <h5 className="text-muted">No Sections Found</h5>
            <p className="text-muted">
              {searchTerm || filterStatus !== 'all' 
                ? 'No sections match your current filters.'
                : 'No sections require completion at the moment.'
              }
            </p>
            {(searchTerm || filterStatus !== 'all') && (
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <div className="scrollable-table-container admin-table">
          <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
            <thead className="sticky-header">
              <tr>
                <SortableHeader columnKey="title" className="show-mobile">
                  Section
                </SortableHeader>
                <SortableHeader columnKey="course" className="show-mobile">
                  Course
                </SortableHeader>
                <SortableHeader columnKey="trainee" className="show-mobile">
                  Trainee
                </SortableHeader>
                <SortableHeader columnKey="progress" className="hide-mobile">
                  Progress
                </SortableHeader>
                <SortableHeader columnKey="dueDate" className="show-mobile">
                  Due Date
                </SortableHeader>
                <SortableHeader columnKey="priority" className="hide-mobile">
                  Priority
                </SortableHeader>
                <SortableHeader columnKey="status" className="show-mobile">
                  Status
                </SortableHeader>
                <th className="border-neutral-200 text-primary-custom fw-semibold text-center show-mobile">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((section) => (
                <tr key={section.id}>
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <h6 className="mb-1 fw-medium">{section.title}</h6>
                      <small className="text-muted">
                        <Clock size={12} className="me-1" />
                        Est. {section.estimatedTime}
                      </small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div className="d-flex align-items-center">
                      <Book size={16} className="me-2 text-muted" />
                      <span>{section.course}</span>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div className="d-flex align-items-center">
                      <Person size={16} className="me-2 text-muted" />
                      <span>{section.trainee}</span>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle hide-mobile">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">{section.progress}%</span>
                        <small className="text-muted">
                          Last: {section.lastActivity}
                        </small>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className={`progress-bar bg-${getProgressColor(section.progress)}`}
                          style={{ width: `${section.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <div className="fw-medium">{section.dueDate}</div>
                      <small className="text-muted">{section.instructor}</small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle hide-mobile">
                    {getPriorityBadge(section.priority)}
                  </td>
                  <td className="border-neutral-200 align-middle">
                    {getStatusBadge(section.status)}
                  </td>
                  <td className="border-neutral-200 align-middle text-center">
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
                      items={[
                        {
                          label: 'View Details',
                          icon: <Eye />,
                          onClick: () => handleViewSection(section.id)
                        },
                        ...(section.status !== 'completed' ? [{
                          label: 'Mark Complete',
                          icon: <CheckCircle />,
                          onClick: () => handleMarkComplete(section.id)
                        }] : [])
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default SectionCompletionPage;
