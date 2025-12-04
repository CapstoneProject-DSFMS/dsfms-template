import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Container, Badge, Nav, Tab } from 'react-bootstrap';
import { Plus, Upload, Pencil, ArrowLeft, People, Calendar, GeoAlt, FileText, Award, PersonCheck, Book, CalendarEvent, Trash } from 'react-bootstrap-icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '../../constants/routes';
import { PermissionWrapper } from '../../components/Common';
import { PERMISSION_IDS } from '../../constants/permissionIds';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { isDepartmentHead } from '../../utils/sidebarUtils';
import courseAPI from '../../api/course';
import subjectAPI from '../../api/subject';
import SubjectTable from '../../components/AcademicDepartment/SubjectTable';
import EnrolledTraineesTable from '../../components/AcademicDepartment/EnrolledTraineesTable';
import AddSubjectModal from '../../components/AcademicDepartment/AddSubjectModal';
import BulkImportSubjectsModal from '../../components/AcademicDepartment/BulkImportSubjectsModal';
import EditCourseModal from '../../components/AcademicDepartment/EditCourseModal';
import DisableSubjectModal from '../../components/AcademicDepartment/DisableSubjectModal';
import AssessmentEventsList from '../../components/AcademicDepartment/AssessmentEventsList';
import AssessmentEventDetailModal from '../../components/AcademicDepartment/AssessmentEventDetailModal';
import DeleteBatchEnrollmentsModal from '../../components/AcademicDepartment/DeleteBatchEnrollmentsModal';
import AddTrainerModal from '../../components/AcademicDepartment/AddTrainerModal';
import RemoveTrainerModal from '../../components/AcademicDepartment/RemoveTrainerModal';

const InPageCourseDetail = ({ course, department } = {}) => {
  const navigate = useNavigate();
  const { courseId, traineeId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  // Check if this is trainee view or academic view
  const isTraineeView = traineeId !== undefined;
  
  // Check if user is Department Head
  const isDeptHead = isDepartmentHead(user);
  
  // Modal states
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showDisableSubject, setShowDisableSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showAssessmentEventDetail, setShowAssessmentEventDetail] = useState(false);
  const [selectedAssessmentEvent, setSelectedAssessmentEvent] = useState(null);
  const [showDeleteBatchEnrollments, setShowDeleteBatchEnrollments] = useState(false);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showRemoveTrainer, setShowRemoveTrainer] = useState(false);
  const [selectedTrainerToRemove, setSelectedTrainerToRemove] = useState(null);
  const [isAddingTrainer, setIsAddingTrainer] = useState(false);
  
  // Course details state
  const [courseDetails, setCourseDetails] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [hasApiData, setHasApiData] = useState(false); // Track if we have API data

  // Helper function to filter out archived subjects
  const filterArchivedSubjects = (subjectsList) => {
    if (!Array.isArray(subjectsList)) return [];
    return subjectsList.filter(subject => {
      // Filter out subjects with status 'ARCHIVED' or deletedAt field
      const status = subject?.status?.toUpperCase();
      return status !== 'ARCHIVED' && !subject?.deletedAt;
    });
  };
  
  // Active tab state - check location state for initial tab
  const [activeTab, setActiveTab] = useState(() => {
    // Check if location state has activeTab (from redirect)
    if (location.state?.activeTab) {
      return location.state.activeTab;
    }
    return 'course-info';
  });
  
  // Update activeTab when location state changes (e.g., after redirect)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent it from persisting
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Fetch course details from API - includes subjects
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!courseId) {
        return;
      }
      
      setLoading(true);
      try {
        const response = await courseAPI.getCourseById(courseId);
        
        // Check response structure
        if (!response) {
          throw new Error('Invalid API response');
        }
        
        // Transform API data to match component format
        const transformedCourseDetails = {
          id: response.id || courseId,
          name: response.name,
          code: response.code,
          description: response.description,
          maxTrainees: response.maxNumTrainee,
          maxNumTrainee: response.maxNumTrainee,
          venue: response.venue,
          note: response.note,
          passScore: response.passScore,
          startDate: response.startDate ? new Date(response.startDate).toISOString().split('T')[0] : '',
          endDate: response.endDate ? new Date(response.endDate).toISOString().split('T')[0] : '',
          level: response.level,
          status: response.status,
          department: response.department,
          subjectCount: response.subjectCount || 0,
          traineeCount: response.traineeCount || 0,
          trainerCount: response.trainerCount || 0,
          instructors: response.instructors || [] // Add instructors from API
        };
        
        setCourseDetails(transformedCourseDetails);
        
        // Extract and set subjects from API response (filter out archived)
        if (response.subjects && Array.isArray(response.subjects)) {
          setSubjects(filterArchivedSubjects(response.subjects));
        } else if (response.subjectCount > 0 && !response.subjects) {
          setSubjects([]);
        } else {
          setSubjects([]);
        }
        
        setLoading(false);
      } catch {
        // If API fails (404 or other errors), use course prop if available
        if (course && course.id && course.name) {
          const fallbackCourseDetails = {
            id: course.id,
            name: course.name,
            code: course.code || 'N/A',
            description: course.description || "Course information not available.",
            maxTrainees: course.maxNumTrainee || course.maxTrainees || 50,
            maxNumTrainee: course.maxNumTrainee || course.maxTrainees || 50,
            venue: course.venue || 'N/A',
            note: course.note || '',
            passScore: course.passScore || 80,
            startDate: course.startDate ? (typeof course.startDate === 'string' ? course.startDate.split('T')[0] : new Date(course.startDate).toISOString().split('T')[0]) : '',
            endDate: course.endDate ? (typeof course.endDate === 'string' ? course.endDate.split('T')[0] : new Date(course.endDate).toISOString().split('T')[0]) : '',
            level: course.level || 'N/A',
            status: course.status || 'ACTIVE',
            department: course.department || department,
            subjectCount: course.subjectCount || 0,
            traineeCount: course.traineeCount || 0,
            trainerCount: course.trainerCount || 0,
            instructors: course.instructors || [] // Add instructors from fallback
          };
          setCourseDetails(fallbackCourseDetails);
          setSubjects([]); // Subjects not available from course prop
        } else {
          // No course prop available - show error state
          setCourseDetails(null);
          setSubjects([]);
        }
        
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId]);
  
  const handleBack = () => {
    // If this is trainee view, navigate back to enrolled courses
    if (isTraineeView) {
      navigate(ROUTES.COURSES_ENROLLED);
    } else {
      // Navigate back to department details for academic view
      if (department?.id) {
        navigate(`/academic/course/${department.id}`);
      } else {
        navigate('/academic/departments');
      }
    }
  };

  // Show loading state
  if (loading) {
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

  // Show error state if no course details
  if (!courseDetails) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h5 className="text-muted">Course not found</h5>
          <p className="text-muted">The requested course could not be loaded.</p>
          <Button variant="primary" onClick={handleBack}>
            <ArrowLeft className="me-2" />
            {isTraineeView ? 'Back to Enrolled Courses' : 'Back to Department'}
          </Button>
        </div>
      </Container>
    );
  }

  const handleViewSubject = (subjectId) => {
    navigate(`/academic/course/${courseId}/subject/${subjectId}`); // Keep old route for now (academic-specific)
  };

  const handleEditSubject = () => {
    // TODO: Implement edit subject functionality
  };

  const handleDeleteSubject = (subjectId) => {
    // Find the subject from current subjects state
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      setSelectedSubject(subject);
      setShowDisableSubject(true);
    }
  };

  const handleConfirmDisableSubject = async () => {
    if (!selectedSubject) return;
    
    setIsDisabling(true);
    try {
      // Call API to archive subject
      await subjectAPI.archiveSubject(selectedSubject.id);
      
      // Show success toast
      toast.success(`Successfully archived subject "${selectedSubject.name}"`, {
        autoClose: 3000,
        position: "top-right",
        icon: false
      });
      
      // OPTIMIZED: Remove subject from state directly instead of refetching entire course
      setSubjects(prev => prev.filter(s => s.id !== selectedSubject.id));
      
      // Close modal
      setShowDisableSubject(false);
      setSelectedSubject(null);
    } catch (error) {
      // Show error toast
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to archive subject';
      toast.error(`Error: ${errorMessage}`, {
        autoClose: 4000,
        position: "top-right",
        icon: false
      });
    } finally {
      setIsDisabling(false);
    }
  };

  const handleEnrollTrainees = () => {
    navigate(`/academic/course/${courseDetails?.id}/enroll-trainees`); // Keep old route for now (academic-specific)
  };

  // Modal handlers
  const handleAddSubject = async () => {
    try {
      // OPTIMIZED: Reload subjects from database after adding new subject
      // AddSubjectModal will call this callback after successful creation
      // We need to refetch subjects to get the newly added subject
      const response = await courseAPI.getCourseById(courseId);
      if (response.subjects && Array.isArray(response.subjects)) {
        setSubjects(filterArchivedSubjects(response.subjects));
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to refresh subjects after creation';
      toast.error(`Error: ${errorMessage}`, {
        autoClose: 4000,
        position: "top-right",
        icon: false
      });
    }
  };

  const handleBulkImportSubjects = async (subjectsData) => {
    // Call bulk import API and return response
    const result = await subjectAPI.bulkImportSubjects(subjectsData);
    
    // OPTIMIZED: Reload subjects to include newly imported subjects
    const response = await courseAPI.getCourseById(courseId);
    if (response.subjects && Array.isArray(response.subjects)) {
      setSubjects(filterArchivedSubjects(response.subjects));
    }
    
    setShowBulkImport(false);
    
    // Return result so modal can display appropriate message
    return result;
  };

  const handleEditCourse = async (updatedCourseData) => {
    try {
      // Call API to update course
      await courseAPI.updateCourse(courseId, updatedCourseData);
      
      // OPTIMIZED: Update course details directly from form data instead of full refetch
      setCourseDetails(prev => ({
        ...prev,
        ...updatedCourseData,
        id: prev.id,
        subjectCount: prev.subjectCount,
        traineeCount: prev.traineeCount,
        trainerCount: prev.trainerCount,
        subjects: prev.subjects
      }));
      
      setShowEditCourse(false);
    } catch (error) {
      // Handle error - could show toast notification
      console.error('Error updating course:', error);
    }
  };

  const handleAddTrainer = async (trainerData) => {
    try {
      setIsAddingTrainer(true);
      
      // Call API to assign trainer to course
      // POST {{baseUrl}}/courses/{courseId}/trainers
      await courseAPI.assignTrainerToCourse(courseId, trainerData);
      
      toast.success('Trainer assigned successfully!', {
        autoClose: 3000,
        position: "top-right"
      });
      
      setShowAddTrainer(false);
      
      // Reload course details to get updated instructors list
      const response = await courseAPI.getCourseById(courseId);
      if (response) {
        setCourseDetails(prev => ({
          ...prev,
          instructors: response.instructors || []
        }));
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to assign trainer';
      toast.error(`Error: ${errorMessage}`, {
        autoClose: 4000,
        position: "top-right",
        icon: false
      });
      console.error('Error assigning trainer:', error);
    } finally {
      setIsAddingTrainer(false);
    }
  };

  const handleRemoveTrainer = async (trainerId) => {
    if (!trainerId) return;
    
    // Find trainer object for modal
    const trainer = courseDetails?.instructors?.find(instr => instr.id === trainerId);
    setSelectedTrainerToRemove(trainer);
    setShowRemoveTrainer(true);
  };

  const handleConfirmRemoveTrainer = async (trainerId) => {
    try {
      setIsAddingTrainer(true);
      
      // Call API to remove trainer from course
      // DELETE {{baseUrl}}/courses/{courseId}/trainers/{trainerId}
      await courseAPI.removeTrainerFromCourse(courseId, trainerId);
      
      toast.success('Trainer removed successfully!', {
        autoClose: 3000,
        position: "top-right"
      });
      
      // Update instructors list by removing the trainer
      setCourseDetails(prev => ({
        ...prev,
        instructors: (prev.instructors || []).filter(instr => instr.id !== trainerId),
        trainerCount: Math.max(0, (prev.trainerCount || 0) - 1)
      }));
      
      setShowRemoveTrainer(false);
      setSelectedTrainerToRemove(null);
    } catch (error) {
      // Extract error message from API response
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove trainer';
      
      // Show error toast
      toast.error(`Error: ${errorMessage}`, {
        autoClose: 4000,
        position: "top-right",
        icon: false
      });
      
      console.error('Error removing trainer:', error);
    } finally {
      setIsAddingTrainer(false);
    }
  };

  return (
    <Container fluid className="py-2 course-detail">
      {/* Header với nút Back */}
      <div className="d-flex align-items-center mb-2">
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
          <h4 className="mb-0 text-primary">
            <strong>{courseDetails?.name || 'Loading...'}</strong> — {courseDetails?.code || ''}
          </h4>
          <small className="text-muted">Course Details</small>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* Left Group - Enroll Trainees */}
        <div className="d-flex">
          <PermissionWrapper 
            permission={PERMISSION_IDS.ENROLL_SINGLE_TRAINEE}
            fallback={null}
          >
            <Button size="sm" variant="primary" onClick={handleEnrollTrainees}>
              <People size={14} className="me-1" /> Enroll Trainees
            </Button>
          </PermissionWrapper>
        </div>

        {/* Right Group - Subject Management & Edit Course */}
        <div className="d-flex gap-2">
          <PermissionWrapper 
            permission={PERMISSION_IDS.UPDATE_COURSE}
            fallback={null}
          >
            <Button size="sm" variant="outline-secondary" onClick={() => setShowEditCourse(true)}>
              <Pencil size={14} className="me-1" /> Edit Course
            </Button>
          </PermissionWrapper>
          <div className="vr" style={{ height: '24px', margin: '0 8px' }}></div>
          <PermissionWrapper 
            permission={PERMISSION_IDS.CREATE_SUBJECT}
            fallback={null}
          >
            <Button size="sm" variant="primary" onClick={() => setShowAddSubject(true)}>
              <Plus size={14} className="me-1" /> Add Subject
            </Button>
          </PermissionWrapper>
          <PermissionWrapper 
            permission={PERMISSION_IDS.CREATE_BULK_SUBJECTS}
            fallback={null}
          >
            <Button size="sm" variant="outline-primary" onClick={() => setShowBulkImport(true)}>
              <Upload size={14} className="me-1" /> Import Bulk Subjects
            </Button>
          </PermissionWrapper>
          <PermissionWrapper 
            permission={PERMISSION_IDS.REMOVE_TRAINEE_FROM_ENROLLMENT}
            fallback={null}
          >
            <Button 
              size="sm" 
              variant="outline-danger" 
              onClick={() => setShowDeleteBatchEnrollments(true)}
            >
              <Trash size={14} className="me-1" /> Delete All Subject Enrollments In Course by BatchCode
            </Button>
          </PermissionWrapper>
        </div>
      </div>

      {/* Tab Interface */}
      <Card className="border-0 shadow-sm mb-2">
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Card.Header className="border-bottom py-2 bg-primary">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link 
                  eventKey="course-info" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'course-info' ? '600' : '400',
                    opacity: activeTab === 'course-info' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <Book className="me-2" size={16} />
                  Course Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="subjects" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: activeTab === 'subjects' ? '600' : '400',
                    opacity: activeTab === 'subjects' ? '1' : '0.7',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <FileText className="me-2" size={16} />
                  Subjects
                </Nav.Link>
              </Nav.Item>
              {hasPermission(PERMISSION_IDS.ENROLL_SINGLE_TRAINEE) && (
                <Nav.Item>
                  <Nav.Link 
                    eventKey="trainees" 
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'trainees' ? '600' : '400',
                      opacity: activeTab === 'trainees' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <People className="me-2" size={16} />
                    Trainees Roster
                  </Nav.Link>
                </Nav.Item>
              )}
              {hasPermission(PERMISSION_IDS.ASSIGN_TRAINERS) && (
                <Nav.Item>
                  <Nav.Link 
                    eventKey="assign-trainer" 
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'assign-trainer' ? '600' : '400',
                      opacity: activeTab === 'assign-trainer' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <PersonCheck className="me-2" size={16} />
                    Assign Trainer
                  </Nav.Link>
                </Nav.Item>
              )}
              {!isTraineeView && !isDeptHead && (
                <Nav.Item>
                  <Nav.Link 
                    eventKey="assessment-events" 
                    className="d-flex align-items-center"
                    style={{ 
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      fontWeight: activeTab === 'assessment-events' ? '600' : '400',
                      opacity: activeTab === 'assessment-events' ? '1' : '0.7',
                      borderRadius: '4px 4px 0 0'
                    }}
                  >
                    <CalendarEvent className="me-2" size={16} />
                    All Related Assessment Events
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          </Card.Header>
          
          <Card.Body className="p-0">
            <Tab.Content>
              {/* Course Information Tab */}
              <Tab.Pane eventKey="course-info">
                <div className="p-4">
                  {/* Description - Full Width Row */}
                  <Row className="mb-4">
                    <Col>
                      <div className="mb-4">
                        <h6 className="mb-3" style={{ 
                          color: '#1b3c53', 
                          fontWeight: '800', 
                          fontSize: '1.3rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #d2c1b6',
                          paddingBottom: '0.5rem'
                        }}>Description</h6>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>{courseDetails.description}</p>
                      </div>
                    </Col>
                  </Row>

                  {/* Other Fields - Two Columns */}
                  <Row className="g-4">
                    {/* Left Column */}
                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Course Name</h6>
                        <p className="mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{courseDetails.name}</p>
                      </div>
                      <div className="mb-4">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Course Code</h6>
                        <Badge bg="secondary" className="px-2 py-1">
                          {courseDetails.code}
                        </Badge>
                      </div>
                      <div className="mb-4">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Level</h6>
                        <Badge bg="info" className="px-2 py-1">
                          {courseDetails.level}
                        </Badge>
                      </div>
                      <div className="mb-4">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Start Date</h6>
                        <div className="d-flex align-items-center">
                          <Calendar size={16} className="me-2 text-primary" />
                          <span className="text-dark" style={{ fontSize: '0.9rem' }}>{courseDetails.startDate || 'N/A'}</span>
                        </div>
                      </div>
                    </Col>

                    {/* Right Column */}
                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Max Number of Trainees</h6>
                        <div className="d-flex align-items-center">
                          <PersonCheck size={16} className="me-2 text-primary" />
                          <span className="text-dark" style={{ fontSize: '0.9rem' }}>{courseDetails.maxTrainees}</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Venue</h6>
                        <div className="d-flex align-items-center">
                          <GeoAlt size={16} className="me-2 text-primary" />
                          <span className="text-dark" style={{ fontSize: '0.9rem' }}>{courseDetails.venue}</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Pass Score</h6>
                        <div className="d-flex align-items-center">
                          <Award size={16} className="me-2 text-primary" />
                          <span className="text-dark" style={{ fontSize: '0.9rem' }}>{courseDetails.passScore}</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>Status</h6>
                        <Badge 
                          bg={courseDetails.status === 'ACTIVE' ? 'success' : courseDetails.status === 'ARCHIVED' ? 'warning' : 'secondary'}
                          className="px-2 py-1"
                        >
                          {courseDetails.status}
                        </Badge>
                      </div>
                      <div className="mb-4">
                        <h6 className="mb-2" style={{ 
                          color: '#456882', 
                          fontWeight: '800', 
                          fontSize: '1.15rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>End Date</h6>
                        <div className="d-flex align-items-center">
                          <Calendar size={16} className="me-2 text-primary" />
                          <span className="text-dark" style={{ fontSize: '0.9rem' }}>{courseDetails.endDate || 'N/A'}</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab.Pane>

              {/* Subjects Tab */}
              <Tab.Pane eventKey="subjects">
                <SubjectTable 
                  subjects={subjects}
                  loading={false}
                  onView={handleViewSubject}
                  onEdit={handleEditSubject}
                  onDelete={handleDeleteSubject}
                />
              </Tab.Pane>

              {/* Trainees Tab */}
              {hasPermission(PERMISSION_IDS.ENROLL_SINGLE_TRAINEE) && (
                <Tab.Pane eventKey="trainees" style={{ height: '100%' }}>
                  <EnrolledTraineesTable 
                    courseId={courseId}
                    loading={false}
                    title="Trainees Roster"
                  />
                </Tab.Pane>
              )}

              {/* Assign Trainer Tab */}
              {hasPermission(PERMISSION_IDS.ASSIGN_TRAINERS) && (
                <Tab.Pane eventKey="assign-trainer" style={{ height: '100%' }}>
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 style={{ 
                      color: '#1b3c53', 
                      fontWeight: '800', 
                      fontSize: '1.3rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      borderBottom: '2px solid #d2c1b6',
                      paddingBottom: '0.5rem',
                      margin: 0
                    }}>
                      Assign Trainer to Course
                    </h6>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setShowAddTrainer(true)}
                    >
                      <Plus size={16} className="me-2" />
                      Add Trainer
                    </Button>
                  </div>

                  {/* Trainers Table */}
                  {courseDetails?.instructors && courseDetails.instructors.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover table-sm">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '5%' }}>#</th>
                            <th style={{ width: '15%' }}>EID</th>
                            <th style={{ width: '20%' }}>Name</th>
                            <th style={{ width: '25%' }}>Email</th>
                            <th style={{ width: '15%' }}>Phone</th>
                            <th style={{ width: '15%' }}>Role</th>
                            <th style={{ width: '5%', textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseDetails.instructors.map((trainer, index) => (
                            <tr key={trainer.id}>
                              <td>{index + 1}</td>
                              <td>
                                <Badge bg="info">{trainer.eid}</Badge>
                              </td>
                              <td>
                                <strong>{trainer.firstName} {trainer.middleName} {trainer.lastName}</strong>
                              </td>
                              <td>{trainer.email}</td>
                              <td>{trainer.phoneNumber}</td>
                              <td>
                                {trainer.roleInCourse && trainer.roleInCourse.length > 0 ? (
                                  trainer.roleInCourse.map(role => (
                                    <Badge key={role} bg="success" className="me-1">
                                      {role}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleRemoveTrainer(trainer.id)}
                                  disabled={isAddingTrainer}
                                  title="Remove trainer from course"
                                >
                                  <Trash size={14} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      No trainers assigned yet. Click "Add Trainer" button to assign a trainer to this course.
                    </div>
                  )}
                </div>
              </Tab.Pane>
              )}

              {/* Assessment Events Tab */}
              {!isTraineeView && !isDeptHead && (
                <Tab.Pane eventKey="assessment-events" style={{ height: '100%' }}>
                  <AssessmentEventsList
                    courseId={courseId}
                    onView={(event) => {
                      setSelectedAssessmentEvent(event);
                      setShowAssessmentEventDetail(true);
                    }}
                  />
                </Tab.Pane>
              )}
            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>

      {/* Modals */}
      <AddSubjectModal
        show={showAddSubject}
        onClose={() => setShowAddSubject(false)}
        onSave={handleAddSubject}
        courseId={courseId}
      />

      <BulkImportSubjectsModal
        show={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImportSubjects}
        courseId={courseId}
        courseStartDate={courseDetails?.startDate}
        courseEndDate={courseDetails?.endDate}
      />

      <EditCourseModal
        show={showEditCourse}
        onClose={() => setShowEditCourse(false)}
        onSave={handleEditCourse}
        course={courseDetails || course}
      />

      <AddTrainerModal
        show={showAddTrainer}
        onClose={() => setShowAddTrainer(false)}
        onSave={handleAddTrainer}
        loading={isAddingTrainer}
        courseId={courseId}
      />

      <RemoveTrainerModal
        show={showRemoveTrainer}
        onClose={() => {
          setShowRemoveTrainer(false);
          setSelectedTrainerToRemove(null);
        }}
        onConfirm={handleConfirmRemoveTrainer}
        trainer={selectedTrainerToRemove}
        loading={isAddingTrainer}
      />

      <DisableSubjectModal
        show={showDisableSubject}
        onClose={() => {
          setShowDisableSubject(false);
          setSelectedSubject(null);
        }}
        onDisable={handleConfirmDisableSubject}
        subject={selectedSubject}
        loading={isDisabling}
      />

      <AssessmentEventDetailModal
        show={showAssessmentEventDetail}
        onClose={() => {
          setShowAssessmentEventDetail(false);
          setSelectedAssessmentEvent(null);
        }}
        event={selectedAssessmentEvent}
      />

      <DeleteBatchEnrollmentsModal
        show={showDeleteBatchEnrollments}
        onClose={() => setShowDeleteBatchEnrollments(false)}
        courseId={courseId}
        onSuccess={() => {
          // Optionally refresh course data after deletion
          // You can reload course details here if needed
        }}
      />
    </Container>
  );
};

export default InPageCourseDetail;


