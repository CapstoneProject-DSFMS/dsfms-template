import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Badge, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { ClipboardCheck, Clock, Person, Book, Eye, CheckCircle, XCircle, Funnel, ThreeDotsVertical } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon, PortalUnifiedDropdown, SearchBar } from '../Common';
import TrainerFilterPanel from './TrainerFilterPanel';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

const SectionCompletionList = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
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
            lastActivity: '2024-01-12',
            estimatedTime: '4 hours'
          }
        ];
        
        setSections(mockSections);
      } catch (err) {
        setError('Failed to fetch section completion data');
        console.error('Error fetching sections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      in_progress: { variant: 'info', text: 'In Progress' },
      completed: { variant: 'success', text: 'Completed' },
      overdue: { variant: 'danger', text: 'Overdue' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: 'Unknown' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { variant: 'danger', text: 'High' },
      medium: { variant: 'warning', text: 'Medium' },
      low: { variant: 'success', text: 'Low' }
    };
    
    const config = priorityConfig[priority] || { variant: 'secondary', text: 'Unknown' };
    return <Badge bg={config.variant} className="me-1">{config.text}</Badge>;
  };

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(sections.map(section => section.status))];

  const filteredSections = sortedData.filter(section => {
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(section.status);
    const matchesSearch = searchTerm === '' || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.trainee.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const handleViewDetails = (sectionId) => {
    console.log('View details for section:', sectionId);
    // Implement view details logic
  };

  const handleMarkComplete = (sectionId) => {
    console.log('Mark complete for section:', sectionId);
    // Implement mark complete logic
  };

  const handleSendReminder = (sectionId) => {
    console.log('Send reminder for section:', sectionId);
    // Implement send reminder logic
  };

  const handleExportReport = () => {
    console.log('Export section completion report');
    // Implement export logic
  };

  const dropdownItems = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: handleViewDetails,
      variant: 'primary'
    },
    {
      label: 'Mark Complete',
      icon: CheckCircle,
      onClick: handleMarkComplete,
      variant: 'success'
    },
    {
      label: 'Send Reminder',
      icon: Clock,
      onClick: handleSendReminder,
      variant: 'warning'
    }
  ];

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <div className="p-4">
      {/* Search and Filter Section */}
      <Row className="mb-3 mt-4 form-mobile-stack search-filter-section">
        <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
          <SearchBar
            placeholder="Search sections, trainees, or courses..."
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
              <th onClick={() => handleSort('title')} className="sortable border-neutral-200 text-primary-custom fw-semibold">
                Section <SortIcon sortConfig={sortConfig} columnKey="title" />
              </th>
              <th onClick={() => handleSort('course')} className="sortable border-neutral-200 text-primary-custom fw-semibold">
                Course <SortIcon sortConfig={sortConfig} columnKey="course" />
              </th>
              <th onClick={() => handleSort('trainee')} className="sortable border-neutral-200 text-primary-custom fw-semibold">
                Trainee <SortIcon sortConfig={sortConfig} columnKey="trainee" />
              </th>
              <th onClick={() => handleSort('dueDate')} className="sortable border-neutral-200 text-primary-custom fw-semibold">
                Due Date <SortIcon sortConfig={sortConfig} columnKey="dueDate" />
              </th>
              <th onClick={() => handleSort('status')} className="sortable border-neutral-200 text-primary-custom fw-semibold">
                Status <SortIcon sortConfig={sortConfig} columnKey="status" />
              </th>
              <th className="border-neutral-200 text-primary-custom fw-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSections.map((section) => (
              <tr key={section.id}>
                <td className="border-neutral-200 align-middle">
                  <div>
                    <div className="fw-bold">{section.title}</div>
                    <small className="text-muted">
                      <Clock size={12} className="me-1" />
                      Est. {section.estimatedTime}
                    </small>
                  </div>
                </td>
                <td className="border-neutral-200 align-middle">
                  <div>
                    <div className="fw-bold">{section.course}</div>
                    <small className="text-muted">
                      <Person size={12} className="me-1" />
                      {section.instructor}
                    </small>
                  </div>
                </td>
                <td className="border-neutral-200 align-middle">
                  <div>
                    <div className="fw-bold">{section.trainee}</div>
                    <small className="text-muted">
                      Last activity: {section.lastActivity}
                    </small>
                  </div>
                </td>
                <td className="border-neutral-200 align-middle">
                  <div>
                    <div className="fw-bold">{section.dueDate}</div>
                    <small className="text-muted">
                      {getPriorityBadge(section.priority)}
                    </small>
                  </div>
                </td>
                <td className="border-neutral-200 align-middle">
                  <div>
                    {getStatusBadge(section.status)}
                    <div className="mt-1">
                      <small className="text-muted">
                        Progress: {section.progress}%
                      </small>
                    </div>
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
                        onClick: () => handleViewDetails(section.id)
                      },
                      {
                        label: 'Mark Complete',
                        icon: <CheckCircle />,
                        onClick: () => handleMarkComplete(section.id)
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

export default SectionCompletionList;
