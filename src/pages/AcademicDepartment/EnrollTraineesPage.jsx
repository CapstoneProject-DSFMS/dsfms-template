import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { ArrowLeft, Upload, Search, Plus } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { toast } from 'react-toastify';
import SubjectSelectionPanel from '../../components/AcademicDepartment/SubjectSelectionPanel';
import TraineeSelectionPanel from '../../components/AcademicDepartment/TraineeSelectionPanel';
import BulkImportTraineesModal from '../../components/AcademicDepartment/BulkImportTraineesModal';
import BatchCodeModal from '../../components/AcademicDepartment/BatchCodeModal';
import courseAPI from '../../api/course';
import subjectAPI from '../../api/subject';
import traineeAPI from '../../api/trainee';
import { PermissionWrapper } from '../../components/Common'; // Add this
import { PERMISSION_IDS } from '../../constants/permissionIds'; // Add this

const EnrollTraineesPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  // State for course data
  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseSubjects, setCourseSubjects] = useState([]);

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBatchCodeModal, setShowBatchCodeModal] = useState(false);
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [subjectsMap, setSubjectsMap] = useState({}); // Map subjectId to subject name/code
  const [availableTrainees, setAvailableTrainees] = useState([]);
  const [loadingTrainees, setLoadingTrainees] = useState(false);

  // Load course data from API
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setCourseLoading(true);
        const response = await courseAPI.getCourseById(courseId);
        setCourse(response);
        
        // Extract subjects from course response and set them
        if (response.subjects && Array.isArray(response.subjects)) {
          const activeSubjects = response.subjects.filter(subject => {
            const status = subject?.status?.toUpperCase();
            return status !== 'ARCHIVED' && !subject?.deletedAt;
          });
          setCourseSubjects(activeSubjects);
          
          // Create subjects map for reference
          const map = {};
          activeSubjects.forEach(subject => {
            map[subject.id] = {
              name: subject.name,
              code: subject.code
            };
          });
          setSubjectsMap(map);
        }
      } catch (error) {
        console.error('Error loading course data:', error);
        toast.error('Failed to load course data', {
          autoClose: 3000,
          position: "top-right"
        });
      } finally {
        setCourseLoading(false);
      }
    };

    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  // Optional: Keep this for backward compatibility if subjectsMap is used elsewhere
  useEffect(() => {
    // Fallback removed - subjects are loaded from course API only
  }, []);

  // Fetch available trainees when selected subjects change
  const fetchAvailableTrainees = async (subjectIds) => {
    try {
      setLoadingTrainees(true);
      const response = await traineeAPI.getTraineesForEnrollment(subjectIds);
      setAvailableTrainees(response.data?.trainees || []);
    } catch (error) {
      console.error('Error fetching trainees:', error);
      toast.error('Failed to load available trainees');
      setAvailableTrainees([]);
    } finally {
      setLoadingTrainees(false);
    }
  };

  // Handle subject selection/deselection
  const handleSubjectToggle = async (newSelectedSubjects) => {
    setSelectedSubjects(newSelectedSubjects);
    
    // Fetch trainees for selected subjects
    if (newSelectedSubjects.length > 0) {
      await fetchAvailableTrainees(newSelectedSubjects);
    } else {
      setAvailableTrainees([]);
    }
  };

  // Show loading state while course is loading
  if (courseLoading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading course details...</p>
        </div>
      </Container>
    );
  }

  // Show error state if course couldn't be loaded
  if (!course) {
    return (
      <Container className="py-4">
        <div className="text-center text-muted">
          <h4>Course not found</h4>
          <p>The requested course could not be found.</p>
          <Button variant="primary" onClick={() => navigate('/academic/departments')}>
            <ArrowLeft className="me-2" />
            Back to Departments
          </Button>
        </div>
      </Container>
    );
  }

  const handleBack = () => {
    // Navigate back using browser history (don't push new entry)
    navigate(-1);
  };

  const handleBulkImport = () => {
    setShowBulkImport(true);
  };

  const handleBulkImportTrainees = async (trainees) => {
    // Prevent duplicate calls
    if (bulkImportLoading) {
      return;
    }
    
    setBulkImportLoading(true);
    try {
      // Use real trainees from API lookup (they already have proper UUIDs)
      const newTrainees = trainees.map((trainee) => {
        return {
          id: trainee.id, // Use real UUID from API
          eid: trainee.eid,
          name: `${trainee.firstName} ${trainee.lastName}`.trim(), // Combined name for display
          firstName: trainee.firstName,
          lastName: trainee.lastName,
          email: trainee.email,
          phoneNumber: trainee.phoneNumber,
          status: trainee.status,
          subjects: []
        };
      });
      
      // Check for duplicates and only add new trainees
      setSelectedTrainees(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newUniqueTrainees = newTrainees.filter(trainee => !existingIds.has(trainee.id));
        
        // Only show toast if there are actual changes
        if (newUniqueTrainees.length === 0 && newTrainees.length > 0) {
          // Use setTimeout to prevent duplicate toasts
          setTimeout(() => {
            toast.error('All selected trainees are already in the list!', {
              autoClose: 3000,
              position: "top-right",
              toastId: 'duplicate-trainees', // Prevent duplicate toasts
              closeButton: false // Remove close button
            });
          }, 100);
        } else if (newUniqueTrainees.length < newTrainees.length && newUniqueTrainees.length > 0) {
          setTimeout(() => {
            toast.warning(`Added ${newUniqueTrainees.length} new trainees. ${newTrainees.length - newUniqueTrainees.length} were already selected.`, {
              autoClose: 4000,
              position: "top-right",
              toastId: 'partial-duplicates', // Prevent duplicate toasts
              closeButton: false // Remove close button
            });
          }, 100);
        } else if (newUniqueTrainees.length === newTrainees.length && newUniqueTrainees.length > 0) {
          // All trainees were successfully added (no duplicates)
          setTimeout(() => {
            toast.success(`Successfully added ${newUniqueTrainees.length} trainee${newUniqueTrainees.length > 1 ? 's' : ''} to the selection!`, {
              autoClose: 3000,
              position: "top-right",
              toastId: 'bulk-import-success', // Prevent duplicate toasts
              closeButton: false // Remove close button
            });
          }, 100);
        }
        
        return [...prev, ...newUniqueTrainees];
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      throw error;
    } finally {
      setBulkImportLoading(false);
    }
  };

  const handleEnroll = () => {
    if (selectedSubjects.length === 0 || selectedTrainees.length === 0) {
      toast.warning('Please select both subjects and trainees to enroll');
      return;
    }

    // Show batch code modal instead of directly enrolling
    setShowBatchCodeModal(true);
  };

  const handleBatchCodeConfirm = async (batchCode) => {
    setEnrollLoading(true);
    setShowBatchCodeModal(false);
    
    try {
      // Validate trainee IDs
      const traineeIds = selectedTrainees.map(trainee => {
        if (!trainee.id) {
          throw new Error(`Trainee ${trainee.eid} (${trainee.firstName} ${trainee.lastName}) is missing UUID`);
        }
        
        return trainee.id; // Just the user IDs as array
      });
      
      // Backend expects camelCase format
      const traineeData = {
        batchCode: String(batchCode).trim(), // Ensure it's a string
        traineeUserIds: traineeIds // Array of UUIDs
      };

      // Call API for each selected subject with subject name tracking
      const enrollmentPromises = selectedSubjects.map(async (subjectId) => {
        if (!subjectId) {
          const subjectInfo = subjectsMap[subjectId] || { name: 'Unknown', code: 'N/A' };
          throw new Error(`Invalid subject ID: ${subjectId} (${subjectInfo.name})`);
        }
        
        try {
          const response = await subjectAPI.assignTrainees(subjectId, traineeData);
          return { 
            subjectId, 
            response, 
            status: 'success',
            subjectName: subjectsMap[subjectId]?.name || 'Unknown Subject',
            subjectCode: subjectsMap[subjectId]?.code || 'N/A'
          };
        } catch (error) {
          // Return error info instead of throwing
          const subjectInfo = subjectsMap[subjectId] || { name: 'Unknown Subject', code: 'N/A' };
          return {
            subjectId,
            status: 'error',
            error,
            subjectName: subjectInfo.name,
            subjectCode: subjectInfo.code,
            errorMessage: error.response?.data?.message || error.message || 'Unknown error',
            errorDetails: error.response?.data
          };
        }
      });

      // Wait for all enrollments to complete (use allSettled to get all results)
      const enrollmentResults = await Promise.allSettled(enrollmentPromises);
      
      // Process results
      const successful = [];
      const failed = [];
      
      enrollmentResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const enrollment = result.value;
          if (enrollment.status === 'success') {
            successful.push(enrollment);
          } else {
            failed.push(enrollment);
          }
        } else {
          // Promise rejected
          const subjectId = selectedSubjects[index];
          const subjectInfo = subjectsMap[subjectId] || { name: 'Unknown Subject', code: 'N/A' };
          failed.push({
            subjectId,
            status: 'error',
            subjectName: subjectInfo.name,
            subjectCode: subjectInfo.code,
            errorMessage: result.reason?.message || 'Unknown error',
            errorDetails: result.reason
          });
        }
      });

      // Show detailed error messages for each failed subject
      if (failed.length > 0) {
        failed.forEach((failure) => {
          const errorMsg = failure.errorMessage || 'Unknown error';
          const subjectDisplay = `${failure.subjectName} (${failure.subjectCode})`;
          
          // Extract more specific error if available
          let detailedError = errorMsg;
          if (failure.errorDetails?.message) {
            detailedError = failure.errorDetails.message;
          } else if (failure.errorDetails?.errors && Array.isArray(failure.errorDetails.errors)) {
            detailedError = failure.errorDetails.errors.map(e => e.message || e).join(', ');
          }
          
          toast.error(`${subjectDisplay}: ${detailedError}`, {
            autoClose: 5000,
            position: "top-right",
            icon: false
          });
        });
      }

      // Show success message if any succeeded
      if (successful.length > 0) {
        const enrolledCount = selectedTrainees.length;
        toast.success(`Successfully enrolled ${enrolledCount} trainee(s) to ${successful.length} subject(s): ${successful.map(s => s.subjectName).join(', ')}`, {
          autoClose: 4000,
          position: "top-right",
          icon: false
        });
        
        // Clear only successful subjects from selection
        if (failed.length === 0) {
          // All succeeded, clear all
          setSelectedTrainees([]);
          setSelectedSubjects([]);
        } else {
          // Some failed, only clear successful subjects (keep failed ones)
          const successfulSubjectIds = new Set(successful.map(s => s.subjectId));
          setSelectedSubjects(prev => prev.filter(id => !successfulSubjectIds.has(id)));
        }
        
        // Redirect to course detail page with trainees tab active when at least one enrollment succeeded
        setTimeout(() => {
          navigate(ROUTES.ACADEMIC_COURSE_DETAIL(courseId), {
            state: { activeTab: 'trainees' }
          });
        }, 1000); // Delay to show toast before redirect
      }
      
    } catch (error) {
      // This catch should rarely be hit now since we handle errors in allSettled
      
      let errorMessage = 'Failed to enroll trainees. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <Container fluid className="py-4 px-4 enroll-page" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header - Fixed */}
      <div className="mb-4 flex-shrink-0">
          <div className="d-flex align-items-center mb-3">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleBack}
              className="me-3"
            >
              <ArrowLeft size={16} className="me-1" />
              Back
            </Button>
            <div>
              <h5 className="mb-0 text-primary">
                Enroll Trainees - <strong>{course.name}</strong> ({course.code})
              </h5>
            </div>
          </div>

          {/* Course Info */}
          <Card className="mb-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Card.Body className="py-4 px-4">
              <Row>
                <Col md={8}>
                  <p className="mb-0 text-muted">{course.description}</p>
                </Col>
                <Col md={4} className="text-end d-flex justify-content-end align-items-center gap-2">
                                    <PermissionWrapper
                                      permission={PERMISSION_IDS.BULK_ENROLL_TRAINEES}
                                      fallback={null}
                                    >
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={handleEnroll}
                                        disabled={selectedSubjects.length === 0 || selectedTrainees.length === 0 || enrollLoading}
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                      >
                                        {enrollLoading ? (
                                          <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" style={{ width: '0.5rem', height: '0.5rem' }}></span>
                                            Enrolling...
                                          </>
                                        ) : (
                                          <>
                                            <Plus size={12} className="me-1" /> Enroll
                                          </>
                                        )}
                                      </Button>
                                    </PermissionWrapper>
                                    <PermissionWrapper
                                      permission={PERMISSION_IDS.BULK_ENROLL_TRAINEES}
                                      fallback={null}
                                    >
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={handleBulkImport}
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                      >
                                        <Upload size={12} className="me-1" /> Bulk Import Trainees
                                      </Button>
                                    </PermissionWrapper>                </Col>
              </Row>
            </Card.Body>
          </Card>
      </div>

      {/* Main Content - Two Columns */}
      <div className="mb-4 flex-shrink-0 main-content-section" style={{ position: 'relative', zIndex: 1, marginBottom: '3rem' }}>
        <Row className="g-4">
          {/* Panel 1: Subject Selection */}
          <Col lg={6}>
            <div style={{ height: '500px', position: 'relative', zIndex: 1, overflow: 'visible', marginBottom: '2rem' }}>
              <SubjectSelectionPanel 
                selectedSubjects={selectedSubjects}
                onSelectionChange={handleSubjectToggle}
                subjects={courseSubjects}
              />
            </div>
          </Col>

          {/* Panel 2: Trainee Selection */}
          <Col lg={6}>
            <div style={{ height: '500px', position: 'relative', zIndex: 1, overflow: 'hidden', marginBottom: '2rem' }}>
              <TraineeSelectionPanel 
                selectedTrainees={selectedTrainees}
                onSelectionChange={setSelectedTrainees}
                subjects={courseSubjects}
                availableTrainees={availableTrainees}
                loadingTrainees={loadingTrainees}
              />
            </div>
          </Col>
        </Row>
      </div>


      {/* Bulk Import Modal */}
      <BulkImportTraineesModal
        show={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImportTrainees}
        loading={bulkImportLoading}
      />

      {/* Batch Code Modal */}
      <BatchCodeModal
        show={showBatchCodeModal}
        onClose={() => setShowBatchCodeModal(false)}
        onConfirm={handleBatchCodeConfirm}
        loading={enrollLoading}
      />
    </Container>
  );
};

export default EnrollTraineesPage;
