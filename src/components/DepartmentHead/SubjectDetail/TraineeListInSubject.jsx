import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Person, Calendar, Clock, Eye, ThreeDotsVertical, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, SearchBar } from '../../Common';
import TrainerFilterPanel from '../../Trainer/TrainerFilterPanel';
import useTableSort from '../../../hooks/useTableSort';
import '../../../styles/scrollable-table.css';

const TraineeListInSubject = ({ subjectId, courseId }) => {
  const navigate = useNavigate();
  const { courseId: paramCourseId } = useParams();
  const actualCourseId = courseId || paramCourseId;
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  useEffect(() => {
    const fetchTraineesInSubject = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for trainees in this specific subject
        const mockTrainees = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@email.com',
            employeeId: 'TE001',
            department: 'Operations',
            enrollmentDate: '2024-01-15',
            status: 'completed',
            progress: 100,
            lastActivity: '2024-01-20',
            score: 95,
            completionDate: '2024-01-20',
            attempts: 1
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            employeeId: 'TE002',
            department: 'Maintenance',
            enrollmentDate: '2024-01-16',
            status: 'completed',
            progress: 100,
            lastActivity: '2024-01-19',
            score: 87,
            completionDate: '2024-01-19',
            attempts: 2
          },
          {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.johnson@email.com',
            employeeId: 'TE003',
            department: 'Safety',
            enrollmentDate: '2024-01-17',
            status: 'in_progress',
            progress: 75,
            lastActivity: '2024-01-25',
            score: null,
            completionDate: null,
            attempts: 1
          },
          {
            id: 4,
            name: 'Sarah Wilson',
            email: 'sarah.wilson@email.com',
            employeeId: 'TE004',
            department: 'Quality',
            enrollmentDate: '2024-01-18',
            status: 'pending',
            progress: 25,
            lastActivity: '2024-01-22',
            score: null,
            completionDate: null,
            attempts: 0
          },
          {
            id: 5,
            name: 'David Brown',
            email: 'david.brown@email.com',
            employeeId: 'TE005',
            department: 'Training',
            enrollmentDate: '2024-01-19',
            status: 'in_progress',
            progress: 60,
            lastActivity: '2024-01-23',
            score: null,
            completionDate: null,
            attempts: 1
          }
        ];
        
        setTrainees(mockTrainees);
      } catch (err) {
        setError('Failed to load trainees in subject');
        console.error('Error fetching trainees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTraineesInSubject();
  }, [subjectId]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      in_progress: { variant: 'info', text: 'In Progress' },
      completed: { variant: 'success', text: 'Completed' },
      failed: { variant: 'danger', text: 'Failed' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: 'Unknown' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleViewTrainee = (traineeId) => {
    navigate(ROUTES.USERS_DETAIL(traineeId));
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(trainees.map(trainee => trainee.status))];

  const filteredTrainees = trainees.filter(trainee => {
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(trainee.status);
    const matchesSearch = trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainee.department.toLowerCase().includes(searchTerm.toLowerCase());
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

  const { sortedData, sortConfig, handleSort } = useTableSort(filteredTrainees);

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <th 
        className={`fw-semibold ${className}`}
        onClick={() => handleSort(columnKey)}
        style={{ 
          cursor: 'pointer',
          backgroundColor: 'var(--bs-primary)',
          color: 'white',
          borderColor: 'var(--bs-primary)'
        }}
      >
        <div className="d-flex align-items-center">
          <span style={{ color: 'white' }}>{children}</span>
          <SortIcon 
            direction={direction}
            className="ms-1"
            color="white"
          />
        </div>
      </th>
    );
  };

  if (loading) {
    return <LoadingSkeleton rows={5} columns={7} />;
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (filteredTrainees.length === 0) {
    return (
      <div className="text-center py-5 p-4">
        <div className="text-muted">
          <h5>No trainees found</h5>
          <p>Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Back Button */}
      <Row className="mb-3">
        <Col>
          <button 
            className="btn btn-link p-0 text-decoration-none"
            onClick={() => navigate(`${ROUTES.DEPARTMENT_MY_DETAILS}/${actualCourseId}`)}
            style={{ color: 'var(--bs-primary)' }}
          >
            <ArrowLeft size={20} className="me-2" />
            Back to Course Details
          </button>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-3 form-mobile-stack search-filter-section">
        <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
          <SearchBar
            placeholder="Search trainees in this subject..."
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
              {filteredTrainees.length} trainee{filteredTrainees.length !== 1 ? 's' : ''}
            </small>
          </div>
        </Col>
      </Row>

      {/* Table */}
      <div className="scrollable-table-container admin-table">
        <Table hover className="mb-0 table-mobile-responsive sticky-header border-neutral-200 align-middle" style={{ fontSize: '0.875rem' }}>
          <thead className="sticky-header">
            <tr>
              <SortableHeader columnKey="name" className="show-mobile">
                Trainee
              </SortableHeader>
              <SortableHeader columnKey="employeeId" className="hide-mobile">
                Employee ID
              </SortableHeader>
              <SortableHeader columnKey="department" className="hide-mobile">
                Department
              </SortableHeader>
              <SortableHeader columnKey="progress" className="show-mobile">
                Progress
              </SortableHeader>
              <SortableHeader columnKey="score" className="hide-mobile">
                Score
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
            {sortedData.map((trainee, index) => (
              <tr 
                key={trainee.id}
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
                  <div className="d-flex align-items-center">
                    <Person size={18} className="me-2 text-primary" />
                    <div>
                      <h6 className="mb-0 fw-medium">{trainee.name}</h6>
                      <small className="text-muted">{trainee.email}</small>
                    </div>
                  </div>
                </td>
                <td className="align-middle hide-mobile">
                  <span className="text-dark fw-medium">{trainee.employeeId}</span>
                </td>
                <td className="align-middle hide-mobile">
                  <span>{trainee.department}</span>
                </td>
                <td className="align-middle show-mobile">
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-medium">{trainee.progress}%</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        role="progressbar" 
                        style={{ width: `${trainee.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="align-middle hide-mobile">
                  {trainee.score ? (
                    <span className="fw-bold text-success">{trainee.score}</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="align-middle show-mobile">
                  {getStatusBadge(trainee.status)}
                </td>
                <td className="align-middle text-center show-mobile">
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
                        onClick: () => handleViewTrainee(trainee.id)
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

export default TraineeListInSubject;

