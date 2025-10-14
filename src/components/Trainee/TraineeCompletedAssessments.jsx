import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner } from 'react-bootstrap';
import { CheckCircle, Clock, ExclamationTriangle, ThreeDotsVertical } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { LoadingSkeleton } from '../Common';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import SortableHeader from './SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

// Add custom CSS to remove table borders
const completedTableStyles = `
  .completed-assessments-table-no-borders .table,
  .completed-assessments-table-no-borders .table td,
  .completed-assessments-table-no-borders .table th,
  .completed-assessments-table-no-borders .table tbody tr,
  .completed-assessments-table-no-borders .table thead tr {
    border: none !important;
    border-top: none !important;
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
  }
  .completed-assessments-table-no-borders .table tbody tr {
    border-bottom: 1px solid #f0f0f0 !important;
  }
  .completed-assessments-table-no-borders .table tbody tr:last-child {
    border-bottom: none !important;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = completedTableStyles;
  document.head.appendChild(styleSheet);
}

const TraineeCompletedAssessments = ({ traineeId, courseId, subjectId }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { sortedData, sortConfig, handleSort } = useTableSort(assessments);

  useEffect(() => {
    loadCompletedAssessments();
  }, [traineeId, courseId, subjectId]);

  const loadCompletedAssessments = async () => {
    try {
      setLoading(true);
      
      // Mock data for completed assessments
      const mockCompletedAssessments = [
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
          completedDate: '2024-01-20T14:30:00.000Z',
          score: 85,
          status: 'COMPLETED',
          maxScore: 100
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
          completedDate: '2024-01-18T10:15:00.000Z',
          score: 92,
          status: 'COMPLETED',
          maxScore: 100
        },
        {
          id: '3',
          name: 'Equipment Handling Quiz',
          description: 'Short quiz on proper equipment handling procedures',
          course: {
            name: 'Safety Procedures Training',
            code: 'SAF001'
          },
          subject: {
            name: 'Equipment Handling',
            code: 'EH'
          },
          type: 'Quiz',
          priority: 'MEDIUM',
          completedDate: '2024-01-15T16:45:00.000Z',
          score: 78,
          status: 'COMPLETED',
          maxScore: 100
        }
      ];

      // Filter by courseId and subjectId if provided
      let filteredAssessments = mockCompletedAssessments;
      
      if (courseId) {
        filteredAssessments = filteredAssessments.filter(assessment => 
          assessment.course?.code === 'SAF001' // Mock filter by course
        );
      }
      
      if (subjectId) {
        filteredAssessments = filteredAssessments.filter(assessment => 
          assessment.subject?.code === 'BSP' // Mock filter by subject
        );
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setAssessments(filteredAssessments);
    } catch (error) {
      console.error('Error loading completed assessments:', error);
      toast.error('Failed to load completed assessments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'COMPLETED': { variant: 'success', text: 'Completed', icon: CheckCircle },
      'PASSED': { variant: 'success', text: 'Passed', icon: CheckCircle },
      'FAILED': { variant: 'danger', text: 'Failed', icon: ExclamationTriangle }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: CheckCircle };
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const getScoreBadge = (score, maxScore) => {
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

  const handleViewAssessment = (assessment) => {
    console.log('View completed assessment:', assessment.id);
    // TODO: Navigate to assessment results/details
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <LoadingSkeleton count={5} />
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-4">
        <CheckCircle size={32} className="text-muted mb-2" />
        <p className="text-muted mb-0">No completed assessments</p>
      </div>
    );
  }

  return (
    <div className="scrollable-table-container admin-table completed-assessments-table-no-borders">
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
            {!subjectId && (
              <th className="text-start">
                <SortableHeader 
                  title="Subject" 
                  sortKey="subject" 
                  sortConfig={sortConfig} 
                  onSort={handleSort} 
                />
              </th>
            )}
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
                title="Score" 
                sortKey="score" 
                sortConfig={sortConfig} 
                onSort={handleSort} 
              />
            </th>
            <th className="text-start">
              <SortableHeader 
                title="Completed Date" 
                sortKey="completedDate" 
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
          {sortedData.map((assessment) => (
            <tr key={assessment.id}>
              <td>
                <div className="fw-semibold">{assessment.name}</div>
                <small className="text-muted">{assessment.description}</small>
              </td>
              {!subjectId && (
                <td>
                  <div className="fw-semibold">{assessment.subject?.name || 'N/A'}</div>
                  <small className="text-muted">{assessment.subject?.code || ''}</small>
                </td>
              )}
              <td>
                <Badge bg="primary" className="fw-normal">
                  {assessment.type || 'Assessment'}
                </Badge>
              </td>
              <td>
                {getScoreBadge(assessment.score, assessment.maxScore)}
              </td>
              <td>
                {assessment.completedDate ? new Date(assessment.completedDate).toLocaleDateString() : 'N/A'}
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
                      label: 'View Results',
                      icon: <CheckCircle />,
                      onClick: () => handleViewAssessment(assessment)
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

export default TraineeCompletedAssessments;
