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

const CourseDetailsView = ({ courseId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

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
    },
    6: {
      id: 6,
      name: "Safety & Quality Assurance",
      code: "SQA",
      description: "An independent oversight unit responsible for inspecting, evaluating, and ensuring that all training programs across departments (CCT, FCTD, GOT, etc.) comply with the safety standards of the Civil Aviation Authority and the airline.",
      duration: "2 months",
      status: "ACTIVE",
      totalSubjects: 4,
      totalTrainers: 3
    }
  };

  // Hardcoded subjects data
  const hardcodedSubjects = {
    1: [
      { id: 1, name: "Safety Procedures", code: "SAF001", duration: "2 weeks", status: "ACTIVE", trainers: 2 },
      { id: 2, name: "Emergency Response", code: "EMR001", duration: "3 weeks", status: "ACTIVE", trainers: 3 },
      { id: 3, name: "First Aid", code: "FAD001", duration: "1 week", status: "ACTIVE", trainers: 1 },
      { id: 4, name: "Customer Service", code: "CSV001", duration: "2 weeks", status: "ACTIVE", trainers: 2 }
    ],
    2: [
      { id: 5, name: "Simulator Training", code: "SIM001", duration: "4 weeks", status: "ACTIVE", trainers: 4 },
      { id: 6, name: "Type Rating", code: "TR001", duration: "6 weeks", status: "ACTIVE", trainers: 5 },
      { id: 7, name: "Recurrent Training", code: "RT001", duration: "2 weeks", status: "ACTIVE", trainers: 3 }
    ],
    3: [
      { id: 8, name: "Aircraft Marshalling", code: "AM001", duration: "1 week", status: "ACTIVE", trainers: 2 },
      { id: 9, name: "Baggage Handling", code: "BH001", duration: "1 week", status: "ACTIVE", trainers: 2 }
    ],
    4: [
      { id: 10, name: "Check-in Procedures", code: "CIP001", duration: "1 week", status: "ACTIVE", trainers: 1 },
      { id: 11, name: "Gate Operations", code: "GO001", duration: "1 week", status: "ACTIVE", trainers: 1 }
    ],
    5: [
      { id: 12, name: "Engine Maintenance", code: "EM001", duration: "6 weeks", status: "ACTIVE", trainers: 4 },
      { id: 13, name: "Avionics", code: "AV001", duration: "4 weeks", status: "ACTIVE", trainers: 3 }
    ],
    6: [
      { id: 14, name: "Quality Auditing", code: "QA001", duration: "1 week", status: "ACTIVE", trainers: 1 },
      { id: 15, name: "Safety Standards", code: "SS001", duration: "1 week", status: "ACTIVE", trainers: 1 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    const loadCourseData = () => {
      setLoading(true);
      setTimeout(() => {
        const courseData = hardcodedCourses[courseId];
        const subjectsData = hardcodedSubjects[courseId] || [];
        
        setCourse(courseData);
        setSubjects(subjectsData);
        setLoading(false);
      }, 500);
    };

    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const handleCreateCourse = () => {
    console.log('Create Course clicked');
    // TODO: Implement create course functionality
  };

  const handleEditCourse = () => {
    console.log('Edit Course clicked');
    // TODO: Implement edit course functionality
  };

  const handleDeleteCourse = () => {
    console.log('Delete Course clicked');
    // TODO: Implement delete course functionality
  };

  const handleCreateSubject = () => {
    console.log('Create Subject clicked');
    // TODO: Implement create subject functionality
  };

  const handleEditSubject = (subjectId) => {
    console.log('Edit Subject clicked:', subjectId);
    // TODO: Implement edit subject functionality
  };

  const handleDeleteSubject = (subjectId) => {
    console.log('Delete Subject clicked:', subjectId);
    // TODO: Implement delete subject functionality
  };

  const handleViewSubject = (subjectId) => {
    console.log('View Subject clicked:', subjectId);
    navigate(`/academic/subject/${subjectId}`);
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
          <h4>Course not found</h4>
          <p>The requested course could not be found.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Course Header */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-2">
                    <Book className="me-2 text-primary" />
                    {course.name}
                  </h2>
                  <p className="text-muted mb-0">Course Code: {course.code}</p>
                </div>
                <div className="d-flex gap-2">
                  <PermissionWrapper permission={API_PERMISSIONS.COURSES.CREATE}>
                    <Button variant="outline-primary" size="sm" onClick={handleCreateCourse}>
                      <Plus size={16} className="me-1" />
                      Create Course
                    </Button>
                  </PermissionWrapper>
                  <PermissionWrapper permission={API_PERMISSIONS.COURSES.UPDATE}>
                    <Button variant="outline-secondary" size="sm" onClick={handleEditCourse}>
                      <Pencil size={16} className="me-1" />
                      Edit Course
                    </Button>
                  </PermissionWrapper>
                  <PermissionWrapper permission={API_PERMISSIONS.COURSES.DELETE}>
                    <Button variant="outline-danger" size="sm" onClick={handleDeleteCourse}>
                      <Trash size={16} className="me-1" />
                      Delete Course
                    </Button>
                  </PermissionWrapper>
                </div>
              </div>
              
              <p className="text-muted mb-3">{course.description}</p>
              
              <Row>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <Clock className="me-2 text-primary" />
                    <div>
                      <small className="text-muted">Duration</small>
                      <div className="fw-semibold">{course.duration}</div>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <FileText className="me-2 text-primary" />
                    <div>
                      <small className="text-muted">Total Subjects</small>
                      <div className="fw-semibold">{course.totalSubjects}</div>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <People className="me-2 text-primary" />
                    <div>
                      <small className="text-muted">Total Trainers</small>
                      <div className="fw-semibold">{course.totalTrainers}</div>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <Badge bg="success" className="me-2">
                      {course.status}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Subjects Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FileText className="me-2" />
                  Subjects ({subjects.length})
                </h5>
                <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.CREATE}>
                  <Button variant="primary" size="sm" onClick={handleCreateSubject}>
                    <Plus size={16} className="me-1" />
                    Create Subject
                  </Button>
                </PermissionWrapper>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {subjects.length > 0 ? (
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Subject Name</th>
                      <th>Code</th>
                      <th>Duration</th>
                      <th>Trainers</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject.id}>
                        <td>
                          <div 
                            className="fw-semibold text-primary cursor-pointer"
                            onClick={() => handleViewSubject(subject.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {subject.name}
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">{subject.code}</Badge>
                        </td>
                        <td>{subject.duration}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <People size={14} className="me-1" />
                            {subject.trainers}
                          </div>
                        </td>
                        <td>
                          <Badge bg="success">{subject.status}</Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.VIEW_DETAIL}>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleViewSubject(subject.id)}
                              >
                                View
                              </Button>
                            </PermissionWrapper>
                            <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.UPDATE}>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => handleEditSubject(subject.id)}
                              >
                                <Pencil size={14} />
                              </Button>
                            </PermissionWrapper>
                            <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.DELETE}>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteSubject(subject.id)}
                              >
                                <Trash size={14} />
                              </Button>
                            </PermissionWrapper>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <FileText size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No subjects found</h5>
                  <p className="text-muted">This course doesn't have any subjects yet.</p>
                  <PermissionWrapper permission={API_PERMISSIONS.SUBJECTS.CREATE}>
                    <Button variant="primary" onClick={handleCreateSubject}>
                      <Plus size={16} className="me-1" />
                      Create First Subject
                    </Button>
                  </PermissionWrapper>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetailsView;
