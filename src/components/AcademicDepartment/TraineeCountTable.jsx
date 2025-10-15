import React, { useState, useEffect, useCallback } from 'react';
import { Table, Badge } from 'react-bootstrap';
import { People } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import TraineeActions from './TraineeActions';
import TraineeDetailsModal from './TraineeDetailsModal';
import { useParams } from 'react-router-dom';
import { traineeAPI } from '../../api/trainee';
import courseAPI from '../../api/course';
import subjectAPI from '../../api/subject';

const TraineeCountTable = ({ course, loading = false, onView, onRemove }) => {
  const { courseId } = useParams();
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [trainees, setTrainees] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState(null);

  const { sortedData, sortConfig, handleSort } = useTableSort(trainees);

  // Load enrolled trainees using same logic as EnrolledTraineesTable
  const loadEnrolledTrainees = useCallback(async () => {
    setApiLoading(true);
    setError(null);
    
    try {
      // Step 1: Get all available trainees
      const traineesResponse = await traineeAPI.getTraineesForEnrollment();
      
      if (!traineesResponse || !traineesResponse.data) {
        setTrainees([]);
        return;
      }
      
      // Step 2: For each trainee, check if they have enrollments
      const enrolledTrainees = [];
      
      for (const trainee of traineesResponse.data) {
        try {
          // Call API to get trainee's enrollment details
          const enrollmentData = await courseAPI.getTraineeEnrollments(trainee.id);
          
          // Check if trainee has any ENROLLED enrollments
          if (enrollmentData && enrollmentData.enrollments && enrollmentData.enrollments.length > 0) {
            // Filter only ENROLLED enrollments
            const enrolledEnrollments = enrollmentData.enrollments.filter(
              enrollment => enrollment.enrollment?.status === 'ENROLLED'
            );
            
            if (enrolledEnrollments.length > 0) {
              // Transform enrollment data to get subject IDs (only ENROLLED ones)
              const subjectIds = enrolledEnrollments.map(enrollment => enrollment.subject.id);
              
              const enrolledTrainee = {
                id: trainee.id,
                eid: trainee.eid,
                name: `${trainee.firstName} ${trainee.lastName}`.trim(),
                email: trainee.email,
                subjects: subjectIds,
                userId: trainee.id,
                department: trainee.department,
                enrollmentCount: enrolledEnrollments.length,
                enrollDate: enrolledEnrollments[0]?.enrollment?.enrollmentDate ? 
                  new Date(enrolledEnrollments[0].enrollment.enrollmentDate).toLocaleDateString() : 'N/A',
                enrollBatch: enrolledEnrollments[0]?.enrollment?.batchCode || 'N/A'
              };
              
              enrolledTrainees.push(enrolledTrainee);
            }
          }
        } catch {
          // Continue to next trainee
        }
      }
      
      setTrainees(enrolledTrainees);
      
    } catch {
      // Fallback to empty array if API fails
      setTrainees([]);
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courseId) {
      loadEnrolledTrainees();
    }
  }, [courseId, loadEnrolledTrainees]);

  const handleViewDetails = async (trainee) => {
    try {
      // Call API to get trainee's enrollment details
      const enrollmentData = await courseAPI.getTraineeEnrollments(trainee.userId);
      
      // Transform API data to match component format (only ENROLLED enrollments)
      const enrolledEnrollments = enrollmentData.enrollments?.filter(
        enrollment => enrollment.enrollment?.status === 'ENROLLED'
      ) || [];
      
      const transformedTrainee = {
        ...trainee,
        enrollmentDetails: enrollmentData,
        subjects: enrolledEnrollments.map(enrollment => ({
          id: enrollment.subject.id,
          name: enrollment.subject.name,
          code: enrollment.subject.code,
          status: enrollment.subject.status,
          type: enrollment.subject.type,
          method: enrollment.subject.method,
          startDate: enrollment.subject.startDate,
          endDate: enrollment.subject.endDate,
          course: enrollment.subject.course,
          enrollment: enrollment.enrollment
        }))
      };
      
      setSelectedTrainee(transformedTrainee);
      setShowDetailsModal(true);
    } catch {
      // Fallback to basic trainee data
      setSelectedTrainee(trainee);
      setShowDetailsModal(true);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTrainee(null);
  };

  const handleRemoveTrainee = async (trainee) => {
    if (window.confirm(`Are you sure you want to remove ${trainee.name} from this course?`)) {
      try {
        // Get the trainee's enrollment details to find all subjects
        const enrollmentData = await courseAPI.getTraineeEnrollments(trainee.userId);
        
        if (enrollmentData && enrollmentData.enrollments && enrollmentData.enrollments.length > 0) {
          
          // Remove trainee from each subject
          const removePromises = enrollmentData.enrollments.map(async (enrollment) => {
            const subjectId = enrollment.subject.id;
            const batchCode = enrollment.enrollment?.batchCode || 'TEST0012025';
            
            // Check if enrollment status is ENROLLED
            if (enrollment.enrollment?.status !== 'ENROLLED') {
              return null; // Skip this enrollment
            }
            
            return subjectAPI.removeTraineeFromSubject(subjectId, trainee.userId, batchCode);
          });
          
          // Wait for all removals to complete (filter out null values)
          const validPromises = removePromises.filter(promise => promise !== null);
          if (validPromises.length > 0) {
            await Promise.all(validPromises);
          }
          
          // Refresh the enrolled trainees data
          await loadEnrolledTrainees();
        }
      } catch (error) {
        console.error('Error removing trainee:', error);
        // You can add toast notification here
      }
    }
  };

  const handleRemoveSubject = async (traineeId, subjectId) => {
    try {
      // Find the trainee to get userId
      const trainee = trainees.find(t => t.id === traineeId);
      if (!trainee) return;

      // Find the subject to get batch code
      const subject = selectedTrainee?.subjects?.find(s => s.id === subjectId);
      if (!subject) return;

      const batchCode = subject.enrollment?.batchCode || 'TEST0012025';
      
      // Check if enrollment status is ENROLLED
      if (subject.enrollment?.status !== 'ENROLLED') {
        throw new Error('Cannot remove trainee from inactive enrollment');
      }
      
      // Call API to remove trainee from subject
      await subjectAPI.removeTraineeFromSubject(subjectId, trainee.userId, batchCode);
      
      // Refresh the enrolled trainees data
      await loadEnrolledTrainees();
      
      // Close modal
      setShowDetailsModal(false);
      
    } catch (error) {
      console.error('Error removing subject:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'COMPLETED':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  if (apiLoading) {
    return <LoadingSkeleton rows={4} columns={7} />;
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="text-danger">
          <h5>Error loading trainees</h5>
          <p>{error}</p>
          <button className="btn btn-outline-primary" onClick={fetchTrainees}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (trainees.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <h5>No trainees found</h5>
          <p>This course doesn't have any enrolled trainees yet.</p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;

    return (
      <th
        className={`border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 text-start ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          minWidth: '80px',
          maxWidth: '150px'
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
        <div className="d-flex align-items-center justify-content-between position-relative w-100">
          <span style={{
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '700' : '600',
            flex: '1',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {children}
          </span>
          <div
            className="d-flex align-items-center"
            style={{
              minWidth: '20px',
              justifyContent: 'center',
              flexShrink: 0
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
    <>
      <div className="department-table-container trainee-table-scroll" style={{ overflowX: 'hidden' }}>
        <Table hover className="mb-0 table-mobile-responsive" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead className="sticky-header bg-gradient-primary-custom">
            <tr>
              <SortableHeader columnKey="eid" className="show-mobile">
                EID
              </SortableHeader>
              <SortableHeader columnKey="name" className="show-mobile">
                Full Name
              </SortableHeader>
              <SortableHeader columnKey="email" className="show-mobile">
                Email
              </SortableHeader>
              <SortableHeader columnKey="subjects" className="show-mobile">
                Number of Subjects
              </SortableHeader>
              <SortableHeader columnKey="enrollDate" className="show-mobile">
                Enroll Date
              </SortableHeader>
              <SortableHeader columnKey="enrollBatch" className="show-mobile">
                Enroll Batch
              </SortableHeader>
              <th className="border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 text-center show-mobile" style={{ minWidth: '80px', maxWidth: '150px' }}>
                <div className="d-flex align-items-center justify-content-center position-relative w-100">
                  <span style={{
                    transition: 'all 0.3s ease',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    Actions
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((trainee) => (
              <tr key={trainee.id}>
                <td className="show-mobile" style={{ maxWidth: '120px', overflow: 'hidden' }}>
                  <Badge 
                    bg="secondary" 
                    className="px-2 py-1"
                    style={{ 
                      fontSize: '0.75rem',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}
                    title={trainee.eid}
                  >
                    {trainee.eid}
                  </Badge>
                </td>
                <td className="show-mobile">
                  <div 
                    className="fw-semibold text-primary-custom cursor-pointer"
                    onClick={() => handleViewDetails(trainee)}
                    style={{ cursor: 'pointer' }}
                  >
                    {trainee.name}
                  </div>
                </td>
                <td className="show-mobile">
                  <span className="text-dark" style={{ fontSize: '0.85rem' }}>
                    {trainee.email}
                  </span>
                </td>
                <td className="show-mobile">
                  <Badge 
                    bg="info" 
                    className="px-2 py-1"
                    style={{ 
                      fontSize: '0.75rem',
                      width: 'fit-content'
                    }}
                  >
                    {trainee.enrollmentCount}
                  </Badge>
                </td>
                <td className="show-mobile">
                  <span className="text-dark">
                    {trainee.enrollDate}
                  </span>
                </td>
                <td className="show-mobile" style={{ maxWidth: '120px', overflow: 'hidden' }}>
                      <Badge 
                    bg="primary" 
                        className="px-2 py-1" 
                    style={{ 
                      fontSize: '0.75rem',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}
                    title={trainee.enrollBatch}
                  >
                    {trainee.enrollBatch}
                      </Badge>
                </td>
                <td className="text-center show-mobile">
                  <TraineeActions
                    trainee={trainee}
                    onView={handleViewDetails}
                    onRemove={handleRemoveTrainee}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          </Table>
    </div>

      {/* Trainee Details Modal */}
      <TraineeDetailsModal
        show={showDetailsModal}
        onClose={handleCloseDetailsModal}
        trainee={selectedTrainee}
        onRemoveSubject={handleRemoveSubject}
      />
    </>
  );
};

export default TraineeCountTable;


