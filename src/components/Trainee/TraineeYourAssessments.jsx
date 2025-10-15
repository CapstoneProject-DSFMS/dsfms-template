import React, { useState, useEffect, useMemo } from 'react';
import { Table, Badge, Button, Spinner, Tabs, Tab, Row, Col, Card } from 'react-bootstrap';
import { ClipboardCheck, Clock, CheckCircle, ExclamationTriangle, Pen, ThreeDotsVertical, Eye, Play } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import traineeAPI from '../../api/trainee';
import { LoadingSkeleton, SortIcon, SearchBar } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import AssessmentFilterPanel from './AssessmentFilterPanel';
import SortableHeader from './SortableHeader';
import TraineeUpcomingAssessments from './TraineeUpcomingAssessments';
import TraineeCompletedAssessments from './TraineeCompletedAssessments';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

// Add custom CSS to remove table borders
const tableStyles = `
  .assessments-table-no-borders .table,
  .assessments-table-no-borders .table td,
  .assessments-table-no-borders .table th,
  .assessments-table-no-borders .table tbody tr,
  .assessments-table-no-borders .table thead tr {
    border: none !important;
    border-top: none !important;
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
  }
  .assessments-table-no-borders .table tbody tr {
    border-bottom: 1px solid #f0f0f0 !important;
  }
  .assessments-table-no-borders .table tbody tr:last-child {
    border-bottom: none !important;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = tableStyles;
  document.head.appendChild(styleSheet);
}

const TraineeYourAssessments = ({ traineeId }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  const { sortedData: sortedAssessments, sortConfig, handleSort } = useTableSort(assessments);

  useEffect(() => {
    loadAssessments();
  }, [traineeId]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      
      // Mock data for assessments
      const mockAssessments = [
        {
          id: '1',
          name: 'Safety Procedures Final Exam',
          description: 'Comprehensive final examination covering all safety procedures',
          course: {
            name: 'Safety Procedures Training',
            code: 'SAF001'
          },
          subject: {
            name: 'Basic Safety Protocols',
            code: 'BSP'
          },
          type: 'Written Test',
          priority: 'HIGH',
          dueDate: '2024-01-25T14:30:00.000Z',
          status: 'PENDING'
        },
        {
          id: '2',
          name: 'Emergency Response Practical',
          description: 'Hands-on assessment of emergency response procedures',
          course: {
            name: 'Safety Procedures Training',
            code: 'SAF001'
          },
          subject: {
            name: 'Emergency Procedures',
            code: 'EP'
          },
          type: 'Practical Assessment',
          priority: 'HIGH',
          dueDate: '2024-01-28T10:15:00.000Z',
          status: 'IN_PROGRESS'
        },
        {
          id: '3',
          name: 'Equipment Handling Quiz',
          description: 'Short quiz on proper equipment handling procedures',
          course: {
            name: 'Equipment Handling Course',
            code: 'EHC001'
          },
          subject: {
            name: 'Equipment Handling',
            code: 'EH'
          },
          type: 'Quiz',
          priority: 'MEDIUM',
          dueDate: '2024-02-01T16:45:00.000Z',
          status: 'PENDING'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setAssessments(mockAssessments);
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  // Filter assessments based on search term and selected filters
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const matchesSearch = searchTerm === '' || 
        assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.course?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.subject?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(assessment.type);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(assessment.status);
      const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(assessment.priority);

      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [assessments, searchTerm, selectedTypes, selectedStatuses, selectedPriorities]);

  // Get unique values for filters
  const uniqueTypes = useMemo(() => {
    const types = [...new Set(assessments.map(assessment => assessment.type))];
    return types.filter(Boolean);
  }, [assessments]);

  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(assessments.map(assessment => assessment.status))];
    return statuses.filter(Boolean);
  }, [assessments]);

  const uniquePriorities = useMemo(() => {
    const priorities = [...new Set(assessments.map(assessment => assessment.priority))];
    return priorities.filter(Boolean);
  }, [assessments]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handlePriorityToggle = (priority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSearchTerm('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { variant: 'warning', text: 'Pending' },
      'IN_PROGRESS': { variant: 'primary', text: 'In Progress' },
      'COMPLETED': { variant: 'success', text: 'Completed' },
      'OVERDUE': { variant: 'danger', text: 'Overdue' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    
    return (
      <Badge bg={config.variant}>
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'HIGH': { variant: 'danger', text: 'High' },
      'MEDIUM': { variant: 'warning', text: 'Medium' },
      'LOW': { variant: 'success', text: 'Low' }
    };
    
    const config = priorityConfig[priority] || { variant: 'secondary', text: priority };
    
    return (
      <Badge bg={config.variant}>
        {config.text}
      </Badge>
    );
  };

  const handleStartAssessment = (assessment) => {
    console.log('Start assessment:', assessment.id);
    // TODO: Navigate to assessment or open assessment modal
    toast.info('Assessment functionality coming soon');
  };

  const handleViewAssessment = (assessment) => {
    console.log('View assessment:', assessment.id);
    // TODO: Navigate to assessment details
    toast.info('Assessment details functionality coming soon');
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="trainee-your-assessments">
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Tabs defaultActiveKey="upcoming" className="border-bottom">
            <Tab eventKey="upcoming" title="Upcoming Assessments">
              <div className="p-3">
                {/* Search and Filters */}
                <div style={{ marginBottom: '3rem' }}>
                  <Row className="form-mobile-stack">
                    <Col xs={12} lg={6} md={5} className="mb-2 mb-lg-0">
                      <SearchBar
                        placeholder="Search assessments by name, description, course, or subject..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-bar-mobile"
                      />
                    </Col>
                    <Col xs={12} lg={3} md={4} className="mb-2 mb-lg-0 position-relative">
                      <AssessmentFilterPanel
                        uniqueTypes={uniqueTypes}
                        uniqueStatuses={uniqueStatuses}
                        uniquePriorities={uniquePriorities}
                        selectedTypes={selectedTypes}
                        selectedStatuses={selectedStatuses}
                        selectedPriorities={selectedPriorities}
                        onTypeToggle={handleTypeToggle}
                        onStatusToggle={handleStatusToggle}
                        onPriorityToggle={handlePriorityToggle}
                        onClearFilters={handleClearFilters}
                        className="filter-panel-mobile"
                      />
                    </Col>
                    <Col xs={12} lg={3} md={3}>
                      <div className="text-end text-mobile-center">
                        <small className="text-muted">
                          {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? 's' : ''}
                        </small>
                      </div>
                    </Col>
                  </Row>
                </div>

                {filteredAssessments.length === 0 ? (
                  <div className="text-center py-4">
                    <ClipboardCheck size={32} className="text-muted mb-2" />
                    <p className="text-muted mb-0">
                      {assessments.length === 0 ? 'No upcoming assessments' : 'No assessments match your filters'}
                    </p>
                  </div>
                ) : (
                  <div className="scrollable-table-container admin-table assessments-table-no-borders">
                    <Table hover className="mb-0 table-hover" borderless>
                      <thead className="table-light">
                        <tr>
                          <th className="text-start">
                            <SortableHeader 
                              title="Assessment" 
                              sortKey="name" 
                              sortConfig={sortConfig} 
                              onSort={handleSort} 
                            />
                          </th>
                          <th className="text-start">
                            <SortableHeader 
                              title="Course" 
                              sortKey="course" 
                              sortConfig={sortConfig} 
                              onSort={handleSort} 
                            />
                          </th>
                          <th className="text-start">
                            <SortableHeader 
                              title="Subject" 
                              sortKey="subject" 
                              sortConfig={sortConfig} 
                              onSort={handleSort} 
                            />
                          </th>
                          <th className="text-start">
                            <SortableHeader 
                              title="Type" 
                              sortKey="type" 
                              sortConfig={sortConfig} 
                              onSort={handleSort} 
                            />
                          </th>
                          <th className="text-start">
                            <SortableHeader 
                              title="Priority" 
                              sortKey="priority" 
                              sortConfig={sortConfig} 
                              onSort={handleSort} 
                            />
                          </th>
                          <th className="text-start">
                            <SortableHeader 
                              title="Due Date" 
                              sortKey="dueDate" 
                              sortConfig={sortConfig} 
                              onSort={handleSort} 
                            />
                          </th>
                          <th className="text-start">
                            <SortableHeader 
                              title="Status" 
                              sortKey="status" 
                              sortConfig={sortConfig} 
                              onSort={handleSort} 
                            />
                          </th>
                          <th className="text-start">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedAssessments.map((assessment) => (
                          <tr key={assessment.id}>
                            <td>
                              <div className="fw-semibold">{assessment.name}</div>
                              <small className="text-muted">{assessment.description}</small>
                            </td>
                            <td>
                              <div className="fw-semibold">{assessment.course?.name || 'N/A'}</div>
                              <small className="text-muted">{assessment.course?.code || ''}</small>
                            </td>
                            <td>
                              <div className="fw-semibold">{assessment.subject?.name || 'N/A'}</div>
                              <small className="text-muted">{assessment.subject?.code || ''}</small>
                            </td>
                            <td>
                              <Badge bg="primary" className="fw-normal">
                                {assessment.type || 'Assessment'}
                              </Badge>
                            </td>
                            <td>{getPriorityBadge(assessment.priority)}</td>
                            <td>
                              {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td>{getStatusBadge(assessment.status)}</td>
                            <td>
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
                                    label: assessment.status === 'PENDING' || assessment.status === 'IN_PROGRESS' ? 'Start Assessment' : 'View Assessment',
                                    icon: assessment.status === 'PENDING' || assessment.status === 'IN_PROGRESS' ? <Play /> : <Eye />,
                                    onClick: () => assessment.status === 'PENDING' || assessment.status === 'IN_PROGRESS' ? handleStartAssessment(assessment) : handleViewAssessment(assessment)
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
            </Tab>

            <Tab eventKey="completed" title="Completed Assessments">
              <div className="p-3">
                <TraineeCompletedAssessments 
                  traineeId={traineeId} 
                />
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TraineeYourAssessments;
