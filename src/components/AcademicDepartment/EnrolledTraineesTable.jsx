import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Modal, Button } from 'react-bootstrap';
import { People, X } from 'react-bootstrap-icons';
import { LoadingSkeleton, SortIcon } from '../Common';
import useTableSort from '../../hooks/useTableSort';
import EnrolledTraineeActions from './EnrolledTraineeActions';
import RemoveTraineeModal from './RemoveTraineeModal';
import courseAPI from '../../api/course';
import { traineeAPI } from '../../api/trainee';
import subjectAPI from '../../api/subject';


const EnrolledTraineesTable = ({ courseId, loading = false }) => {
  const [enrolledTrainees, setEnrolledTrainees] = useState([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [traineeToRemove, setTraineeToRemove] = useState(null);
  const [subjectToRemove, setSubjectToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  
  const { sortedData, sortConfig, handleSort } = useTableSort(enrolledTrainees);

  const loadEnrolledTrainees = useCallback(async () => {
    setLoadingEnrolled(true);
    try {
      // Step 1: Get all available trainees
      const traineesResponse = await traineeAPI.getTraineesForEnrollment();
      
      if (!traineesResponse || !traineesResponse.data) {
        setEnrolledTrainees([]);
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
                subjects: subjectIds,
                userId: trainee.id,
                email: trainee.email,
                department: trainee.department
              };
              
              enrolledTrainees.push(enrolledTrainee);
            }
          }
        } catch {
          // Continue to next trainee
        }
      }
      
      setEnrolledTrainees(enrolledTrainees);
      
    } catch {
      // Fallback to empty array if API fails
      setEnrolledTrainees([]);
    } finally {
      setLoadingEnrolled(false);
    }
  }, []);

  // Load enrolled trainees from API
  useEffect(() => {
    if (courseId) {
      loadEnrolledTrainees();
    }
  }, [courseId, loadEnrolledTrainees]);

  const handleViewSubjects = async (trainee) => {
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
      setShowSubjectModal(true);
    } catch {
      // Fallback to basic trainee data
      setSelectedTrainee(trainee);
      setShowSubjectModal(true);
    }
  };

  const handleRemoveTrainee = (traineeId) => {
    const trainee = enrolledTrainees.find(t => t.id === traineeId);
    if (!trainee) return;

    setTraineeToRemove(trainee);
    setSubjectToRemove(null); // null means remove from all subjects
    setShowRemoveModal(true);
  };

  const handleConfirmRemoveTrainee = async () => {
    if (!traineeToRemove) return;

    setRemoveLoading(true);
    try {
      // Get the trainee's enrollment details to find all subjects
      const enrollmentData = await courseAPI.getTraineeEnrollments(traineeToRemove.userId);
      
      if (enrollmentData && enrollmentData.enrollments && enrollmentData.enrollments.length > 0) {
        
        // Remove trainee from each subject
        const removePromises = enrollmentData.enrollments.map(async (enrollment) => {
          const subjectId = enrollment.subject.id;
          const batchCode = enrollment.enrollment?.batchCode || 'TEST0012025';
          
          // Check if enrollment status is ENROLLED
          if (enrollment.enrollment?.status !== 'ENROLLED') {
            return null; // Skip this enrollment
          }
          
          return subjectAPI.removeTraineeFromSubject(subjectId, traineeToRemove.userId, batchCode);
        });
        
        // Wait for all removals to complete (filter out null values)
        const validPromises = removePromises.filter(promise => promise !== null);
        if (validPromises.length > 0) {
          await Promise.all(validPromises);
        }
        
        // Refresh the enrolled trainees data
        await loadEnrolledTrainees();
        
        // Close modal
        setShowRemoveModal(false);
      } else {
        // Just close modal if no enrollments
        setShowRemoveModal(false);
      }
      
    } catch {
      // You can add error toast notification here
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleRemoveSubject = (traineeId, subjectId) => {
    const trainee = enrolledTrainees.find(t => t.id === traineeId);
    
    if (!trainee) return;

    // Find the subject name from the selected trainee's subjects
    const subject = selectedTrainee?.subjects?.find(s => s.id === subjectId);
    const subjectName = subject ? subject.name : 'Unknown Subject';

    setTraineeToRemove(trainee);
    setSubjectToRemove(subjectName);
    setShowRemoveModal(true);
  };

  const handleConfirmRemoveSubject = async () => {
    if (!traineeToRemove || !subjectToRemove) return;

    // Find the subject ID from the selected trainee's subjects
    const subject = selectedTrainee?.subjects?.find(s => s.name === subjectToRemove);
    if (!subject) {
      return;
    }

    setRemoveLoading(true);
    try {
      // Get batch code from enrollment data
      const batchCode = subject.enrollment?.batchCode || 'TEST0012025';
      
      // Check if enrollment status is ENROLLED
      if (subject.enrollment?.status !== 'ENROLLED') {
        // You can show a toast notification here
        return;
      }
      
      // Call API to remove trainee from subject
      await subjectAPI.removeTraineeFromSubject(subject.id, traineeToRemove.userId, batchCode);
      
      // Refresh the enrolled trainees data
      await loadEnrolledTrainees();
      
      // Close modals
      setShowRemoveModal(false);
      setShowSubjectModal(false);
      
    } catch {
      // You can add error toast notification here
    } finally {
      setRemoveLoading(false);
    }
  };



  if (loading || loadingEnrolled) {
    return (
      <Card style={{ width: '100%' }}>
        <Card.Header className="bg-gradient-primary-custom text-white border-0">
          <h6 className="mb-0 text-white">Enrolled Trainees</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <LoadingSkeleton rows={4} columns={4} />
        </Card.Body>
      </Card>
    );
  }

  if (enrolledTrainees.length === 0) {
    return (
      <Card style={{ width: '100%' }}>
        <Card.Header className="bg-gradient-primary-custom text-white border-0">
          <h6 className="mb-0 text-white">Enrolled Trainees (0)</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="text-center py-5">
            <div className="text-muted">
              <h5>No enrolled trainees</h5>
              <p>This course doesn't have any enrolled trainees yet.</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const SortableHeader = ({ columnKey, children, className = "" }) => {
    const isActive = sortConfig.key === columnKey;
    const direction = isActive ? sortConfig.direction : null;

    return (
      <th
        className={`border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 ${className} ${isActive ? 'text-primary' : 'text-muted'}`}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
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
        <div className="d-flex align-items-center justify-content-between position-relative">
          <span style={{
            transition: 'all 0.3s ease',
            fontWeight: isActive ? '700' : '600'
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
      <Card className="d-flex flex-column" style={{ height: '400px', width: '100%' }}>
        <Card.Header 
          className="bg-gradient-primary-custom text-white border-0" 
          style={{ flexShrink: 0 }}
        >
          <h6 className="mb-0 text-white">Enrolled Trainees ({enrolledTrainees.length})</h6>
        </Card.Header>
        <Card.Body 
          className="p-0" 
          style={{ 
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          <div 
            style={{ 
              height: '100%',
              overflowY: 'auto'
            }}
          >
            <Table hover className="mb-0 table-mobile-responsive">
              <thead className="sticky-header bg-gradient-primary-custom">
                <tr>
                  <SortableHeader columnKey="name" className="show-mobile">
                    Trainee
                  </SortableHeader>
                  <SortableHeader columnKey="eid" className="show-mobile">
                    EID
                  </SortableHeader>
                  <SortableHeader columnKey="subjects" className="show-mobile">
                    Subjects
                  </SortableHeader>
                  <th className="border-neutral-200 text-primary-custom fw-bold letter-spacing px-3 py-3 text-center show-mobile">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((trainee) => (
                  <tr key={trainee.id}>
                    <td className="show-mobile">
                      <div className="fw-semibold text-primary-custom">
                        {trainee.name}
                      </div>
                    </td>
                    <td className="show-mobile">
                      <Badge 
                        bg="secondary" 
                        className="px-2 py-1"
                        style={{ 
                          fontSize: '0.75rem',
                          width: 'fit-content'
                        }}
                      >
                        {trainee.eid}
                      </Badge>
                    </td>
                    <td className="show-mobile">
                      <div className="d-flex align-items-center">
                        <People size={14} className="me-1 text-muted" />
                        <Badge 
                          bg="info"
                          className="px-2 py-1"
                          style={{ 
                            fontSize: '0.75rem',
                            width: 'fit-content'
                          }}
                        >
                          {trainee.subjects.length} subjects
                        </Badge>
                      </div>
                    </td>
                    <td className="text-center show-mobile">
                      <EnrolledTraineeActions
                        trainee={trainee}
                        onViewSubjects={handleViewSubjects}
                        onRemoveTrainee={handleRemoveTrainee}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Subject List Modal */}
      <Modal show={showSubjectModal} onHide={() => setShowSubjectModal(false)} size="lg">
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="d-flex align-items-center">
            <People className="me-2" size={20} />
            {selectedTrainee?.name} - Enrolled Subjects
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedTrainee && (
            <div>
              {/* Trainee Info Header */}
              <div className="mb-4 p-3 bg-light rounded">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h6 className="mb-1 text-primary">Trainee Information</h6>
                    <div className="d-flex align-items-center">
                      <Badge bg="secondary" className="me-2">EID</Badge>
                      <span className="fw-semibold">{selectedTrainee.eid}</span>
                    </div>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <div className="text-muted small">
                      <div>Total Subjects: <Badge bg="info">{selectedTrainee.subjects.length}</Badge></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects List */}
              <div className="row g-3">
                {selectedTrainee.subjects.map(subject => (
                  <div key={subject.id} className="col-12">
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="p-3">
                        <div className="row">
                          {/* Subject Info */}
                          <div className="col-md-8">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h6 className="mb-1 text-dark">{subject.name}</h6>
                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                  <Badge bg="outline-secondary" className="text-dark border">
                                    {subject.code}
                                  </Badge>
                                  <Badge bg={subject.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                    {subject.status}
                                  </Badge>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                className="ms-2"
                                onClick={() => {
                                  handleRemoveSubject(selectedTrainee.id, subject.id);
                                }}
                              >
                                <X size={14} />
                              </Button>
                            </div>
                            
                            {/* Subject Details */}
                            <div className="row g-2 mb-3">
                              <div className="col-sm-6">
                                <div className="d-flex align-items-center">
                                  <span className="text-muted small me-2">Type:</span>
                                  <Badge bg="outline-primary" className="text-primary border">
                                    {subject.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="col-sm-6">
                                <div className="d-flex align-items-center">
                                  <span className="text-muted small me-2">Method:</span>
                                  <Badge bg="outline-info" className="text-info border">
                                    {subject.method}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <span className="text-muted small me-2">Course:</span>
                              <span className="fw-medium">{subject.course?.name}</span>
                            </div>
                          </div>

                          {/* Enrollment Info */}
                          {subject.enrollment && (
                            <div className="col-md-4">
                              <div className="p-3 bg-primary bg-opacity-10 rounded border-start border-primary border-3">
                                <h6 className="text-primary mb-2">Enrollment Details</h6>
                                <div className="space-y-2">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">Status:</span>
                                    <Badge bg="info">{subject.enrollment.status}</Badge>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">Batch:</span>
                                    <span className="fw-medium small">{subject.enrollment.batchCode}</span>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">Enrolled:</span>
                                    <span className="fw-medium small">
                                      {new Date(subject.enrollment.enrollmentDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="secondary" onClick={() => setShowSubjectModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Remove Trainee Confirmation Modal */}
      <RemoveTraineeModal
        show={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setTraineeToRemove(null);
          setSubjectToRemove(null);
          setRemoveLoading(false);
          // If we were removing from a specific subject, keep the subject modal open
          // If we were removing from all subjects, the subject modal should already be closed
        }}
        onConfirm={subjectToRemove ? handleConfirmRemoveSubject : handleConfirmRemoveTrainee}
        trainee={traineeToRemove}
        subjectName={subjectToRemove}
        loading={removeLoading}
      />
    </>
  );
};

export default EnrolledTraineesTable;
