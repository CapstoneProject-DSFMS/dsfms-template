import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Plus, 
  Pencil, 
  Trash, 
  People,
  Calendar,
  FileText,
  Person
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import { usePermissions } from '../../hooks/usePermissions';
import courseAPI from '../../api/course';
import CourseTable from './CourseTable';
import CourseActions from './CourseActions';
import AddCourseModal from './AddCourseModal';
import DisableCourseModal from './DisableCourseModal';
import DepartmentHeadModal from './DepartmentHeadModal';

const CourseDetailsView = ({ courseId }) => {
  const navigate = useNavigate();
  const { hasPermission, userPermissions } = usePermissions();
  const [course, setCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseModalMode, setCourseModalMode] = useState('add');
  const [showDisableCourse, setShowDisableCourse] = useState(false);
  const [courseToDisable, setCourseToDisable] = useState(null);
  const [departmentHead, setDepartmentHead] = useState(null);
  const [showDepartmentHeadModal, setShowDepartmentHeadModal] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Hardcoded course data
  const hardcodedCourses = {
    1: {
      id: 1,
      name: "Cabin Crew Training",
      code: "CCT",
      description: "Primarily responsible for training and developing flight attendants. The curriculum covers all skills required to work on board, including safety procedures, emergency response, first aid, and customer service.",
      duration: "6 months",
      status: "ACTIVE",
      totalSubjects: 12,
      totalTrainers: 8
    },
    2: {
      id: 2,
      name: "Flight Crew Training",
      code: "FCTD",
      description: "Training for pilots, including captains and first officers. Programs include simulator (SIM) training, type rating courses, and recurrent training to maintain and enhance flying skills.",
      duration: "12 months",
      status: "ACTIVE",
      totalSubjects: 18,
      totalTrainers: 15
    },
    3: {
      id: 3,
      name: "Ground Operations Training",
      code: "GOT",
      description: "A more specialized branch of Ground Training (GAT). It focuses on personnel working directly on the aircraft ramp/apron. Operations include marshalling aircraft into parking positions, operating passenger stairs and baggage vehicles, and carrying out cargo and baggage loading procedures.",
      duration: "4 months",
      status: "ACTIVE",
      totalSubjects: 8,
      totalTrainers: 6
    },
    4: {
      id: 4,
      name: "Ground Affairs Training",
      code: "GAT",
      description: "Responsible for training staff in ground service departments. This area is broad and may include check-in agents, gate agents, baggage service staff, and more.",
      duration: "3 months",
      status: "ACTIVE",
      totalSubjects: 6,
      totalTrainers: 4
    },
    5: {
      id: 5,
      name: "Technical & Aircraft Maintenance",
      code: "TAMT",
      description: "Training for pilots, including captains and first officers. Programs include simulator (SIM) training, type rating courses, and recurrent training to maintain and enhance flying skills.",
      duration: "18 months",
      status: "ACTIVE",
      totalSubjects: 24,
      totalTrainers: 20
    }
  };

  // Hardcoded courses data for the courses table
  const hardcodedCoursesList = [
    { id: 1, name: "Safety Procedures", code: "SAF001", startDate: "2024-01-15", endDate: "2024-01-29", venue: "Training Center A", note: "Basic safety protocols", status: "ACTIVE" },
    { id: 2, name: "Emergency Response", code: "EMR001", startDate: "2024-02-01", endDate: "2024-02-22", venue: "Training Center B", note: "Emergency procedures training", status: "ACTIVE" },
    { id: 3, name: "First Aid", code: "FAD001", startDate: "2024-01-20", endDate: "2024-01-27", venue: "Medical Center", note: "Basic first aid skills", status: "ACTIVE" },
    { id: 4, name: "Customer Service", code: "CSV001", startDate: "2024-02-05", endDate: "2024-02-19", venue: "Training Center A", note: "Customer interaction skills", status: "ACTIVE" },
    { id: 5, name: "Simulator Training", code: "SIM001", startDate: "2024-02-10", endDate: "2024-03-09", venue: "Simulator Complex", note: "Flight simulator training", status: "ACTIVE" },
    { id: 6, name: "Type Rating", code: "TR001", startDate: "2024-03-01", endDate: "2024-04-12", venue: "Training Center C", note: "Aircraft type certification", status: "ACTIVE" },
    { id: 7, name: "Recurrent Training", code: "RT001", startDate: "2024-01-25", endDate: "2024-02-08", venue: "Training Center A", note: "Refresher training", status: "ACTIVE" },
    { id: 8, name: "Aircraft Marshalling", code: "AM001", startDate: "2024-02-15", endDate: "2024-02-22", venue: "Ramp Area", note: "Ground operations", status: "ACTIVE" },
    { id: 9, name: "Baggage Handling", code: "BH001", startDate: "2024-02-20", endDate: "2024-02-27", venue: "Baggage Area", note: "Baggage operations", status: "ACTIVE" },
    { id: 10, name: "Check-in Procedures", code: "CIP001", startDate: "2024-03-05", endDate: "2024-03-12", venue: "Terminal", note: "Passenger check-in", status: "ACTIVE" }
  ];

  useEffect(() => {
    const loadDepartmentData = async () => {
      setLoading(true);
      try {
        console.log('🔍 CourseDetailsView - Loading department with ID:', courseId);
        
        // Fetch combined department and courses data from API endpoint
        const response = await courseAPI.getDepartmentWithCourses(courseId);
        console.log('🔍 CourseDetailsView - Combined API Response:', response);
        
        // API returns the department object directly with courses array inside
        const departmentData = response;
        const coursesData = { courses: response.courses || [] };
        
        // Validate department data
        if (!departmentData) {
          throw new Error('Department data not found in API response');
        }
        
        // Transform department data to course format for compatibility
        const courseData = {
          id: departmentData.id,
          name: departmentData.name,
          code: departmentData.code,
          description: departmentData.description,
          duration: "N/A", // Departments don't have duration
          status: departmentData.isActive,
          totalSubjects: 0, // Will be updated when subjects API is available
          totalTrainers: 0  // Will be updated when trainers API is available
        };
        
        setCourse(courseData);
        
        // Transform API courses data to match expected format
        const transformedCourses = coursesData.courses?.map(course => ({
          id: course.id,
          name: course.name,
          code: course.code,
          startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : 'N/A',
          endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : 'N/A',
          venue: course.venue || 'N/A',
          note: course.note || 'N/A',
          status: course.status,
          description: course.description,
          maxNumTrainee: course.maxNumTrainee,
          passScore: course.passScore,
          level: course.level,
          department: course.department,
          subjectCount: course.subjectCount || 0,
          traineeCount: course.traineeCount || 0,
          trainerCount: course.trainerCount || 0
        })) || [];
        
        setCourses(transformedCourses);
        console.log('🔍 CourseDetailsView - Set courses:', transformedCourses);
        
        // Set department head data
        if (departmentData.headUser) {
          setDepartmentHead(departmentData.headUser);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading department with courses:', error);
        console.error('❌ Error details:', error.response?.data);
        setLoading(false);
        
        // Fallback to hardcoded data if API fails
        const courseData = hardcodedCourses[courseId];
        
        if (courseData) {
          console.log('🔄 Using fallback hardcoded data');
          setCourse(courseData);
          setCourses(hardcodedCoursesList);
        } else {
          console.log('❌ No fallback data available for courseId:', courseId);
        }
      }
    };

    if (courseId) {
      loadDepartmentData();
    }
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps


  const handleCreateCourse = () => {
    // Debug permission checking
    console.log('🔍 Debug Permission Check:');
    console.log('- API_PERMISSIONS.COURSES.CREATE:', API_PERMISSIONS.COURSES.CREATE);
    console.log('- hasPermission result:', hasPermission(API_PERMISSIONS.COURSES.CREATE));
    console.log('- userPermissions count:', userPermissions?.length || 0);
    console.log('- userPermissions:', userPermissions);
    
    setCourseModalMode('add');
    setShowCourseModal(true);
  };

  const handleDisableCourse = (courseId) => {
    console.log('🔍 handleDisableCourse called with courseId:', courseId);
    const courseToDisable = courses.find(c => c.id === courseId);
    console.log('🔍 Found course to disable:', courseToDisable);
    setCourseToDisable(courseToDisable);
    setShowDisableCourse(true);
  };

  const handleConfirmDisableCourse = async (courseId) => {
    console.log('Disabling course:', courseId);
    // TODO: Implement disable course API call
    setShowDisableCourse(false);
    setCourseToDisable(null);
  };

  const handleViewCourse = (courseId) => {
    console.log('🔍 handleViewCourse called with courseId:', courseId);
    navigate(`/academic/course-detail/${courseId}`);
  };


  const handleSaveCourse = async (courseData) => {
    try {
      setIsSavingCourse(true);
      
      // Debug permission before API call
      console.log('🔍 Debug Before API Call:');
      console.log('- Permission check:', hasPermission(API_PERMISSIONS.COURSES.CREATE));
      console.log('- Auth token exists:', !!localStorage.getItem('authToken'));
      
      // Build payload expected by API
      const payload = {
        departmentId: course.id,
        name: courseData.name,
        description: courseData.description,
        code: courseData.code,
        maxNumTrainee: Number(courseData.maxNumTrainee),
        venue: courseData.venue,
        note: courseData.note,
        passScore: Number(courseData.passScore),
        startDate: courseData.startDate ? new Date(courseData.startDate).toISOString() : null,
        endDate: courseData.endDate ? new Date(courseData.endDate).toISOString() : null,
        level: courseData.level
      };

      console.log('📤 Sending payload:', payload);
      const created = await courseAPI.createCourse(payload);

      // Notify user
      toast.success('Course created successfully');

      // Transform for table and update list
      const createdForTable = {
        id: created.id,
        name: created.name,
        code: created.code,
        startDate: created.startDate ? new Date(created.startDate).toISOString().split('T')[0] : 'N/A',
        endDate: created.endDate ? new Date(created.endDate).toISOString().split('T')[0] : 'N/A',
        venue: created.venue || 'N/A',
        note: created.note || 'N/A',
        status: created.status || 'PLANNED',
        description: created.description,
        maxNumTrainee: created.maxNumTrainee,
        passScore: created.passScore,
        level: created.level,
        department: created.department
      };
      setCourses(prev => [createdForTable, ...prev]);
    } catch (error) {
      console.error('❌ Error creating course:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      // Check if it's a permission error
      if (error.response?.status === 403) {
        console.error('🚫 403 Forbidden - Permission denied');
        console.error('🚫 User permissions:', userPermissions);
        console.error('🚫 Required permission:', API_PERMISSIONS.COURSES.CREATE);
      }
      
      toast.error(error.response?.data?.message || 'Failed to create course');
      throw error;
    } finally {
      setIsSavingCourse(false);
    }
  };


  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-4">
        <div className="text-center text-muted">
          <Book size={48} className="mb-3" />
          <h4>Department not found</h4>
          <p>The requested department could not be found.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="d-flex flex-column" style={{ padding: '0.5rem 0', overflowX: 'hidden' }}>
      {/* Department Header */}
      <Row className="mb-1 flex-shrink-0">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-2">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                  <h4 className="mb-1">
                    <Book className="me-2 text-primary" />
                    {course.name}
                  </h4>
                  <p className="text-muted mb-0 small">Department Code: {course.code}</p>
                </div>
              </div>
              
              <p className="text-muted mb-1 small">{course.description}</p>
              
              <Row className="g-2">
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <FileText className="me-2 text-primary" size={16} />
                    <div>
                      <small className="text-muted">Total Subjects</small>
                      <div className="fw-semibold small">{course.totalSubjects}</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <People className="me-2 text-primary" size={16} />
                    <div>
                      <small className="text-muted">Total Trainers</small>
                      <div className="fw-semibold small">{course.totalTrainers}</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <Person className="me-2 text-primary" size={16} />
                    <div>
                      <small className="text-muted">Department Head</small>
                      <div className="fw-semibold small">
                        {departmentHead ? (
                          <Button 
                            variant="link" 
                            className="p-0 text-decoration-none"
                            onClick={() => setShowDepartmentHeadModal(true)}
                            style={{ 
                              fontSize: 'inherit', 
                              fontWeight: 'inherit',
                              color: '#0d6efd' // Bootstrap primary color
                            }}
                          >
                            {departmentHead.firstName} {departmentHead.lastName}
                          </Button>
                        ) : (
                          'Not assigned'
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Courses Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom flex-shrink-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FileText className="me-2" />
                  Courses ({courses.length})
                </h5>
                <PermissionWrapper permission={API_PERMISSIONS.COURSES.CREATE}>
                  <Button variant="primary" size="sm" onClick={handleCreateCourse}>
                    <Plus size={16} className="me-1" />
                    Add New Course
                  </Button>
                </PermissionWrapper>
              </div>
            </Card.Header>
            <div className="p-0">
              <CourseTable
                courses={courses}
                loading={false}
                actionsComponent={CourseActions}
                onView={handleViewCourse}
                onDisable={handleDisableCourse}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* in-page detail removed; navigation now opens dedicated screen */}

      {/* Modals */}
      <AddCourseModal
        show={showCourseModal && courseModalMode === 'add'}
        onClose={() => setShowCourseModal(false)}
        onSave={handleSaveCourse}
        loading={isSavingCourse}
      />


      <DisableCourseModal
        show={showDisableCourse}
        onClose={() => setShowDisableCourse(false)}
        onDisable={handleConfirmDisableCourse}
        course={courseToDisable}
      />

      <DepartmentHeadModal
        show={showDepartmentHeadModal}
        onClose={() => setShowDepartmentHeadModal(false)}
        departmentHead={departmentHead}
        department={course}
      />
    </Container>
  );
};

export default CourseDetailsView;
