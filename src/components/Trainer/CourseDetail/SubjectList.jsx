import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Book, Clock, CheckCircle, Eye, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, SearchBar } from '../../Common';
import TrainerFilterPanel from '../TrainerFilterPanel';
import useTableSort from '../../../hooks/useTableSort';
import '../../../styles/scrollable-table.css';

const SubjectList = ({ courseId }) => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockSubjects = [
          {
            id: 1,
            title: 'Safety Procedures - Module 1',
            code: 'SP-101',
            duration: '2 hours',
            status: 'completed',
            instructor: 'Dr. Smith',
            completionDate: '2024-01-20',
            progress: 100,
            description: 'Introduction to aviation safety procedures and protocols'
          },
          {
            id: 2,
            title: 'Risk Assessment Fundamentals',
            code: 'RAF-102',
            duration: '3 hours',
            status: 'completed',
            instructor: 'Dr. Smith',
            completionDate: '2024-01-25',
            progress: 100,
            description: 'Understanding risk assessment methodologies in aviation'
          },
          {
            id: 3,
            title: 'Emergency Response Protocols',
            code: 'ERP-103',
            duration: '2.5 hours',
            status: 'in_progress',
            instructor: 'Dr. Smith',
            completionDate: null,
            progress: 65,
            description: 'Emergency response procedures and communication protocols'
          },
          {
            id: 4,
            title: 'Regulatory Compliance',
            code: 'RC-104',
            duration: '4 hours',
            status: 'pending',
            instructor: 'Dr. Smith',
            completionDate: null,
            progress: 0,
            description: 'Understanding aviation regulations and compliance requirements'
          },
          {
            id: 5,
            title: 'Safety Management Systems',
            code: 'SMS-105',
            duration: '3.5 hours',
            status: 'pending',
            instructor: 'Dr. Smith',
            completionDate: null,
            progress: 0,
            description: 'Implementation and management of safety management systems'
          }
        ];
        
        setSubjects(mockSubjects);
      } catch (err) {
        setError('Failed to load subjects');
        console.error('Error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [courseId]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      in_progress: { variant: 'info', text: 'In Progress' },
      completed: { variant: 'success', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: 'Unknown' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleViewSubject = (subjectId) => {
    navigate(`/trainer/subjects/${subjectId}`);
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(subjects.map(subject => subject.status))];

  const filteredSubjects = subjects.filter(subject => {
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(subject.status);
    const matchesSearch = subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  const { sortedData, sortConfig, handleSort } = useTableSort(filteredSubjects);

  if (loading) {
    return <LoadingSkeleton rows={5} columns={6} />;
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

  if (filteredSubjects.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No subjects found</h5>
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
            placeholder="Search subjects..."
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
              <SortableHeader columnKey="title" className="show-mobile">
                Subject
              </SortableHeader>
              <SortableHeader columnKey="code" className="show-mobile">
                Code
              </SortableHeader>
              <SortableHeader columnKey="duration" className="hide-mobile">
                Duration
              </SortableHeader>
              <SortableHeader columnKey="status" className="show-mobile">
                Status
              </SortableHeader>
              <SortableHeader columnKey="progress" className="hide-mobile">
                Progress
              </SortableHeader>
              <th className="border-neutral-200 text-primary-custom fw-semibold text-center show-mobile">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((subject) => (
              <tr key={subject.id}>
                <td className="border-neutral-200 align-middle">
                  <div>
                    <h6 className="mb-1 fw-medium">{subject.title}</h6>
                    <small className="text-muted">
                      {subject.description}
                    </small>
                  </div>
                </td>
                <td className="border-neutral-200 align-middle">
                  <div className="d-flex align-items-center">
                    <Book size={16} className="me-2 text-muted" />
                    <span>{subject.code}</span>
                  </div>
                </td>
                <td className="border-neutral-200 align-middle hide-mobile">
                  <div className="d-flex align-items-center">
                    <Clock size={16} className="me-2 text-muted" />
                    <span>{subject.duration}</span>
                  </div>
                </td>
                <td className="border-neutral-200 align-middle">
                  {getStatusBadge(subject.status)}
                </td>
                <td className="border-neutral-200 align-middle hide-mobile">
                  <div className="d-flex align-items-center">
                    <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${subject.progress}%` }}
                        aria-valuenow={subject.progress} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small className="text-muted">{subject.progress}%</small>
                  </div>
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
                        onClick: () => handleViewSubject(subject.id)
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

export default SubjectList;
