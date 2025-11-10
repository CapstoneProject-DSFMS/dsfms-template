import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import { ClipboardCheck, Clock, CheckCircle, ExclamationTriangle, Calendar, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoadingSkeleton, SortIcon } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

const TraineeAllAssessmentEvents = ({ traineeId, courseId }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { sortedData, sortConfig, handleSort } = useTableSort(assessments);

  useEffect(() => {
    if (traineeId) {
      loadAllAssessments();
    }
  }, [traineeId, courseId]);

  const loadAllAssessments = async () => {
    try {
      setLoading(true);
      
      // Mock data combining upcoming and completed assessments
      const mockUpcoming = [
        {
          id: '1',
          name: 'Emergency Procedures Test',
          type: 'Written',
          subject: 'Emergency Procedures',
          dueDate: '2024-02-15T10:00:00.000Z',
          status: 'UPCOMING',
          priority: 'HIGH'
        },
        {
          id: '2',
          name: 'Flight Simulation Practical',
          type: 'Practical',
          subject: 'Flight Operations',
          dueDate: '2024-02-18T14:00:00.000Z',
          status: 'UPCOMING',
          priority: 'MEDIUM'
        },
        {
          id: '3',
          name: 'Safety Protocol Review',
          type: 'Oral',
          subject: 'Safety Protocols',
          dueDate: '2024-02-20T09:00:00.000Z',
          status: 'UPCOMING',
          priority: 'LOW'
        }
      ];

      const mockCompleted = [
        {
          id: '4',
          name: 'Safety Procedures Final Exam',
          description: 'Comprehensive final examination covering all safety procedures',
          type: 'Written Test',
          subject: 'Basic Safety Protocols',
          priority: 'HIGH',
          completedDate: '2024-01-20T14:30:00.000Z',
          score: 85,
          status: 'COMPLETED',
          maxScore: 100
        },
        {
          id: '5',
          name: 'Emergency Response Practical',
          description: 'Hands-on assessment of emergency response procedures',
          type: 'Practical Assessment',
          subject: 'Emergency Procedures',
          priority: 'HIGH',
          completedDate: '2024-01-18T10:15:00.000Z',
          score: 92,
          status: 'COMPLETED',
          maxScore: 100
        },
        {
          id: '6',
          name: 'Equipment Handling Quiz',
          description: 'Short quiz on proper equipment handling procedures',
          type: 'Quiz',
          subject: 'Equipment Handling',
          priority: 'MEDIUM',
          completedDate: '2024-01-15T16:45:00.000Z',
          score: 78,
          status: 'COMPLETED',
          maxScore: 100
        }
      ];

      // Combine and sort by date (upcoming first, then completed)
      const allAssessments = [
        ...mockUpcoming.map(a => ({ ...a, isUpcoming: true })),
        ...mockCompleted.map(a => ({ ...a, isUpcoming: false }))
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setAssessments(allAssessments);
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'UPCOMING': { variant: 'warning', text: 'Upcoming', icon: Clock },
      'PENDING': { variant: 'warning', text: 'Pending', icon: Clock },
      'IN_PROGRESS': { variant: 'info', text: 'In Progress', icon: ClipboardCheck },
      'COMPLETED': { variant: 'success', text: 'Completed', icon: CheckCircle },
      'PASSED': { variant: 'success', text: 'Passed', icon: CheckCircle },
      'FAILED': { variant: 'danger', text: 'Failed', icon: ExclamationTriangle },
      'OVERDUE': { variant: 'danger', text: 'Overdue', icon: ExclamationTriangle }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: ClipboardCheck };
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
      'HIGH': { variant: 'danger', text: 'High' },
      'MEDIUM': { variant: 'warning', text: 'Medium' },
      'LOW': { variant: 'info', text: 'Low' }
    };
    
    const config = priorityConfig[priority] || { variant: 'secondary', text: priority };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'WRITTEN': { variant: 'primary', text: 'Written' },
      'PRACTICAL': { variant: 'success', text: 'Practical' },
      'ORAL': { variant: 'info', text: 'Oral' },
      'ONLINE': { variant: 'secondary', text: 'Online' },
      'QUIZ': { variant: 'secondary', text: 'Quiz' }
    };
    
    const config = typeConfig[type?.toUpperCase()] || { variant: 'secondary', text: type };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getScoreBadge = (score, maxScore) => {
    if (!score || !maxScore) return null;
    const percentage = (score / maxScore) * 100;
    let variant = 'success';
    
    if (percentage < 60) {
      variant = 'danger';
    } else if (percentage < 80) {
      variant = 'warning';
    }
    
    return (
      <Badge bg={variant}>
        {score}/{maxScore} ({percentage.toFixed(0)}%)
      </Badge>
    );
  };

  const handleStartAssessment = async (assessmentId) => {
    try {
      navigate(`/trainee/${traineeId}/assessment/${assessmentId}?action=start`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Failed to start assessment');
    }
  };

  const handleViewAssessment = (assessmentId) => {
    navigate(`/trainee/${traineeId}/assessment/${assessmentId}`);
  };

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

  if (loading) {
    return <LoadingSkeleton rows={5} columns={8} />;
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No assessment events</h5>
          <p>Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scrollable-table-container admin-table">
      <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
        <thead className="sticky-header">
          <tr>
            <SortableHeader columnKey="name" className="show-mobile">
              Assessment
            </SortableHeader>
            <SortableHeader columnKey="subject" className="show-mobile">
              Subject
            </SortableHeader>
            <SortableHeader columnKey="type" className="show-mobile">
              Type
            </SortableHeader>
            <SortableHeader columnKey="priority" className="show-mobile">
              Priority
            </SortableHeader>
            <SortableHeader columnKey="dueDate" className="show-mobile">
              Date
            </SortableHeader>
            <SortableHeader columnKey="score" className="show-mobile">
              Score
            </SortableHeader>
            <SortableHeader columnKey="status" className="show-mobile">
              Status
            </SortableHeader>
            <th 
              className="fw-semibold text-center show-mobile"
              style={{
                backgroundColor: 'var(--bs-primary)',
                color: 'white',
                borderColor: 'var(--bs-primary)'
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((assessment, index) => (
            <tr 
              key={assessment.id}
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
                <div className="fw-medium text-dark">
                  {assessment.name}
                </div>
                {assessment.description && (
                  <small className="text-muted">{assessment.description}</small>
                )}
              </td>
              <td className="align-middle show-mobile">
                <span className="text-dark">
                  {assessment.subject}
                </span>
              </td>
              <td className="align-middle show-mobile">
                {getTypeBadge(assessment.type)}
              </td>
              <td className="align-middle show-mobile">
                {getPriorityBadge(assessment.priority)}
              </td>
              <td className="align-middle show-mobile">
                {assessment.isUpcoming ? (
                  <div className="d-flex align-items-center">
                    <Clock className="text-muted me-1" size={14} />
                    <span className="text-dark">
                      {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                ) : (
                  <span className="text-dark">
                    {assessment.completedDate ? new Date(assessment.completedDate).toLocaleDateString() : 'N/A'}
                  </span>
                )}
              </td>
              <td className="align-middle show-mobile">
                {assessment.isUpcoming ? (
                  <span className="text-muted">-</span>
                ) : (
                  getScoreBadge(assessment.score, assessment.maxScore)
                )}
              </td>
              <td className="align-middle show-mobile">
                {getStatusBadge(assessment.status)}
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
                  items={assessment.isUpcoming ? [
                    {
                      label: 'Start Assessment',
                      icon: <ClipboardCheck />,
                      onClick: () => handleStartAssessment(assessment.id)
                    }
                  ] : [
                    {
                      label: 'View Results',
                      icon: <CheckCircle />,
                      onClick: () => handleViewAssessment(assessment.id)
                    }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TraineeAllAssessmentEvents;

