import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { People, Plus, Search } from 'react-bootstrap-icons';

const TraineeEnrollmentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app, this would come from API
  const trainees = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john.doe@example.com',
      department: 'Safety',
      course: 'Aviation Safety Fundamentals',
      enrollmentDate: '2024-01-15',
      status: 'Enrolled'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane.smith@example.com',
      department: 'Operations',
      course: 'Flight Operations Management',
      enrollmentDate: '2024-02-20',
      status: 'Enrolled'
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike.johnson@example.com',
      department: 'Safety',
      course: 'Emergency Procedures',
      enrollmentDate: '2024-03-10',
      status: 'Completed'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Enrolled':
        return <Badge bg="success">{status}</Badge>;
      case 'Completed':
        return <Badge bg="primary">{status}</Badge>;
      case 'Dropped':
        return <Badge bg="danger">{status}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const filteredTrainees = trainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainee.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary-custom mb-0 text-mobile-center">Trainee Enrollment</h1>
          <p className="text-muted">Manage trainee enrollment and course assignments.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary-custom text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <People className="me-2" size={20} />
                Enrolled Trainees
              </h5>
              <Button 
                variant="light" 
                size="sm"
                className="d-flex align-items-center"
              >
                <Plus size={16} className="me-1" />
                Enroll Trainee
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Search trainees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ps-5"
                      />
                      <Search 
                        size={16} 
                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Trainee Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Enrollment Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainees.map((trainee) => (
                    <tr key={trainee.id}>
                      <td>
                        <div className="fw-bold">{trainee.name}</div>
                      </td>
                      <td>{trainee.email}</td>
                      <td>
                        <Badge bg="info">{trainee.department}</Badge>
                      </td>
                      <td>{trainee.course}</td>
                      <td>{trainee.enrollmentDate}</td>
                      <td>{getStatusBadge(trainee.status)}</td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TraineeEnrollmentPage;
