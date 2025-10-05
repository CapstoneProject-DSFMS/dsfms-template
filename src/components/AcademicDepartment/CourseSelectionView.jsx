import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { 
  Book, 
  Building,
  ArrowRight
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';

const CourseSelectionView = () => {
  const { user } = useAuth();

  // Hardcoded courses data
  const courses = [
    { id: 1, name: "Cabin Crew Training", code: "CCT", description: "Training for flight attendants including safety procedures and customer service." },
    { id: 2, name: "Flight Crew Training", code: "FCTD", description: "Training for pilots including simulator training and type rating courses." },
    { id: 3, name: "Ground Operations Training", code: "GOT", description: "Training for ground operations personnel including aircraft marshalling." },
    { id: 4, name: "Ground Affairs Training", code: "GAT", description: "Training for ground service staff including check-in and gate operations." },
    { id: 5, name: "Technical & Aircraft Maintenance", code: "TAMT", description: "Training for aircraft maintenance technicians and engineers." },
    { id: 6, name: "Safety & Quality Assurance", code: "SQA", description: "Training for safety and quality assurance personnel." }
  ];

  const handleCourseSelect = (courseId) => {
    // Navigate to course details
    window.location.href = `/academic/course/${courseId}`;
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <Building size={48} className="text-primary mb-3" />
            <h2 className="mb-2">Academic Department Management</h2>
            <p className="text-muted">Select a course to view details and manage subjects</p>
          </div>
        </Col>
      </Row>

      <Row>
        {courses.map((course) => (
          <Col key={course.id} md={6} lg={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm course-card">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="course-icon me-3">
                    <Book size={24} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="mb-1">{course.name}</h5>
                    <Badge bg="secondary" className="text-white">
                      {course.code}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-muted mb-3">{course.description}</p>
                
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={() => handleCourseSelect(course.id)}
                >
                  View Details
                  <ArrowRight size={16} className="ms-2" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CourseSelectionView;
