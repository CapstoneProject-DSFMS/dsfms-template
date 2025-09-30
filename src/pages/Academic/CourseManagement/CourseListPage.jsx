import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Dropdown } from 'react-bootstrap';
import { Plus, ThreeDotsVertical, Eye, Pencil, Trash } from 'react-bootstrap-icons';
import CourseModal from '../../../components/Academic/CourseModal';

const CourseListPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Mock data - in real app, this would come from API
  const courses = [
    { 
      id: 1, 
      name: 'Aviation Safety Fundamentals', 
      department: 'Safety Department',
      subjects: 8,
      trainees: 25,
      status: 'Active',
      createdDate: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Flight Operations Management', 
      department: 'Operations Department',
      subjects: 12,
      trainees: 18,
      status: 'Active',
      createdDate: '2024-02-20'
    },
    { 
      id: 3, 
      name: 'Emergency Procedures', 
      department: 'Safety Department',
      subjects: 6,
      trainees: 32,
      status: 'Inactive',
      createdDate: '2024-03-10'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge bg="success">{status}</Badge>;
      case 'Inactive':
        return <Badge bg="secondary">{status}</Badge>;
      default:
        return <Badge bg="primary">{status}</Badge>;
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleViewCourse = (course) => {
    // Navigate to course details
    console.log('View course:', course);
  };

  const handleDeleteCourse = (course) => {
    // Handle delete course
    console.log('Delete course:', course);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary-custom mb-0 text-mobile-center">Course Management</h1>
          <p className="text-muted">Manage all courses and their details.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary-custom text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Course List</h5>
              <Button 
                variant="light" 
                size="sm"
                onClick={handleCreateCourse}
                className="d-flex align-items-center"
              >
                <Plus size={16} className="me-1" />
                Create Course
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Department</th>
                    <th>Subjects</th>
                    <th>Trainees</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div>
                          <div className="fw-bold">{course.name}</div>
                        </div>
                      </td>
                      <td>{course.department}</td>
                      <td>
                        <Badge bg="info">{course.subjects}</Badge>
                      </td>
                      <td>
                        <Badge bg="primary">{course.trainees}</Badge>
                      </td>
                      <td>{getStatusBadge(course.status)}</td>
                      <td>{course.createdDate}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" className="text-decoration-none">
                            <ThreeDotsVertical size={16} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewCourse(course)}>
                              <Eye size={14} className="me-2" />
                              View Details
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditCourse(course)}>
                              <Pencil size={14} className="me-2" />
                              Edit Course
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => handleDeleteCourse(course)}
                              className="text-danger"
                            >
                              <Trash size={14} className="me-2" />
                              Delete Course
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <CourseModal 
        show={showModal}
        onHide={() => setShowModal(false)}
        course={editingCourse}
        onSave={(courseData) => {
          console.log('Save course:', courseData);
          setShowModal(false);
        }}
      />
    </Container>
  );
};

export default CourseListPage;
