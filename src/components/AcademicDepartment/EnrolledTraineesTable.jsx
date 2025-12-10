import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Modal, Button } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { LoadingSkeleton, SortIcon, PermissionWrapper } from '../Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import useTableSort from '../../hooks/useTableSort';
import EnrolledTraineeActions from './EnrolledTraineeActions';
import RemoveTraineeModal from './RemoveTraineeModal';
import courseAPI from '../../api/course';
import subjectAPI from '../../api/subject';


const EnrolledTraineesTable = ({ courseId, loading = false }) => {
  const [enrolledTrainees, setEnrolledTrainees] = useState([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [traineeToRemove, setTraineeToRemove] = useState(null);
  const [subjectToRemove, setSubjectToRemove] = useState(null); // Store subject ID
  const [subjectToRemoveName, setSubjectToRemoveName] = useState(null); // Store subject name for display
  const [removeLoading, setRemoveLoading] = useState(false);
  
  const { sortedData, sortConfig, handleSort } = useTableSort(enrolledTrainees);

  const loadEnrolledTrainees = useCallback(async () => {
    if (!courseId) {
      setEnrolledTrainees([]);
      setLoadingEnrolled(false);
      return;
    }

    setLoadingEnrolled(true);
    try {
      // Call API to get enrolled trainees (only 1 API call)
      const response = await courseAPI.getCourseTrainees(courseId);
      
      // Handle response format: { message: "...", data: { trainees: [...] } }
      const traineesList = response?.data?.trainees || response?.trainees || [];
      
      if (!Array.isArray(traineesList) || traineesList.length === 0) {
        setEnrolledTrainees([]);
        setLoadingEnrolled(false);
        return;
      }
      
      // Map API response to component format
      const mappedTrainees = traineesList.map((trainee) => {
        // Build full name from firstName, middleName, lastName
        const nameParts = [
          trainee.firstName,
          trainee.middleName,
          trainee.lastName
        ].filter(Boolean);
        const fullName = nameParts.join(' ') || 'Unknown';
        
        return {
          id: trainee.id,
          eid: trainee.eid || '',
          name: fullName,
          email: trainee.email || '',
          subjectCount: trainee.subjectCount || 0,
          userId: trainee.id
        };
      });
      
      setEnrolledTrainees(mappedTrainees);
      
    } catch (error) {
      console.error('Error loading enrolled trainees:', error);
      setEnrolledTrainees([]);
    } finally {
      setLoadingEnrolled(false);
    }
  }, [courseId]);

  // Load enrolled trainees from API
  useEffect(() => {
    if (courseId) {
      loadEnrolledTrainees();
    }
  }, [courseId, loadEnrolledTrainees]); // Include loadEnrolledTrainees since it now depends on courseId

  const handleViewSubjects = async (trainee) => {
    try {
      // Call API to get trainee enrollments for this course
      const response = await courseAPI.getTraineeEnrollments(courseId, trainee.userId);
      
      // Handle response format: { message: "...", data: { trainee: {...}, subjects: [...], totalSubjects: ... } }
      const responseData = response?.data || response;
      
      // Filter out cancelled enrollments and map API response to component format
      const filteredSubjects = (responseData.subjects || []).filter(item => 
        item.enrollment?.status !== 'CANCELLED'
      );
      
      const transformedTrainee = {
        id: trainee.id,
        eid: responseData.trainee?.eid || trainee.eid,
        name: responseData.trainee?.fullName || trainee.name,
        email: responseData.trainee?.email || trainee.email,
        department: responseData.trainee?.department || null,
        userId: responseData.trainee?.userId || trainee.userId,
        subjectCount: filteredSubjects.length,
        subjects: filteredSubjects.map(item => ({
          id: item.subject?.id,
          code: item.subject?.code,
          name: item.subject?.name,
          status: item.subject?.status,
          type: item.subject?.type,
          method: item.subject?.method,
          startDate: item.subject?.startDate,
          endDate: item.subject?.endDate,
          course: item.subject?.course,
          enrollment: item.enrollment
        }))
      };
      
      setSelectedTrainee(transformedTrainee);
      setShowSubjectModal(true);
    } catch (error) {
      console.error('Error loading trainee enrollments:', error);
      toast.error('Failed to load trainee subjects', {
        autoClose: 3000,
        position: "top-right",
        icon: false
      });
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
      // Call API to get trainee enrollments
      const response = await courseAPI.getTraineeEnrollments(courseId, traineeToRemove.userId);
      const responseData = response?.data || response;
      // Filter out cancelled enrollments before removing
      const subjects = (responseData.subjects || []).filter(item => 
        item.enrollment?.status !== 'CANCELLED'
      );
      
      if (subjects.length > 0) {
        // Remove trainee from each subject
        const removePromises = subjects.map(async (item) => {
          const subject = item.subject || item;
          const enrollment = item.enrollment;
          const subjectId = subject.id;
          const batchCode = enrollment?.batchCode;
          
          if (!batchCode) {
            return null; // Skip if no batch code
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
        
        // Show success toast
        toast.success(`Successfully removed ${traineeToRemove.name} from all subjects`, {
          autoClose: 3000,
          position: "top-right",
          icon: false
        });
        
        // Close modal
        setShowRemoveModal(false);
      } else {
        // No enrollments found
        toast.warning(`No enrollments found for ${traineeToRemove.name}`, {
          autoClose: 3000,
          position: "top-right",
          icon: false
        });
        setShowRemoveModal(false);
      }
      
    } catch (error) {
      // Show error toast
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove trainee from subjects';
      toast.error(`Error: ${errorMessage}`, {
        autoClose: 4000,
        position: "top-right",
        icon: false
      });
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleRemoveSubject = (traineeId, subjectId) => {
    const trainee = enrolledTrainees.find(t => t.id === traineeId);
    
    if (!trainee) return;

    // Find the subject from the selected trainee's subjects
    // API response format: { subject: {...}, enrollment: {...} }
    const subjectItem = selectedTrainee?.subjects?.find(item => {
      const subject = item.subject || item;
      return subject.id === subjectId;
    });
    
    if (!subjectItem) {
      toast.error('Subject not found', {
        autoClose: 3000,
        position: "top-right",
        icon: false
      });
      return;
    }

    const subject = subjectItem.subject || subjectItem;
    const subjectName = subject.name || 'Unknown Subject';

    setTraineeToRemove(trainee);
    setSubjectToRemove(subjectId); // Store subject ID
    setSubjectToRemoveName(subjectName); // Store subject name for display
    setShowRemoveModal(true);
  };

  const handleConfirmRemoveSubject = async () => {
    if (!traineeToRemove || !subjectToRemove) return;

    // Find the subject from the selected trainee's subjects by ID
    const subjectItem = selectedTrainee?.subjects?.find(item => {
      const subject = item.subject || item;
      return subject.id === subjectToRemove;
    });
    
    if (!subjectItem) {
      toast.error('Subject not found', {
        autoClose: 3000,
        position: "top-right",
        icon: false
      });
      return;
    }

    const subject = subjectItem.subject || subjectItem;
    const enrollment = subjectItem.enrollment;
    const subjectName = subject.name || 'Unknown Subject';

    setRemoveLoading(true);
    try {
      // Get batch code from enrollment data
      const batchCode = enrollment?.batchCode;
      
      if (!batchCode) {
        toast.error('Batch code not found', {
          autoClose: 3000,
          position: "top-right",
          icon: false
        });
        setRemoveLoading(false);
        return;
      }
      
      // Call API to remove trainee from subject
      await subjectAPI.removeTraineeFromSubject(subject.id, traineeToRemove.userId, batchCode);
      
      // Refresh the enrolled trainees data
      await loadEnrolledTrainees();
      
      // Show success toast
      toast.success(`Successfully removed ${traineeToRemove.name} from ${subjectName}`, {
        autoClose: 3000,
        position: "top-right",
        icon: false
      });
      
      // Close modals
      setShowRemoveModal(false);
      setShowSubjectModal(false);
      
    } catch (error) {
      // Show error toast
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove trainee from subject';
      toast.error(`Error: ${errorMessage}`, {
        autoClose: 4000,
        position: "top-right",
        icon: false
      });
    } finally {
      setRemoveLoading(false);
    }
  };



  if (loading || loadingEnrolled) {
    return (
      <div>
        <LoadingSkeleton rows={4} columns={4} />
      </div>
    );
  }

  if (enrolledTrainees.length === 0) {
    return (
      <div>
        <div className="text-center py-5">
          <div className="text-muted">
            <h5>No enrolled trainees</h5>
            <p>No trainees have been enrolled in any subjects yet.</p>
          </div>
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
            fontWeight: isActive ? '700' : '600',
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
    <>
      <div className="d-flex flex-column" style={{ height: '400px', width: '100%' }}>
        <div 
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
                    Total Subject
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
                      <Badge 
                        bg="info"
                        className="px-2 py-1"
                        style={{ 
                          fontSize: '0.75rem',
                          width: 'fit-content'
                        }}
                      >
                        {trainee.subjectCount || 0} subjects
                      </Badge>
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
        </div>
      </div>

      {/* Subject List Modal */}
      <Modal show={showSubjectModal} onHide={() => setShowSubjectModal(false)} size="lg" centered>
        <Modal.Header className="bg-gradient-primary-custom text-white border-0">
          <Modal.Title className="text-white">
            {selectedTrainee?.name} - Enrolled Subjects
          </Modal.Title>
          <Button variant="link" onClick={() => setShowSubjectModal(false)} className="text-white p-0">
            <X size={24} />
          </Button>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedTrainee && (
            <div>
              {/* Trainee Info Header */}
              <div className="mb-4 p-3 bg-primary bg-opacity-10 rounded border-start border-primary border-3">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h6 className="mb-1 text-primary-custom fw-bold">Trainee Information</h6>
                    <div className="d-flex align-items-center">
                      <Badge bg="primary-custom" className="me-2 text-white">EID</Badge>
                      <span className="fw-semibold text-primary-custom">{selectedTrainee.eid}</span>
                    </div>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <div className="text-primary-custom small">
                      <div>Total Subjects: <Badge bg="primary-custom" className="text-white">{selectedTrainee.subjectCount || 0}</Badge></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects List */}
              {selectedTrainee.subjects && selectedTrainee.subjects.length > 0 ? (
                <div className="row g-3">
                  {selectedTrainee.subjects.map((item, index) => {
                    const subject = item.subject || item;
                    const enrollment = item.enrollment;
                    
                    return (
                      <div key={subject.id || index} className="col-12">
                        <Card className="border-0 shadow-sm">
                          <Card.Body className="p-3">
                            <div className="row">
                              {/* Subject Info */}
                              <div className="col-md-8">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div>
                                    <h6 className="mb-1 text-primary-custom fw-bold">{subject.name}</h6>
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                      <Badge bg="primary-custom" className="text-white">
                                        {subject.code}
                                      </Badge>
                                      <Badge bg={subject.status === 'ON_GOING' ? 'success' : 'primary-custom'} className={subject.status === 'ON_GOING' ? '' : 'text-white'}>
                                        {subject.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <PermissionWrapper
                                    permission={PERMISSION_IDS.REMOVE_TRAINEE_FROM_ENROLLMENT}
                                    fallback={null}
                                  >
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
                                  </PermissionWrapper>
                                </div>
                                
                                {/* Subject Details */}
                                <div className="row g-2 mb-3">
                                  <div className="col-sm-6">
                                    <div className="d-flex align-items-center">
                                      <span className="text-primary-custom small me-2 fw-semibold">Type:</span>
                                      <Badge bg="primary-custom" className="text-white">
                                        {subject.type}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="col-sm-6">
                                    <div className="d-flex align-items-center">
                                      <span className="text-primary-custom small me-2 fw-semibold">Method:</span>
                                      <Badge bg="primary-custom" className="text-white">
                                        {subject.method}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                {subject.course && (
                                  <div className="mb-3">
                                    <span className="text-primary-custom small me-2 fw-semibold">Course:</span>
                                    <span className="fw-medium text-primary-custom">{subject.course.name}</span>
                                  </div>
                                )}
                                
                                {subject.startDate && subject.endDate && (
                                  <div className="mb-3">
                                    <span className="text-primary-custom small me-2 fw-semibold">Duration:</span>
                                    <span className="fw-medium text-primary-custom">
                                      {new Date(subject.startDate).toLocaleDateString()} - {new Date(subject.endDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Enrollment Info */}
                              {enrollment && (
                                <div className="col-md-4">
                                  <div className="p-3 bg-primary bg-opacity-10 rounded border-start border-primary border-3">
                                    <h6 className="text-primary-custom mb-2 fw-bold">Enrollment Details</h6>
                                    <div className="space-y-2">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-primary-custom small fw-semibold">Status:</span>
                                        <Badge bg="primary-custom" className="text-white">{enrollment.status}</Badge>
                                      </div>
                                      {enrollment.batchCode && (
                                        <div className="d-flex justify-content-between align-items-center">
                                          <span className="text-primary-custom small fw-semibold">Batch:</span>
                                          <span className="fw-medium small text-primary-custom">{enrollment.batchCode}</span>
                                        </div>
                                      )}
                                      {enrollment.enrollmentDate && (
                                        <div className="d-flex justify-content-between align-items-center">
                                          <span className="text-primary-custom small fw-semibold">Enrolled:</span>
                                          <span className="fw-medium small text-primary-custom">
                                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No subjects found</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="primary-custom" className="text-white" onClick={() => setShowSubjectModal(false)}>
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
          setSubjectToRemoveName(null);
          setRemoveLoading(false);
          // If we were removing from a specific subject, keep the subject modal open
          // If we were removing from all subjects, the subject modal should already be closed
        }}
        onConfirm={subjectToRemove ? handleConfirmRemoveSubject : handleConfirmRemoveTrainee}
        trainee={traineeToRemove}
        subjectName={subjectToRemoveName}
        loading={removeLoading}
      />
    </>
  );
};

export default EnrolledTraineesTable;
