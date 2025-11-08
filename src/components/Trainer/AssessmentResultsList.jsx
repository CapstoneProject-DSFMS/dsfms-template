import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Row, Col, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { CheckCircle, XCircle, Clock, Person, Book, Eye, Download, Funnel, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, SearchBar } from '../Common';
import TrainerFilterPanel from './TrainerFilterPanel';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

const AssessmentResultsList = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const { sortedData, sortConfig, handleSort } = useTableSort(results);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockResults = [
          {
            id: 1,
            title: 'Safety Assessment - Module 1',
            course: 'Aviation Safety Management',
            trainee: 'John Doe',
            completedDate: '2024-01-10',
            score: 85,
            maxScore: 100,
            status: 'completed',
            grade: 'B+',
            duration: '115 minutes',
            attempts: 1
          },
          {
            id: 2,
            title: 'Technical Assessment - Engine Systems',
            course: 'Aircraft Maintenance',
            trainee: 'Jane Smith',
            completedDate: '2024-01-09',
            score: 92,
            maxScore: 100,
            status: 'completed',
            grade: 'A-',
            duration: '88 minutes',
            attempts: 1
          },
          {
            id: 3,
            title: 'Practical Assessment - Navigation',
            course: 'Flight Operations',
            trainee: 'Mike Johnson',
            completedDate: '2024-01-08',
            score: 78,
            maxScore: 100,
            status: 'completed',
            grade: 'C+',
            duration: '142 minutes',
            attempts: 2
          },
          {
            id: 4,
            title: 'Regulatory Assessment - Part 121',
            course: 'Aviation Regulations',
            trainee: 'Sarah Wilson',
            completedDate: '2024-01-07',
            score: 95,
            maxScore: 100,
            status: 'completed',
            grade: 'A',
            duration: '95 minutes',
            attempts: 1
          },
          {
            id: 5,
            title: 'Emergency Procedures Assessment',
            course: 'Crisis Management',
            trainee: 'David Brown',
            completedDate: '2024-01-06',
            score: 65,
            maxScore: 100,
            status: 'failed',
            grade: 'D',
            duration: '120 minutes',
            attempts: 1
          }
        ];
        
        setResults(mockResults);
      } catch (err) {
        setError('Failed to load assessment results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'success', text: 'Completed', icon: CheckCircle },
      failed: { variant: 'danger', text: 'Failed', icon: XCircle },
      inProgress: { variant: 'warning', text: 'In Progress', icon: Clock },
      pending: { variant: 'info', text: 'Pending Review', icon: Clock }
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

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'primary';
    if (grade.startsWith('C')) return 'warning';
    if (grade.startsWith('D')) return 'danger';
    return 'secondary';
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'primary';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(results.map(result => result.status))];

  const filteredResults = results.filter(result => {
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(result.status);
    const matchesSearch = result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.trainee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusToggle = (status) => {
    if (status === 'clear') {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(prev => 
        prev.includes(status) 
          ? prev.filter(s => s !== status)
          : [...prev, status]
      );
    }
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSearchTerm('');
  };

  const handleViewResult = (resultId) => {
    navigate(`/trainer/assessment-details/${resultId}`);
  };

  const handleDownloadResult = (resultId) => {
    // Implement download functionality
    console.log('Downloading result:', resultId);
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

  if (results.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No assessment results found</h5>
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
        className={`fw-semibold ${className}`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)'
        }}
        onClick={() => handleSort(columnKey)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#214760';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bs-primary)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{ 
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '600' : '500',
            color: 'white'
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
              color="white"
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
              background: 'rgba(255, 255, 255, 0.5)',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </th>
    );
  };

  return (
    <div>
      {/* Search and Filters */}
      <Row className="mb-3 form-mobile-stack search-filter-section">
        <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
          <SearchBar
            placeholder="Search assessments, trainees, or courses..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="search-bar-mobile"
          />
        </Col>
        <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
          <TrainerFilterPanel
            uniqueStatuses={uniqueStatuses}
            selectedStatuses={selectedStatuses}
            onStatusToggle={handleStatusToggle}
            onClearFilters={handleClearFilters}
            className="filter-panel-mobile"
          />
        </Col>
        <Col xs={12} lg={3} md={3}>
          <div className="text-end text-mobile-center">
            <small className="text-muted">
              {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
            </small>
          </div>
        </Col>
      </Row>

      {filteredResults.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <CheckCircle size={64} className="text-muted mb-3" />
            <h5 className="text-muted">No Results Found</h5>
            <p className="text-muted">
              {searchTerm || filterStatus !== 'all' 
                ? 'No assessment results match your current filters.'
                : 'No assessment results available yet.'
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
                  Assessment
                </SortableHeader>
                <SortableHeader columnKey="course" className="show-mobile">
                  Course
                </SortableHeader>
                <SortableHeader columnKey="trainee" className="show-mobile">
                  Trainee
                </SortableHeader>
                <SortableHeader columnKey="score" className="show-mobile">
                  Score
                </SortableHeader>
                <SortableHeader columnKey="grade" className="hide-mobile">
                  Grade
                </SortableHeader>
                <SortableHeader columnKey="completedDate" className="show-mobile">
                  Completed
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
              {sortedData.map((result) => (
                <tr key={result.id}>
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <h6 className="mb-1 fw-medium">{result.title}</h6>
                      <small className="text-muted">
                        Attempt {result.attempts} • {result.duration}
                      </small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div className="d-flex align-items-center">
                      <Book size={16} className="me-2 text-muted" />
                      <span>{result.course}</span>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div className="d-flex align-items-center">
                      <Person size={16} className="me-2 text-muted" />
                      <span>{result.trainee}</span>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div className="d-flex align-items-center">
                      <span 
                        className={`fw-bold text-${getScoreColor(result.score, result.maxScore)}`}
                      >
                        {result.score}/{result.maxScore}
                      </span>
                      <small className="text-muted ms-2">
                        ({Math.round((result.score / result.maxScore) * 100)}%)
                      </small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle hide-mobile">
                    <Badge 
                      bg={getGradeColor(result.grade)}
                      className="fs-6"
                    >
                      {result.grade}
                    </Badge>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <div className="fw-medium">{result.completedDate}</div>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    {getStatusBadge(result.status)}
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
                          onClick: () => handleViewResult(result.id)
                        },
                        {
                          label: 'Download Report',
                          icon: <Download />,
                          onClick: () => handleDownloadResult(result.id)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AssessmentResultsList;
