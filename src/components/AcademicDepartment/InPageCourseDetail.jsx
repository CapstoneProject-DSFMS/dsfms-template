import React from 'react';
import { Card, Button, Row, Col, Container } from 'react-bootstrap';
import { Plus, Upload, Pencil, ArrowLeft, People } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import SubjectTable from './SubjectTable';
import TraineeCountTable from './TraineeCountTable';

const InPageCourseDetail = ({ course, department, onClose, onEdit }) => {
  const navigate = useNavigate();

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

  return (
    <Container fluid className="py-3">
      {/* Header với nút Back */}
      <div className="d-flex align-items-center mb-3">
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={() => navigate(-1)}
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
      <div className="d-flex justify-content-end mb-3">
        <div className="d-flex gap-2">
          <Button size="sm" variant="success" onClick={handleEnrollTrainees}>
            <People size={14} className="me-1" /> Enroll Trainees
          </Button>
          <Button size="sm" variant="primary">
            <Plus size={14} className="me-1" /> Add Subject
          </Button>
          <Button size="sm" variant="outline-primary">
            <Upload size={14} className="me-1" /> Import Bulk Subjects
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={onEdit}>
            <Pencil size={14} className="me-1" /> Edit Course
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Row className="g-3">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
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
        <Col lg={4}>
          <TraineeCountTable course={course} />
        </Col>
      </Row>
    </Container>
  );
};

export default InPageCourseDetail;


