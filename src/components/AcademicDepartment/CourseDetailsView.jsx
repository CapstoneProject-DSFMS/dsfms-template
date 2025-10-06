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
  Clock,
  FileText
} from 'react-bootstrap-icons';
import { PermissionWrapper } from '../Common';
import { API_PERMISSIONS } from '../../constants/apiPermissions';
import { useAuth } from '../../hooks/useAuth';
import { departmentAPI } from '../../api/department';
import CourseTable from './CourseTable';
import CourseActions from './CourseActions';

const CourseDetailsView = ({ courseId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseModalMode, setCourseModalMode] = useState('add');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showInPageDetail, setShowInPageDetail] = useState(false);

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
    { id: 1, name: "Safety Procedures", code: "SAF001", duration: "2 weeks", status: "ACTIVE", trainers: 2 },
    { id: 2, name: "Emergency Response", code: "EMR001", duration: "3 weeks", status: "ACTIVE", trainers: 3 },
    { id: 3, name: "First Aid", code: "FAD001", duration: "1 week", status: "ACTIVE", trainers: 1 },
    { id: 4, name: "Customer Service", code: "CSV001", duration: "2 weeks", status: "ACTIVE", trainers: 2 },
    { id: 5, name: "Simulator Training", code: "SIM001", duration: "4 weeks", status: "ACTIVE", trainers: 4 },
    { id: 6, name: "Type Rating", code: "TR001", duration: "6 weeks", status: "ACTIVE", trainers: 5 },
    { id: 7, name: "Recurrent Training", code: "RT001", duration: "2 weeks", status: "ACTIVE", trainers: 3 },
    { id: 8, name: "Aircraft Marshalling", code: "AM001", duration: "1 week", status: "ACTIVE", trainers: 2 },
    { id: 9, name: "Baggage Handling", code: "BH001", duration: "1 week", status: "ACTIVE", trainers: 2 },
    { id: 10, name: "Check-in Procedures", code: "CIP001", duration: "1 week", status: "ACTIVE", trainers: 1 }
  ];

  useEffect(() => {
    const loadDepartmentData = async () => {
      setLoading(true);
      try {
        console.log('🔍 CourseDetailsView - Loading department with ID:', courseId);
        // Fetch department data from API
        const response = await departmentAPI.getDepartmentById(courseId);
        console.log('🔍 CourseDetailsView - API Response:', response);
        const departmentData = response;
        
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
        setCourses(hardcodedCoursesList); // Use hardcoded courses for now
        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading department:', error);
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
  }, [courseId]);


  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setCourseModalMode('add');
    setShowCourseModal(true);
  };

  const handleEditCourse = (courseId) => {
    const courseToEdit = courses.find(c => c.id === courseId);
    setSelectedCourse(courseToEdit);
    setCourseModalMode('edit');
    setShowCourseModal(true);
  };

  const handleDeleteCourse = (courseId) => {
    console.log('Delete Course clicked:', courseId);
    // TODO: Implement delete course functionality
  };

  const handleViewCourse = (courseId) => {
    navigate(`/academic/course-detail/${courseId}`);
  };

  const handleSaveCourse = async (courseData) => {
    console.log('Saving course:', courseData);
    return Promise.resolve();
  };

  const handleCloseCourseModal = () => {
    setShowCourseModal(false);
    setSelectedCourse(null);
    setCourseModalMode('add');
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
    <Container className="d-flex flex-column" style={{ height: '100vh', overflow: 'hidden', padding: '0.5rem 0' }}>
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
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <Clock className="me-2 text-primary" size={16} />
                    <div>
                      <small className="text-muted">Duration</small>
                      <div className="fw-semibold small">{course.duration}</div>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <FileText className="me-2 text-primary" size={16} />
                    <div>
                      <small className="text-muted">Total Subjects</small>
                      <div className="fw-semibold small">{course.totalSubjects}</div>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <People className="me-2 text-primary" size={16} />
                    <div>
                      <small className="text-muted">Total Trainers</small>
                      <div className="fw-semibold small">{course.totalTrainers}</div>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <Badge bg="success" className="me-2 small">
                      {course.status}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Courses Section */}
      <Row className="flex-grow-1" style={{ minHeight: 0 }}>
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
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* in-page detail removed; navigation now opens dedicated screen */}

  </Container>
);
};

export default CourseDetailsView;
