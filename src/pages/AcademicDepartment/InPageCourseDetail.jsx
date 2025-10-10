import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Container, Badge } from 'react-bootstrap';
import { Plus, Upload, Pencil, ArrowLeft, People, Calendar, GeoAlt, FileText, Award, PersonCheck, Book, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import courseAPI from '../../api/course';
import subjectAPI from '../../api/subject';
import SubjectTable from '../../components/AcademicDepartment/SubjectTable';
import TraineeCountTable from '../../components/AcademicDepartment/TraineeCountTable';
import AddSubjectModal from '../../components/AcademicDepartment/AddSubjectModal';
import BulkImportSubjectsModal from '../../components/AcademicDepartment/BulkImportSubjectsModal';
import EditCourseModal from '../../components/AcademicDepartment/EditCourseModal';
import DisableSubjectModal from '../../components/AcademicDepartment/DisableSubjectModal';

const InPageCourseDetail = ({ course, department, onClose, onEdit }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
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
  const [hasApiData, setHasApiData] = useState(false); // Track if we have API data
  
  // Collapse states for tables
  const [isCourseInfoCollapsed, setIsCourseInfoCollapsed] = useState(false);
  const [isSubjectsCollapsed, setIsSubjectsCollapsed] = useState(false);
  const [isTraineesCollapsed, setIsTraineesCollapsed] = useState(false);
  
  // Load subjects from API
  const loadSubjects = async () => {
    try {
      console.log('🔍 InPageCourseDetail - Loading subjects from API...');
      const response = await subjectAPI.getSubjects();
      console.log('🔍 InPageCourseDetail - Subjects API Response:', response);
      
      if (response && response.subjects) {
        setSubjects(response.subjects);
        setHasApiData(true);
        console.log('✅ InPageCourseDetail - Loaded subjects:', response.subjects.length);
      }
    } catch (error) {
      console.error('❌ InPageCourseDetail - Error loading subjects:', error);
      console.error('❌ Error details:', error.response?.data);
      // Keep existing subjects (mock data) if API fails
    }
  };

  // Fetch course details from API
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        console.log('🔍 InPageCourseDetail - Loading course with ID:', courseId);
        const response = await courseAPI.getCourseById(courseId);
        console.log('🔍 InPageCourseDetail - API Response:', response);
        
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
      } catch (error) {
        console.error('❌ Error loading course details:', error);
        console.error('❌ Error details:', error.response?.data);
        setLoading(false);
        
        // Fallback to hardcoded data if API fails
        const fallbackCourseDetails = {
          name: course?.name || 'Course Name',
          code: course?.code || 'COURSE001',
          description: "Comprehensive safety procedures training covering emergency protocols, evacuation procedures, and safety equipment usage. This course ensures all personnel are equipped with essential safety knowledge and skills required for aviation operations.",
          maxTrainees: 50,
          venue: "Training Center A - Room 101",
          note: "This course is mandatory for all new employees and requires annual recertification.",
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
  }, [courseId, course]);
  
  const handleBack = () => {
    // Always navigate back to department details, not browser history
    if (department?.id) {
      navigate(`/academic/course/${department.id}`);
    } else {
      // Fallback to browser history if no department info
      navigate(-1);
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
    console.log('🔍 handleViewSubject - courseId:', courseId, 'subjectId:', subjectId);
    navigate(`/academic/course/${courseId}/subject/${subjectId}`);
  };

  const handleEditSubject = (subjectId) => {
    console.log('Edit subject:', subjectId);
    // TODO: Implement edit subject functionality
  };

  const handleDeleteSubject = (subjectId) => {
    console.log('Delete subject:', subjectId);
    // Find the subject from mock data
    const mockSubjects = [
      { id: 's1', name: 'Safety Basics', code: 'SB01', description: 'Basic safety procedures training' },
      { id: 's2', name: 'Evacuation Drills', code: 'ED02', description: 'Emergency evacuation procedures' },
      { id: 's3', name: 'CPR & First Aid', code: 'FA03', description: 'Cardiopulmonary resuscitation and first aid' },
      { id: 's4', name: 'Fire Safety', code: 'FS04', description: 'Fire prevention and safety measures' },
      { id: 's5', name: 'Emergency Procedures', code: 'EP05', description: 'General emergency response procedures' }
    ];
    
    const subject = mockSubjects.find(s => s.id === subjectId);
    if (subject) {
      setSelectedSubject(subject);
      setShowDisableSubject(true);
    }
  };

  const handleConfirmDisableSubject = async (subjectId) => {
    console.log('Disabling subject:', subjectId);
    setIsDisabling(true);
    try {
      // TODO: Implement disable subject API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      console.log('Subject disabled successfully!');
      
      // Close modal
      setShowDisableSubject(false);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error disabling subject:', error);
    } finally {
      setIsDisabling(false);
    }
  };

  const handleEnrollTrainees = () => {
    navigate(`/academic/course/${course.id}/enroll-trainees`);
  };

  // Modal handlers
  const handleAddSubject = async (subjectData) => {
    console.log('Adding subject:', subjectData);
    // TODO: Implement add subject API call
    setShowAddSubject(false);
  };

  const handleBulkImportSubjects = async (subjectsData) => {
    console.log('🔍 InPageCourseDetail - Bulk importing subjects:', subjectsData);
    console.log('🔍 InPageCourseDetail - Number of subjects:', subjectsData.length);
    console.log('🔍 InPageCourseDetail - First subject sample:', subjectsData[0]);
    
    try {
      // Call bulk import API
      const response = await subjectAPI.bulkImportSubjects(subjectsData);
      console.log('✅ InPageCourseDetail - Bulk import API response:', response);
      
      // Reload subjects from API to get updated data
      await loadSubjects();
      
      setShowBulkImport(false);
      console.log('✅ Bulk import completed successfully');
    } catch (error) {
      console.error('❌ Error during bulk import:', error);
      // Fallback to local state if API fails
      const newSubjects = subjectsData.map((subject, index) => ({
        id: `imported_${Date.now()}_${index}`,
        name: subject.name,
        code: subject.code,
        method: subject.method || 'THEORY',
        duration: subject.duration ? `${subject.duration} days` : '1 week',
        startDate: subject.start_date ? new Date(subject.start_date).toLocaleDateString() : '',
        endDate: subject.end_date ? new Date(subject.end_date).toLocaleDateString() : '',
        roomName: subject.room_name || 'TBD',
        trainees: 0,
        status: 'ACTIVE',
        source: 'bulk_import' // Mark as bulk imported
      }));
      
      // Smart merge: Add new subjects to existing subjects, avoid duplicates
      setSubjects(prevSubjects => {
        const existingCodes = new Set(prevSubjects.map(s => s.code));
        const uniqueNewSubjects = newSubjects.filter(s => !existingCodes.has(s.code));
        
        return [...prevSubjects, ...uniqueNewSubjects];
      });
      
      setShowBulkImport(false);
    }
  };

  const handleEditCourse = async (courseData) => {
    console.log('Editing course:', courseData);
    // TODO: Implement edit course API call
    setShowEditCourse(false);
  };

  return (
    <Container fluid className="py-3 course-detail">
      {/* Header với nút Back */}
      <div className="d-flex align-items-center mb-4">
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
      <div className="d-flex justify-content-between align-items-center mb-5">
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

      {/* Course Details Section */}
      <Card className="border-0 shadow-sm mb-5">
        <Card.Header 
          className="border-bottom py-3 collapsible-header"
          onClick={() => setIsCourseInfoCollapsed(!isCourseInfoCollapsed)}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <Book className="me-2" />
              Course Information
            </h5>
            <ChevronDown 
              size={20} 
              className={`text-muted chevron-icon ${isCourseInfoCollapsed ? 'rotated' : ''}`}
            />
          </div>
        </Card.Header>
        <Card.Body className={`py-4 collapsible-content ${isCourseInfoCollapsed ? 'collapsed' : 'expanded'}`}>
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

            {/* Note */}
            <Col md={12}>
              <div className="mb-0">
                <h6 className="text-muted mb-2">Note</h6>
                <div className="d-flex align-items-start">
                  <FileText size={16} className="me-2 text-primary mt-1" />
                  <p className="mb-0 text-muted small">{courseDetails.note}</p>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Content */}
      <Row className="g-4 mt-4">
        {/* Subjects Table - Full Width */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm mb-5">
            <Card.Header 
              className="border-bottom py-4 pb-3 collapsible-header"
              onClick={() => setIsSubjectsCollapsed(!isSubjectsCollapsed)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Subjects</h5>
                <ChevronDown 
                  size={20} 
                  className={`text-muted chevron-icon ${isSubjectsCollapsed ? 'rotated' : ''}`}
                />
              </div>
            </Card.Header>
            <Card.Body className={`p-0 collapsible-content ${isSubjectsCollapsed ? 'collapsed' : 'expanded'}`}>
                <SubjectTable 
                  subjects={subjects}
                  loading={false}
                  onView={handleViewSubject}
                  onEdit={handleEditSubject}
                  onDelete={handleDeleteSubject}
                />
            </Card.Body>
          </Card>
        </Col>
        
        {/* Trainees Roster - Full Width */}
        <Col xs={12}>
          <div className="mb-5">
            <TraineeCountTable 
              course={course} 
              isCollapsed={isTraineesCollapsed}
              onToggleCollapse={() => setIsTraineesCollapsed(!isTraineesCollapsed)}
            />
          </div>
        </Col>
      </Row>

      {/* Modals */}
      <AddSubjectModal
        show={showAddSubject}
        onClose={() => setShowAddSubject(false)}
        onSave={handleAddSubject}
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


