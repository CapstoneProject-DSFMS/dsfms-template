import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { 
  Book, 
  Building,
  ArrowRight
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useDepartmentManagement from '../../hooks/useDepartmentManagement';

const CourseSelectionView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { departments, loading: departmentsLoading, error } = useDepartmentManagement();

  // Filter active departments
  const activeDepartments = departments.filter(dept => dept.status === 'ACTIVE');

  const handleDepartmentSelect = (departmentId) => {
    // Navigate to department details using React Router
    navigate(`/academic/course/${departmentId}`);
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <Building size={48} className="text-primary mb-3" />
            <h2 className="mb-2">Academic Department Management</h2>
            <p className="text-muted">Select a department to view its details, including list of courses and related subjects</p>
          </div>
        </Col>
      </Row>

      <Row>
        {departmentsLoading ? (
          <Col className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading departments...</p>
          </Col>
        ) : error ? (
          <Col className="text-center py-5">
            <p className="text-danger">Error loading departments: {error.message}</p>
          </Col>
        ) : (
          activeDepartments.map((department) => (
            <Col key={department.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm course-card d-flex flex-column">
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div className="course-icon me-3">
                      <Book size={24} className="text-primary" />
                    </div>
                    <div>
                      <h5 className="mb-1">{department.name}</h5>
                      <Badge bg="secondary" className="text-white">
                        {department.code}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted mb-3 flex-grow-1">{department.description}</p>
                  
                  <Button 
                    variant="outline-primary" 
                    className="w-100 mt-auto"
                    onClick={() => handleDepartmentSelect(department.id)}
                  >
                    View Details
                    <ArrowRight size={16} className="ms-2" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default CourseSelectionView;
