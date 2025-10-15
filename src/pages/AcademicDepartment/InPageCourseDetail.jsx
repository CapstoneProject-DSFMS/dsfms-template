import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Row, Col, Container, Badge, Nav, Tab } from 'react-bootstrap';
import { Plus, Upload, Pencil, ArrowLeft, People, Calendar, GeoAlt, FileText, Award, PersonCheck, Book } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import courseAPI from '../../api/course';
import subjectAPI from '../../api/subject';
import SubjectTable from '../../components/AcademicDepartment/SubjectTable';
import TraineeCountTable from '../../components/AcademicDepartment/TraineeCountTable';
import AddSubjectModal from '../../components/AcademicDepartment/AddSubjectModal';
import BulkImportSubjectsModal from '../../components/AcademicDepartment/BulkImportSubjectsModal';
import EditCourseModal from '../../components/AcademicDepartment/EditCourseModal';
import DisableSubjectModal from '../../components/AcademicDepartment/DisableSubjectModal';

const InPageCourseDetail = ({ course, department }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  console.log('🔍 InPageCourseDetail - courseId from URL params:', courseId);
  console.log('🔍 InPageCourseDetail - course prop:', course);
  console.log('🔍 InPageCourseDetail - department prop:', department);
  
  // Modal states
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showDisableSubject, setShowDisableSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isDisabling, setIsDisabling] = useState(false);
  
  // Course details state
  const [courseDetails, setCourseDetails] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [hasApiData, setHasApiData] = useState(false); // Track if we have API data
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('course-info');
  
  // Load subjects from API
  const loadSubjects = useCallback(async () => {
    console.log('🔍 Loading subjects...');
    
    try {
      const response = await subjectAPI.getSubjects();
      console.log('🔍 API Response:', response);
      
      if (response && response.subjects) {
        console.log('🔍 Found subjects:', response.subjects.length, 'subjects');
        setSubjects(response.subjects);
      } else {
        console.log('🔍 No subjects found in response');
        setSubjects([]);
      }
    } catch (error) {
      console.error('❌ Error loading subjects:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      // Keep existing subjects if API fails (fallback behavior)
    }
  }, []);

  // Load courses from API - This function is not needed for course detail page
  const loadCourses = useCallback(async () => {
    // This function is not needed for course detail page
    // We already load course details in the main useEffect
    return;
  }, []);

  // Load courses when component mounts
  useEffect(() => {
    loadCourses();
  }, [courseId, loadCourses]);

  // Fetch course details from API
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        const response = await courseAPI.getCourseById(courseId);
        
        // Transform API data to match component format
        const transformedCourseDetails = {
          name: response.name,
          code: response.code,
          description: response.description,
          maxTrainees: response.maxNumTrainee,
          venue: response.venue,
          note: response.note,
          passScore: response.passScore,
          startDate: response.startDate ? new Date(response.startDate).toISOString().split('T')[0] : 'N/A',
          endDate: response.endDate ? new Date(response.endDate).toISOString().split('T')[0] : 'N/A',
          level: response.level,
          status: response.status,
          department: response.department,
          subjectCount: response.subjectCount || 0,
          traineeCount: response.traineeCount || 0,
          trainerCount: response.trainerCount || 0,
          subjects: response.subjects || []
        };
        
        setCourseDetails(transformedCourseDetails);
        setLoading(false);
      } catch {
        setLoading(false);
        
        // Fallback to hardcoded data if API fails
        const fallbackCourseDetails = {
          name: course?.name || 'Course Name',
          code: course?.code || 'COURSE001',
          description: "Comprehensive safety procedures training covering emergency protocols, evacuation procedures, and safety equipment usage. This course ensures all personnel are equipped with essential safety knowledge and skills required for aviation operations.",
          maxTrainees: 50,
          venue: "Training Center A - Room 101",
          note: "",
          passScore: 80,
          startDate: "2024-01-15",
          endDate: "2024-01-29",
          level: "Intermediate",
          status: "ACTIVE"
        };
        setCourseDetails(fallbackCourseDetails);
      }
    };

    loadCourseDetails();
    loadSubjects(); // Load subjects from API
  }, [courseId, course, loadSubjects]);
  
  const handleBack = () => {
    // Navigate back to department details using the correct route
    if (department?.id) {
      navigate(`/academic/course/${department.id}`);
    } else {
      // Fallback to department list if no department info
      navigate('/academic/departments');
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
            Back to Department
          </Button>
        </div>
      </Container>
    );
  }

  const handleViewSubject = (subjectId) => {
    navigate(`/academic/course/${courseId}/subject/${subjectId}`);
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
      // Call API to disable subject
      await subjectAPI.deleteSubject(selectedSubject.id);
      
      // Reload subjects to get updated data
      await loadSubjects();
      
      // Close modal
      setShowDisableSubject(false);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error disabling subject:', error);
      // Handle error - could show toast notification
    } finally {
      setIsDisabling(false);
    }
  };

  const handleEnrollTrainees = () => {
    navigate(`/academic/course/${course.id}/enroll-trainees`);
  };

  // Modal handlers
  const handleAddSubject = async (subjectData) => {
    try {
      // Call API to create subject
      await subjectAPI.createSubject({
        ...subjectData,
        courseId: courseId
      });
      
      // Reload subjects to get updated data
      await loadSubjects();
      
      setShowAddSubject(false);
    } catch (error) {
      console.error('Error adding subject:', error);
      // Handle error - could show toast notification
    }
  };

  const handleBulkImportSubjects = async (subjectsData) => {
    try {
      // Call bulk import API
      await subjectAPI.bulkImportSubjects(subjectsData);
      
      // Reload subjects from API to get updated data
      await loadSubjects();
      
      setShowBulkImport(false);
    } catch (error) {
      console.error('Error bulk importing subjects:', error);
      // Handle error - could show toast notification
      // Don't close modal on error so user can retry
    }
  };

  const handleEditCourse = async (updatedCourseData) => {
    try {
      // Call API to update course
      await courseAPI.updateCourse(courseId, updatedCourseData);
      
      // Reload course details to get updated data
      const response = await courseAPI.getCourseById(courseId);
      const transformedCourseDetails = {
        name: response.name,
        code: response.code,
        description: response.description,
        maxTrainees: response.maxNumTrainee,
        venue: response.venue,
        note: response.note,
        passScore: response.passScore,
        startDate: response.startDate ? new Date(response.startDate).toISOString().split('T')[0] : 'N/A',
        endDate: response.endDate ? new Date(response.endDate).toISOString().split('T')[0] : 'N/A',
        level: response.level,
        status: response.status,
        department: response.department,
        subjectCount: response.subjectCount || 0,
        traineeCount: response.traineeCount || 0,
        trainerCount: response.trainerCount || 0,
        subjects: response.subjects || []
      };
      setCourseDetails(transformedCourseDetails);
      
      setShowEditCourse(false);
    } catch (error) {
      console.error('Error updating course:', error);
      // Handle error - could show toast notification
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
            <strong>{course.name}</strong> — {course.code}
          </h4>
          <small className="text-muted">Course Details</small>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* Left Group - Enroll Trainees */}
        <div className="d-flex">
          <Button size="sm" variant="primary" onClick={handleEnrollTrainees}>
            <People size={14} className="me-1" /> Enroll Trainees
          </Button>
        </div>

        {/* Right Group - Subject Management & Edit Course */}
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary" onClick={() => setShowEditCourse(true)}>
            <Pencil size={14} className="me-1" /> Edit Course
          </Button>
          <div className="vr" style={{ height: '24px', margin: '0 8px' }}></div>
          <Button size="sm" variant="primary" onClick={() => setShowAddSubject(true)}>
            <Plus size={14} className="me-1" /> Add Subject
          </Button>
          <Button size="sm" variant="outline-primary" onClick={() => setShowBulkImport(true)}>
            <Upload size={14} className="me-1" /> Import Bulk Subjects
          </Button>
        </div>
      </div>

      {/* Tab Interface */}
      <Card className="border-0 shadow-sm mb-2">
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Card.Header className="border-bottom py-2">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link 
                  eventKey="course-info" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    color: activeTab === 'course-info' ? '#0d6efd' : '#6c757d',
                    fontWeight: activeTab === 'course-info' ? '600' : '400'
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
                    color: activeTab === 'subjects' ? '#0d6efd' : '#6c757d',
                    fontWeight: activeTab === 'subjects' ? '600' : '400'
                  }}
                >
                  <FileText className="me-2" size={16} />
                  Subjects
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="trainees" 
                  className="d-flex align-items-center"
                  style={{ 
                    border: 'none',
                    color: activeTab === 'trainees' ? '#0d6efd' : '#6c757d',
                    fontWeight: activeTab === 'trainees' ? '600' : '400'
                  }}
                >
                  <People className="me-2" size={16} />
                  Trainees Roster
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          
          <Card.Body className="p-0">
            <Tab.Content>
              {/* Course Information Tab */}
              <Tab.Pane eventKey="course-info">
                <div className="p-4">
                  <Row className="g-4">
                    {/* Basic Information */}
                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Course Name</h6>
                        <p className="mb-0 fw-semibold">{courseDetails.name}</p>
                      </div>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Course Code</h6>
                        <Badge bg="secondary" className="px-2 py-1">
                          {courseDetails.code}
                        </Badge>
                      </div>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Description</h6>
                        <p className="mb-0 text-muted small">{courseDetails.description}</p>
                      </div>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Level</h6>
                        <Badge bg="info" className="px-2 py-1">
                          {courseDetails.level}
                        </Badge>
                      </div>
                    </Col>

                    {/* Training Details */}
                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Max Number of Trainees</h6>
                        <div className="d-flex align-items-center">
                          <PersonCheck size={16} className="me-2 text-primary" />
                          <span className="fw-semibold">{courseDetails.maxTrainees}</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Venue</h6>
                        <div className="d-flex align-items-center">
                          <GeoAlt size={16} className="me-2 text-primary" />
                          <span className="fw-semibold">{courseDetails.venue}</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Pass Score</h6>
                        <div className="d-flex align-items-center">
                          <Award size={16} className="me-2 text-primary" />
                          <span className="fw-semibold">{courseDetails.passScore}%</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Status</h6>
                        <Badge 
                          bg={courseDetails.status === 'ACTIVE' ? 'success' : courseDetails.status === 'ARCHIVED' ? 'warning' : 'secondary'}
                          className="px-2 py-1"
                        >
                          {courseDetails.status}
                        </Badge>
                      </div>
                    </Col>

                    {/* Date Information */}
                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Start Date</h6>
                        <div className="d-flex align-items-center">
                          <Calendar size={16} className="me-2 text-primary" />
                          <span className="fw-semibold">{courseDetails.startDate}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">End Date</h6>
                        <div className="d-flex align-items-center">
                          <Calendar size={16} className="me-2 text-primary" />
                          <span className="fw-semibold">{courseDetails.endDate}</span>
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
              <Tab.Pane eventKey="trainees" style={{ height: '100%' }}>
                <TraineeCountTable 
                  course={course}
                  loading={false}
                  onView={(trainee) => {
                    // Handle view trainee details
                    console.log('View trainee:', trainee);
                  }}
                  onRemove={(trainee) => {
                    // Handle remove trainee from course
                    console.log('Remove trainee:', trainee);
                  }}
                />
              </Tab.Pane>
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
      />

      <EditCourseModal
        show={showEditCourse}
        onClose={() => setShowEditCourse(false)}
        onSave={handleEditCourse}
        course={course}
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
    </Container>
  );
};

export default InPageCourseDetail;


