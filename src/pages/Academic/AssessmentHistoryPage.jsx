import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { BarChart, Search, Download } from 'react-bootstrap-icons';

const AssessmentHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app, this would come from API
  const assessmentHistory = [
    { 
      id: 1, 
      traineeName: 'John Doe', 
      course: 'Aviation Safety Fundamentals',
      subject: 'Safety Procedures',
      assessmentType: 'Written',
      score: 85,
      maxScore: 100,
      status: 'Passed',
      completedDate: '2024-12-10',
      duration: '45 minutes'
    },
    { 
      id: 2, 
      traineeName: 'Jane Smith', 
      course: 'Flight Operations Management',
      subject: 'Navigation Systems',
      assessmentType: 'Practical',
      score: 92,
      maxScore: 100,
      status: 'Passed',
      completedDate: '2024-12-08',
      duration: '60 minutes'
    },
    { 
      id: 3, 
      traineeName: 'Mike Johnson', 
      course: 'Emergency Procedures',
      subject: 'Emergency Protocols',
      assessmentType: 'Written',
      score: 78,
      maxScore: 100,
      status: 'Failed',
      completedDate: '2024-12-05',
      duration: '90 minutes'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Passed':
        return <Badge bg="success">{status}</Badge>;
      case 'Failed':
        return <Badge bg="danger">{status}</Badge>;
      case 'In Progress':
        return <Badge bg="warning">{status}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
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

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-danger';
  };

  const filteredHistory = assessmentHistory.filter(assessment =>
    assessment.traineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportReport = () => {
    console.log('Export assessment history report');
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-primary-custom mb-0 text-mobile-center">Assessment History</h1>
          <p className="text-muted">View and analyze assessment results and history.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary-custom text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <BarChart className="me-2" size={20} />
                Assessment History
              </h5>
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={handleExportReport}
                className="d-flex align-items-center"
              >
                <Download size={16} className="me-1" />
                Export Report
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Search assessments..."
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
                    <th>Course</th>
                    <th>Subject</th>
                    <th>Assessment Type</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Completed Date</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((assessment) => (
                    <tr key={assessment.id}>
                      <td>
                        <div className="fw-bold">{assessment.traineeName}</div>
                      </td>
                      <td>{assessment.course}</td>
                      <td>{assessment.subject}</td>
                      <td>{getTypeBadge(assessment.assessmentType)}</td>
                      <td>
                        <span className={`fw-bold ${getScoreColor(assessment.score, assessment.maxScore)}`}>
                          {assessment.score}/{assessment.maxScore}
                        </span>
                      </td>
                      <td>{getStatusBadge(assessment.status)}</td>
                      <td>{assessment.completedDate}</td>
                      <td>{assessment.duration}</td>
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

export default AssessmentHistoryPage;
