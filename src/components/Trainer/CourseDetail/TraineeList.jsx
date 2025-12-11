import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Person, Calendar, Clock, Eye, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, SearchBar } from '../../Common';
import TrainerFilterPanel from '../TrainerFilterPanel';
import useTableSort from '../../../hooks/useTableSort';
import courseAPI from '../../../api/course';
import '../../../styles/scrollable-table.css';

const TraineeList = ({ courseId }) => {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  useEffect(() => {
    const fetchTrainees = async () => {
      if (!courseId) {
        setLoading(false);
        setTrainees([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Call API to get course trainees
        const response = await courseAPI.getCourseTrainees(courseId);
        
        // Handle response format: { message: "...", data: { trainees: [...] } } or { trainees: [...] }
        const traineesList = response?.data?.trainees || response?.trainees || [];

        // Map API response to component format - chỉ dùng data thật từ API
        const mappedTrainees = traineesList.map((trainee) => {
          // Build full name from firstName, middleName, lastName
          const nameParts = [
            trainee.firstName,
            trainee.middleName,
            trainee.lastName
          ].filter(Boolean);
          const fullName = nameParts.join(' ') || null;

          return {
            id: trainee.id,
            name: fullName,
            email: trainee.email,
            employeeId: trainee.eid, // Employee ID từ API
            department: trainee.department?.name || trainee.department, // Nếu API có
            enrollmentDate: trainee.enrollmentDate || trainee.enrolledAt, // Nếu API có
            status: trainee.status, // Nếu API có
            progress: trainee.progress, // Nếu API có
            lastActivity: trainee.lastActivity || trainee.lastActivityDate, // Nếu API có
            subjectCount: trainee.subjectCount // Nếu API có
          };
        }).filter(trainee => trainee.id); // Chỉ lấy trainees có id

        setTrainees(mappedTrainees);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load trainees');
        console.error('Error fetching trainees:', err);
        setTrainees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainees();
  }, [courseId]);

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusUpper = String(status).toUpperCase();
    let config = { variant: 'secondary', text: status };
    
    if (statusUpper === 'ACTIVE' || statusUpper === 'ENROLLED' || statusUpper === 'ONGOING') {
      config = { variant: 'success', text: 'Active' };
    } else if (statusUpper === 'COMPLETED' || statusUpper === 'COMPLETE') {
      config = { variant: 'primary', text: 'Completed' };
    } else if (statusUpper === 'INACTIVE' || statusUpper === 'PENDING') {
      config = { variant: 'warning', text: 'Inactive' };
    } else if (statusUpper === 'SUSPENDED' || statusUpper === 'CANCELLED') {
      config = { variant: 'danger', text: 'Suspended' };
    }
    
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleViewTrainee = (traineeId) => {
    navigate(ROUTES.USERS_DETAIL(traineeId));
  };

  // Get unique statuses for filter (chỉ lấy statuses có giá trị)
  const uniqueStatuses = [...new Set(trainees.map(trainee => trainee.status).filter(Boolean))];

  const filteredTrainees = trainees.filter(trainee => {
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(trainee.status);
    const matchesSearch = !searchTerm || 
      (trainee.name && trainee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trainee.email && trainee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trainee.employeeId && trainee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trainee.department && trainee.department.toLowerCase().includes(searchTerm.toLowerCase()));
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

  if (filteredTrainees.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No trainees found</h5>
          <p>Try adjusting your search criteria.</p>
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
      <Row className="mb-3 mt-4 form-mobile-stack search-filter-section">
        <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
          <SearchBar
            placeholder="Search trainees..."
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

      {/* Table */}
      <div className="scrollable-table-container admin-table">
        <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
          <thead className="sticky-header">
            <tr>
              <SortableHeader columnKey="name" className="show-mobile">
                Trainee
              </SortableHeader>
              {trainees.some(t => t.employeeId) && (
              <SortableHeader columnKey="employeeId" className="hide-mobile">
                Employee ID
              </SortableHeader>
              )}
              {trainees.some(t => t.department) && (
              <SortableHeader columnKey="department" className="hide-mobile">
                Department
              </SortableHeader>
              )}
              {trainees.some(t => t.enrollmentDate) && (
              <SortableHeader columnKey="enrollmentDate" className="show-mobile">
                Enrollment Date
              </SortableHeader>
              )}
              {trainees.some(t => t.status) && (
              <SortableHeader columnKey="status" className="show-mobile">
                Status
              </SortableHeader>
              )}
              {trainees.some(t => t.progress != null) && (
              <SortableHeader columnKey="progress" className="hide-mobile">
                Progress
              </SortableHeader>
              )}
              <th className="border-neutral-200 text-primary-custom fw-semibold text-center show-mobile">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((trainee) => (
              <tr key={trainee.id}>
                <td className="border-neutral-200 align-middle">
                  <div>
                    <h6 className="mb-1 fw-medium">{trainee.name || '-'}</h6>
                    {trainee.email && (
                    <small className="text-muted">
                      {trainee.email}
                    </small>
                    )}
                  </div>
                </td>
                {trainees.some(t => t.employeeId) && (
                <td className="border-neutral-200 align-middle hide-mobile">
                    {trainee.employeeId ? (
                  <div className="d-flex align-items-center">
                    <Person size={16} className="me-2 text-muted" />
                    <span>{trainee.employeeId}</span>
                  </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                </td>
                )}
                {trainees.some(t => t.department) && (
                <td className="border-neutral-200 align-middle hide-mobile">
                    {trainee.department ? (
                  <span className="text-muted">{trainee.department}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                </td>
                )}
                {trainees.some(t => t.enrollmentDate) && (
                <td className="border-neutral-200 align-middle">
                    {trainee.enrollmentDate ? (
                  <div>
                    <div className="fw-medium">{trainee.enrollmentDate}</div>
                        {trainee.lastActivity && (
                    <small className="text-muted">
                      Last activity: {trainee.lastActivity}
                    </small>
                        )}
                  </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                </td>
                )}
                {trainees.some(t => t.status) && (
                <td className="border-neutral-200 align-middle">
                    {trainee.status ? getStatusBadge(trainee.status) : <span className="text-muted">-</span>}
                </td>
                )}
                {trainees.some(t => t.progress != null) && (
                <td className="border-neutral-200 align-middle hide-mobile">
                    {trainee.progress != null && trainee.progress !== undefined ? (
                  <div className="d-flex align-items-center">
                    <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${trainee.progress}%` }}
                        aria-valuenow={trainee.progress} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small className="text-muted">{trainee.progress}%</small>
                  </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                </td>
                )}
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
                        label: 'View Profile',
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

export default TraineeList;
