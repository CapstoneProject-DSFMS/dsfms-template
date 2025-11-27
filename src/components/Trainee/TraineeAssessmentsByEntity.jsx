import React, { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Spinner, Alert, Card } from 'react-bootstrap';
import { CheckCircle, Clock, ExclamationTriangle, ThreeDotsVertical } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import assessmentAPI from '../../api/assessment';
import PortalUnifiedDropdown from '../Common/PortalUnifiedDropdown';
import SortableHeader from './SortableHeader';
import useTableSort from '../../hooks/useTableSort';
import '../../styles/scrollable-table.css';

/**
 * Component to display assessments for a specific course or subject
 * @param {string} entityType - 'course' or 'subject'
 * @param {string} entityId - The course or subject ID
 */
const TraineeAssessmentsByEntity = ({ entityType, entityId }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const { sortedData, sortConfig, handleSort } = useTableSort(assessments);

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      // Call the appropriate API based on entity type
      if (entityType === 'course') {
        response = await assessmentAPI.getCourseAssessments(entityId);
      } else if (entityType === 'subject') {
        response = await assessmentAPI.getSubjectAssessments(entityId);
      } else {
        throw new Error('Invalid entity type');
      }

      // Extract info from response
      const info = response?.courseInfo || response?.subjectInfo;
      setInfo(info);

      // Get all assessments (no filtering by type)
      const allAssessments = response?.assessments || [];
      setAssessments(allAssessments);
    } catch (err) {
      console.error('Error loading assessments:', err);
      // Extract error message from API response
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load assessments';
      setError(errorMessage);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    if (entityType && entityId) {
      loadAssessments();
    }
  }, [entityType, entityId, loadAssessments]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ON_GOING': { variant: 'info', text: 'On Going', icon: Clock },
      'PENDING': { variant: 'warning', text: 'Pending', icon: Clock },
      'NOT_STARTED': { variant: 'warning', text: 'Not Started', icon: Clock },
      'APPROVED': { variant: 'success', text: 'Approved', icon: CheckCircle },
      'COMPLETED': { variant: 'success', text: 'Completed', icon: CheckCircle },
      'REJECTED': { variant: 'danger', text: 'Rejected', icon: ExclamationTriangle },
      'CANCELLED': { variant: 'secondary', text: 'Cancelled', icon: ExclamationTriangle }
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: ExclamationTriangle };
    const IconComponent = config.icon;

    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <IconComponent size={12} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const getResultBadge = (resultScore, resultText) => {
    if (!resultScore && !resultText) return <span className="text-muted">-</span>;
    
    if (resultText === 'NOT_APPLICABLE') {
      return <Badge bg="secondary">N/A</Badge>;
    }

    return resultText || resultScore || '-';
  };

  const handleViewAssessment = (assessment) => {
    navigate(`/trainee/assessment/${assessment.id}`, {
      state: {
        assessment,
        entityType,
        entityId
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="text-muted mt-2 mb-0">Loading assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-0">
        <ExclamationTriangle size={16} className="me-2" />
        {error}
      </Alert>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-4">
        <CheckCircle size={32} className="text-muted mb-2" />
        <p className="text-muted mb-0">No assessments available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="scrollable-table-container admin-table">
        <Table hover className="mb-0 table-mobile-responsive" style={{ fontSize: '0.875rem' }}>
          <thead className="sticky-header">
            <tr>
              <th className="border-neutral-200 text-primary-custom fw-semibold">
                <SortableHeader 
                  title="Assessment Name" 
                  sortKey="name" 
                  sortConfig={sortConfig} 
                  onSort={handleSort} 
                />
              </th>
              <th className="border-neutral-200 text-primary-custom fw-semibold">
                <SortableHeader 
                  title="Trainee" 
                  sortKey="trainee" 
                  sortConfig={sortConfig} 
                  onSort={handleSort} 
                />
              </th>
              <th className="border-neutral-200 text-primary-custom fw-semibold">
                <SortableHeader 
                  title="Date" 
                  sortKey="occuranceDate" 
                  sortConfig={sortConfig} 
                  onSort={handleSort} 
                />
              </th>
              <th className="border-neutral-200 text-primary-custom fw-semibold">
                <SortableHeader 
                  title="Status" 
                  sortKey="status" 
                  sortConfig={sortConfig} 
                  onSort={handleSort} 
                />
              </th>
              <th className="border-neutral-200 text-primary-custom fw-semibold">Score</th>
              <th className="border-neutral-200 text-primary-custom fw-semibold">Result</th>
              <th className="border-neutral-200 text-primary-custom fw-semibold text-center">Actions</th>
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
                <td className="border-neutral-200 align-middle">
                  <div className="fw-medium text-dark">{assessment.name}</div>
                  {assessment.comment && <small className="text-muted">{assessment.comment}</small>}
                </td>
                <td className="border-neutral-200 align-middle">
                  <div className="fw-medium text-dark">{assessment.trainee?.fullName}</div>
                  <small className="text-muted">{assessment.trainee?.eid}</small>
                </td>
                <td className="border-neutral-200 align-middle">
                  <span className="text-dark">
                    {assessment.occuranceDate ? new Date(assessment.occuranceDate).toLocaleDateString() : 'N/A'}
                  </span>
                </td>
                <td className="border-neutral-200 align-middle">
                  {getStatusBadge(assessment.status)}
                </td>
                <td className="border-neutral-200 align-middle">
                  <Badge bg={assessment.resultScore >= 70 ? 'success' : 'warning'}>
                    {assessment.resultScore || '-'}
                  </Badge>
                </td>
                <td className="border-neutral-200 align-middle">
                  {getResultBadge(assessment.resultScore, assessment.resultText)}
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

      {/* Info below table */}
      {info && (
        <Card className="mt-3" style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body className="py-2">
            <small className="text-muted">
              <strong>{entityType === 'course' ? 'Course' : 'Subject'}:</strong> {info.name} ({info.code})
              {info.course && entityType === 'subject' && (
                <> | <strong>Course:</strong> {info.course.name} ({info.course.code})</>
              )}
            </small>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default TraineeAssessmentsByEntity;
