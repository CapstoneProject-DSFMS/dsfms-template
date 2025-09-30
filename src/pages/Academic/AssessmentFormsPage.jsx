import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Dropdown } from 'react-bootstrap';
import { ClipboardCheck, Plus, ThreeDotsVertical, Eye, Pencil, Trash } from 'react-bootstrap-icons';

const AssessmentFormsPage = () => {
  // Mock data - in real app, this would come from API
  const assessmentForms = [
    { 
      id: 1, 
      name: 'Aviation Safety Assessment', 
      course: 'Aviation Safety Fundamentals',
      subject: 'Safety Procedures',
      type: 'Written',
      questions: 25,
      duration: '60 minutes',
      status: 'Active',
      createdDate: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Flight Operations Quiz', 
      course: 'Flight Operations Management',
      subject: 'Navigation Systems',
      type: 'Practical',
      questions: 15,
      duration: '45 minutes',
      status: 'Active',
      createdDate: '2024-02-20'
    },
    { 
      id: 3, 
      name: 'Emergency Response Test', 
      course: 'Emergency Procedures',
      subject: 'Emergency Protocols',
      type: 'Written',
      questions: 30,
      duration: '90 minutes',
      status: 'Draft',
      createdDate: '2024-03-10'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge bg="success">{status}</Badge>;
      case 'Draft':
        return <Badge bg="warning">{status}</Badge>;
      case 'Inactive':
        return <Badge bg="secondary">{status}</Badge>;
      default:
        return <Badge bg="primary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Written':
        return <Badge bg="info">{type}</Badge>;
      case 'Practical':
        return <Badge bg="primary">{type}</Badge>;
      case 'Oral':
        return <Badge bg="success">{type}</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const handleCreateForm = () => {
    console.log('Create new assessment form');
  };

  const handleViewForm = (form) => {
    console.log('View form:', form);
  };

  const handleEditForm = (form) => {
    console.log('Edit form:', form);
  };

  const handleDeleteForm = (form) => {
    console.log('Delete form:', form);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary-custom mb-0 text-mobile-center">Assessment Forms</h1>
          <p className="text-muted">Manage assessment forms and templates.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary-custom text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <ClipboardCheck className="me-2" size={20} />
                Assessment Forms
              </h5>
              <Button 
                variant="light" 
                size="sm"
                onClick={handleCreateForm}
                className="d-flex align-items-center"
              >
                <Plus size={16} className="me-1" />
                Create Form
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Form Name</th>
                    <th>Course</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Questions</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentForms.map((form) => (
                    <tr key={form.id}>
                      <td>
                        <div className="fw-bold">{form.name}</div>
                      </td>
                      <td>{form.course}</td>
                      <td>{form.subject}</td>
                      <td>{getTypeBadge(form.type)}</td>
                      <td>
                        <Badge bg="info">{form.questions}</Badge>
                      </td>
                      <td>{form.duration}</td>
                      <td>{getStatusBadge(form.status)}</td>
                      <td>{form.createdDate}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" className="text-decoration-none">
                            <ThreeDotsVertical size={16} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewForm(form)}>
                              <Eye size={14} className="me-2" />
                              View Form
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditForm(form)}>
                              <Pencil size={14} className="me-2" />
                              Edit Form
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              onClick={() => handleDeleteForm(form)}
                              className="text-danger"
                            >
                              <Trash size={14} className="me-2" />
                              Delete Form
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
    </Container>
  );
};

export default AssessmentFormsPage;
