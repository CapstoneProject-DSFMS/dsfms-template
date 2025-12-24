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

  // Fetch all available trainees on component mount
  useEffect(() => {
    const fetchAllAvailableTrainees = async () => {
      try {
        setLoadingTrainees(true);
        const response = await traineeAPI.getTraineesForEnrollment();
        setAvailableTrainees(response.data?.trainees || []);
      } catch (error) {
        console.error('Error fetching trainees:', error);
        toast.error('Failed to load available trainees');
        setAvailableTrainees([]);
      } finally {
        setLoadingTrainees(false);
      }
    };

    if (courseId) {
      fetchAllAvailableTrainees();
    }
  }, [courseId]);

  // Handle subject selection/deselection (no API call needed)
  const handleSubjectToggle = (newSelectedSubjects) => {
    setSelectedSubjects(newSelectedSubjects);
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
          name: `${trainee.lastName}${trainee.middleName ? ' ' + trainee.middleName : ''} ${trainee.firstName}`.trim(), // Combined name for display
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
        
        return trainee.id;
      });
      
      // Backend expects camelCase format with all subjects at once
      const enrollData = {
        batchCode: String(batchCode).trim(),
        traineeUserIds: traineeIds,
        subjectIds: selectedSubjects
      };

      // Call bulk API with all subjects and trainees
      const response = await subjectAPI.assignTraineesToMultipleSubjects(enrollData);
      
      console.log('Full response:', response);
      
      // Response structure: { message: "...", data: { summaryMessage: "...", totalRequested, enrolledCount, duplicateCount, invalidCount } }
      const responseData = response?.data || {};
      const apiSummaryMessage = responseData.summaryMessage || response?.message || 'Enrollment completed';
      const enrolledCount = responseData.enrolledCount || 0;
      const duplicateCount = responseData.duplicateCount || 0;
      const invalidCount = responseData.invalidCount || 0;
      const totalRequested = responseData.totalRequested || 0;
      
      console.log('Enrollment summary:', { enrolledCount, duplicateCount, invalidCount, totalRequested, summaryMessage: apiSummaryMessage });
      
      // Build appropriate message based on enrollment results
      let displayMessage = apiSummaryMessage;
      
      if (enrolledCount === 0) {
        const failedCount = duplicateCount + invalidCount;
        displayMessage = `No trainees were enrolled. ${failedCount}/${totalRequested} trainees failed as they have already been enrolled into this course.`;
      }
      
      // Show summary message
      if (enrolledCount > 0) {
        toast.success(displayMessage, {
          autoClose: 5000,
          position: "top-right"
        });
      } else if ((duplicateCount > 0 || invalidCount > 0) && enrolledCount === 0) {
        toast.warning(displayMessage, {
          autoClose: 5000,
          position: "top-right"
        });
      } else {
        toast.info(displayMessage, {
          autoClose: 5000,
          position: "top-right"
        });
      }
      
      //If there are any successful enrollments, clear selections and redirect
      if (enrolledCount > 0) {
        setSelectedTrainees([]);
        setSelectedSubjects([]);
        
        // Redirect to course detail page with trainees tab active
        setTimeout(() => {
          navigate(ROUTES.ACADEMIC_COURSE_DETAIL(courseId), {
            state: { activeTab: 'trainees' },
            replace: true
          });
        }, 1500);
      }
        
    } catch (error) {
      console.error('Catch block error:', error);
      console.error('Error response:', error.response?.data);
      
      // Try to extract error messages from response
      const errorMessagesList = error.response?.data?.data?.errorMessages || error.response?.data?.errorMessages || [];
      const errorMessage = error.response?.data?.message || error.message || 'Failed to enroll trainees';
      
      // Show general error message first
      toast.error(errorMessage, {
        autoClose: 5000,
        position: "top-right"
      });
      
      // Show detailed error messages if available
      if (errorMessagesList && errorMessagesList.length > 0) {
        errorMessagesList.forEach((message, index) => {
          setTimeout(() => {
            toast.error(message, {
              autoClose: 5000,
              position: "top-right"
            });
          }, (index + 1) * 100);
        });
      }
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
