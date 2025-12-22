import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Book, Clock, CheckCircle, Eye, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, SearchBar } from '../../Common';
import TrainerFilterPanel from '../TrainerFilterPanel';
import useTableSort from '../../../hooks/useTableSort';
import courseAPI from '../../../api/course';
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
      if (!courseId) {
        setLoading(false);
        setSubjects([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Call API to get course data
        const courseData = await courseAPI.getCourseById(courseId);

        // Extract subjects from course response
        const apiSubjects = courseData.subjects || [];

        // Map subjects - chỉ dùng data thật từ API, không tự tạo thêm
        const mappedSubjects = apiSubjects.map(subject => ({
          id: subject.id,
          title: subject.name,
          code: subject.code,
          duration: subject.duration, // Giữ nguyên format từ API
          status: subject.status, // Giữ nguyên format từ API
          description: subject.description,
          progress: subject.progress // Chỉ dùng nếu API có trả về
        })).filter(subject => subject.id); // Chỉ lấy subjects có id

        setSubjects(mappedSubjects);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load subjects');
        console.error('Error fetching subjects:', err);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [courseId]);

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusUpper = String(status).toUpperCase();
    let config = { variant: 'secondary', text: status };
    
    if (statusUpper === 'COMPLETED' || statusUpper === 'COMPLETE') {
      config = { variant: 'success', text: 'Completed' };
    } else if (statusUpper === 'ON_GOING' || statusUpper === 'ONGOING' || statusUpper === 'ON-GOING') {
      config = { variant: 'info', text: 'In Progress' };
    } else if (statusUpper === 'PLANNED' || statusUpper === 'PENDING') {
      config = { variant: 'warning', text: 'Pending' };
    } else if (statusUpper === 'ARCHIVED' || statusUpper === 'DELETED') {
      config = { variant: 'secondary', text: 'Archived' };
    }
    
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleViewSubject = (subjectId) => {
    navigate(ROUTES.SUBJECTS_DETAIL(subjectId));
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
                    <h6 className="mb-1 fw-medium">{subject.title || '-'}</h6>
                    {subject.description && (
                    <small className="text-muted">
                      {subject.description}
                    </small>
                    )}
                  </div>
                </td>
                <td className="border-neutral-200 align-middle">
                  {subject.code ? (
                  <div className="d-flex align-items-center">
                    <Book size={16} className="me-2 text-muted" />
                    <span>{subject.code}</span>
                  </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="border-neutral-200 align-middle hide-mobile">
                  {subject.duration != null && subject.duration !== undefined ? (
                  <div className="d-flex align-items-center">
                    <Clock size={16} className="me-2 text-muted" />
                    <span>{subject.duration} days</span>
                  </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="border-neutral-200 align-middle">
                  {subject.status ? getStatusBadge(subject.status) : <span className="text-muted">-</span>}
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
