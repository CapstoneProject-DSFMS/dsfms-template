import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { CalendarEvent, Clock, Person, Book, Eye, PencilSquare, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, SearchBar } from '../Common';
import TrainerFilterPanel from './TrainerFilterPanel';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

const UpcomingAssessmentsList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockAssessments = [
          {
            id: 1,
            title: 'Safety Assessment - Module 1',
            course: 'Aviation Safety Management',
            trainee: 'John Doe',
            scheduledDate: '2024-01-15',
            scheduledTime: '09:00',
            status: 'scheduled',
            duration: '120 minutes',
            location: 'Training Room A'
          },
          {
            id: 2,
            title: 'Technical Assessment - Engine Systems',
            course: 'Aircraft Maintenance',
            trainee: 'Jane Smith',
            scheduledDate: '2024-01-16',
            scheduledTime: '14:00',
            status: 'scheduled',
            duration: '90 minutes',
            location: 'Lab B'
          },
          {
            id: 3,
            title: 'Practical Assessment - Navigation',
            course: 'Flight Operations',
            trainee: 'Mike Johnson',
            scheduledDate: '2024-01-17',
            scheduledTime: '10:30',
            status: 'pending',
            duration: '150 minutes',
            location: 'Simulator Room'
          }
        ];
        
        setAssessments(mockAssessments);
      } catch (err) {
        setError('Failed to load upcoming assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { variant: 'primary', text: 'Scheduled' },
      pending: { variant: 'warning', text: 'Pending' },
      inProgress: { variant: 'info', text: 'In Progress' },
      completed: { variant: 'success', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleViewAssessment = (assessmentId) => {
    navigate(`/trainer/assessments/${assessmentId}`);
  };

  const handleEditAssessment = (assessmentId) => {
    navigate(`/trainer/assessments/${assessmentId}/edit`);
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(assessments.map(assessment => assessment.status))];

  const filteredAssessments = assessments.filter(assessment => {
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(assessment.status);
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.trainee.toLowerCase().includes(searchTerm.toLowerCase());
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

  const { sortedData, sortConfig, handleSort } = useTableSort(filteredAssessments);

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

  if (filteredAssessments.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No upcoming assessments found</h5>
          <p>Try adjusting your search criteria or schedule a new assessment.</p>
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
    <div>

      {/* Search and Filters */}
      <Row className="mb-3 mt-4 form-mobile-stack search-filter-section">
        <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
          <SearchBar
            placeholder="Search assessments, courses, or trainees..."
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
      </Row>
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
                <SortableHeader columnKey="scheduledDate" className="show-mobile">
                  Date & Time
                </SortableHeader>
                <SortableHeader columnKey="duration" className="hide-mobile">
                  Duration
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
              {sortedData.map((assessment) => (
                <tr key={assessment.id}>
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <h6 className="mb-1 fw-medium">{assessment.title}</h6>
                      <small className="text-muted">
                        <Clock size={12} className="me-1" />
                        {assessment.location}
                      </small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div className="d-flex align-items-center">
                      <Book size={16} className="me-2 text-muted" />
                      <span>{assessment.course}</span>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div className="d-flex align-items-center">
                      <Person size={16} className="me-2 text-muted" />
                      <span>{assessment.trainee}</span>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    <div>
                      <div className="fw-medium">{assessment.scheduledDate}</div>
                      <small className="text-muted">{assessment.scheduledTime}</small>
                    </div>
                  </td>
                  <td className="border-neutral-200 align-middle hide-mobile">
                    <span className="text-muted">{assessment.duration}</span>
                  </td>
                  <td className="border-neutral-200 align-middle">
                    {getStatusBadge(assessment.status)}
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
                          onClick: () => handleViewAssessment(assessment.id)
                        },
                        {
                          label: 'Edit Assessment',
                          icon: <PencilSquare />,
                          onClick: () => handleEditAssessment(assessment.id)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
    </div>
  );
};

export default UpcomingAssessmentsList;
