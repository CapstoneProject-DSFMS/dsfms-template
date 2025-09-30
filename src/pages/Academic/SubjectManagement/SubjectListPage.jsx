import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Dropdown } from 'react-bootstrap';
import { Plus, ThreeDotsVertical, Eye, Pencil, Trash, Upload } from 'react-bootstrap-icons';
import SubjectModal from '../../../components/Academic/Subject/SubjectModal';

const SubjectListPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Mock data - in real app, this would come from API
  const subjects = [
    { 
      id: 1, 
      name: 'Aviation Safety Procedures', 
      course: 'Aviation Safety Fundamentals',
      trainer: 'John Smith',
      duration: '2 weeks',
      status: 'Active',
      trainees: 25
    },
    { 
      id: 2, 
      name: 'Flight Navigation Systems', 
      course: 'Flight Operations Management',
      trainer: 'Sarah Johnson',
      duration: '3 weeks',
      status: 'Active',
      trainees: 18
    },
    { 
      id: 3, 
      name: 'Emergency Response Protocols', 
      course: 'Emergency Procedures',
      trainer: 'Mike Davis',
      duration: '1 week',
      status: 'Inactive',
      trainees: 32
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

  const handleCreateSubject = () => {
    setEditingSubject(null);
    setShowModal(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setShowModal(true);
  };

  const handleViewSubject = (subject) => {
    // Navigate to subject details
    console.log('View subject:', subject);
  };

  const handleDeleteSubject = (subject) => {
    // Handle delete subject
    console.log('Delete subject:', subject);
  };

  const handleBulkImport = () => {
    // Navigate to bulk import page
    console.log('Navigate to bulk import');
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary-custom mb-0 text-mobile-center">Subject Management</h1>
          <p className="text-muted">Manage all subjects and their details.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary-custom text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Subject List</h5>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={handleBulkImport}
                  className="d-flex align-items-center"
                >
                  <Upload size={16} className="me-1" />
                  Bulk Import
                </Button>
                <Button 
                  variant="light" 
                  size="sm"
                  onClick={handleCreateSubject}
                  className="d-flex align-items-center"
                >
                  <Plus size={16} className="me-1" />
                  Add Subject
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Course</th>
                    <th>Trainer</th>
                    <th>Duration</th>
                    <th>Trainees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>
                        <div>
                          <div className="fw-bold">{subject.name}</div>
                        </div>
                      </td>
                      <td>{subject.course}</td>
                      <td>{subject.trainer}</td>
                      <td>
                        <Badge bg="info">{subject.duration}</Badge>
                      </td>
                      <td>
                        <Badge bg="primary">{subject.trainees}</Badge>
                      </td>
                      <td>{getStatusBadge(subject.status)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" className="text-decoration-none">
                            <ThreeDotsVertical size={16} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewSubject(subject)}>
                              <Eye size={14} className="me-2" />
                              View Details
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditSubject(subject)}>
                              <Pencil size={14} className="me-2" />
                              Edit Subject
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => handleDeleteSubject(subject)}
                              className="text-danger"
                            >
                              <Trash size={14} className="me-2" />
                              Delete Subject
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

      <SubjectModal 
        show={showModal}
        onHide={() => setShowModal(false)}
        subject={editingSubject}
        onSave={(subjectData) => {
          console.log('Save subject:', subjectData);
          setShowModal(false);
        }}
      />
    </Container>
  );
};

export default SubjectListPage;
