import React, { useState } from 'react';
import { Card, Button, Row, Col, Container, Badge } from 'react-bootstrap';
import { Plus, Upload, Pencil, ArrowLeft, People, Calendar, GeoAlt, FileText, Award, PersonCheck, Book } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import SubjectTable from './SubjectTable';
import TraineeCountTable from './TraineeCountTable';
import AddSubjectModal from './AddSubjectModal';
import BulkImportSubjectsModal from './BulkImportSubjectsModal';
import EditCourseModal from './EditCourseModal';

const InPageCourseDetail = ({ course, department, onClose, onEdit }) => {
  const navigate = useNavigate();
  
  // Modal states
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  
  const handleBack = () => {
    // Always navigate back to department details, not browser history
    if (department?.id) {
      navigate(`/academic/course/${department.id}`);
    } else {
      // Fallback to browser history if no department info
      navigate(-1);
    }
  };

  // Mock course details data
  const courseDetails = {
    name: course.name,
    code: course.code,
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

  const handleViewSubject = (subjectId) => {
    navigate(`/academic/subject/${subjectId}`);
  };

  const handleEditSubject = (subjectId) => {
    console.log('Edit subject:', subjectId);
    // TODO: Implement edit subject functionality
  };

  const handleDeleteSubject = (subjectId) => {
    console.log('Delete subject:', subjectId);
    // TODO: Implement delete subject functionality
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
    console.log('Bulk importing subjects:', subjectsData);
    // TODO: Implement bulk import API call
    setShowBulkImport(false);
  };

  const handleEditCourse = async (courseData) => {
    console.log('Editing course:', courseData);
    // TODO: Implement edit course API call
    setShowEditCourse(false);
  };

  return (
    <Container fluid className="py-3 course-detail">
      {/* Header với nút Back */}
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
          <h4 className="mb-0 text-primary">
            <strong>{course.name}</strong> — {course.code}
          </h4>
          <small className="text-muted">Course Details</small>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
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
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom py-3">
          <h5 className="mb-0">
            <Book className="me-2" />
            Course Information
          </h5>
        </Card.Header>
        <Card.Body className="py-4">
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
                  bg={courseDetails.status === 'ACTIVE' ? 'success' : courseDetails.status === 'INACTIVE' ? 'danger' : 'secondary'}
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
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-4 pb-3">
              <h5 className="mb-0">Subjects</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <SubjectTable 
                course={course}
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
          <TraineeCountTable course={course} />
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
      />

      <EditCourseModal
        show={showEditCourse}
        onClose={() => setShowEditCourse(false)}
        onSave={handleEditCourse}
        course={course}
      />
    </Container>
  );
};

export default InPageCourseDetail;


